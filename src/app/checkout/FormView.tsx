"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { CheckoutForm, CheckoutFormProvider, useCheckoutForm } from "@stripe/react-stripe-js/checkout"
import { createClientSecret, runExportCheck } from "@/lib/api"
import { LEARN_APPEARANCE } from "@/lib/appearance"
import { Card, Notice } from "@/components/ui"
import { StripeRegion } from "@/components/experiment"
import type { CheckoutViewProps } from "./CheckoutPage"

type FormProps = Pick<CheckoutViewProps, "state" | "log"> & {
  onError: (message: string) => void
  onBlocked: (message: string) => void
}

function Form({ state, log, onError, onBlocked }: FormProps) {
  const result = useCheckoutForm()
  const router = useRouter()

  if (result.type === "loading") return <p>Loading Stripe&hellip;</p>
  if (result.type === "error") return <Notice kind="error">{result.error.message}</Notice>
  const { checkout } = result

  return (
    <StripeRegion>
      <CheckoutForm
        // Stripe's promotion codes aren't MITx Online's discounts; codes go in on the Cart.
        options={{ features: { promotionCodeCollection: "never" } }}
        onReady={() => log("checkout form ready")}
        onConfirm={async (event) => {
          onError("")
          log("form emitted confirm; running the export check before confirm()")
          try {
            await runExportCheck(state.exportCheck === "fail")
          } catch (err) {
            log("export check failed; not calling confirm()", String(err))
            onBlocked((err as Error).message)
            return
          }
          try {
            const res = await checkout.confirm({ formConfirmEvent: event, redirect: "if_required" })
            log("confirm result", res.type === "error" ? res.error : { type: res.type })
            if (res.type === "error") {
              onError(res.error.message)
              return
            }
            router.push(`/complete?mode=form&session_id=${encodeURIComponent(checkout.id)}`)
          } catch (err) {
            // Stripe also throws (e.g. IntegrationError) rather than returning an error.
            log("confirm threw", String(err))
            onError((err as Error).message)
          }
        }}
      />
    </StripeRegion>
  )
}

function Session({ stripePromise, state, log, onError, onBlocked }: Omit<CheckoutViewProps, "onSnapshot"> & Omit<FormProps, "state" | "log">) {
  // The provider reads its options once, so create the session once per mount.
  const [clientSecret] = React.useState(() =>
    createClientSecret("form", state.discountCode).then((secret) => {
      log("created form session", { discountCode: state.discountCode })
      return secret
    }),
  )
  return (
    <CheckoutFormProvider stripe={stripePromise} options={{ clientSecret, appearance: LEARN_APPEARANCE }}>
      <Form state={state} log={log} onError={onError} onBlocked={onBlocked} />
    </CheckoutFormProvider>
  )
}

export function FormView(props: CheckoutViewProps) {
  const [error, setError] = React.useState("")
  // Once the form emits confirm, it stays locked (greyed fields, a Pay
  // button that does nothing) until confirm() is called; remounting the
  // CheckoutForm doesn't unlock it. When our check stops a payment, start
  // over with a fresh session.
  const [attempt, setAttempt] = React.useState(0)
  const onBlocked = React.useCallback(
    (message: string) => {
      setError(message)
      setAttempt((a) => a + 1)
      props.log("starting a new session to unlock the form")
    },
    [props],
  )

  return (
    <Card>
      <Session key={attempt} {...props} onError={setError} onBlocked={onBlocked} />
      {error && (
        <Notice kind="error" style={{ marginTop: 16 }}>
          {error}
        </Notice>
      )}
    </Card>
  )
}
