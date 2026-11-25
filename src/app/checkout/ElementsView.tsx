"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@mitodl/smoot-design"
import { CheckoutElementsProvider, PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout"
import { createClientSecret, runExportCheck } from "@/lib/api"
import { LEARN_APPEARANCE } from "@/lib/appearance"
import { Card, Muted, Notice, SectionHeading } from "@/components/ui"
import { StripeRegion } from "@/components/experiment"
import type { CheckoutViewProps } from "./CheckoutPage"

function Payment({ state, log, onSnapshot }: Omit<CheckoutViewProps, "stripePromise">) {
  const result = useCheckoutElements()
  const router = useRouter()
  const [error, setError] = React.useState<string>()
  const [busy, setBusy] = React.useState<string>()

  const checkout = result.type === "success" ? result.checkout : undefined
  // The hook can hand back a new object on every render, so key the snapshot
  // on the fields that matter rather than on object identity.
  const sessionKey = checkout
    ? JSON.stringify([checkout.canConfirm, checkout.total.total.amount, checkout.billingAddress])
    : ""
  const latest = React.useRef(checkout)
  latest.current = checkout
  React.useEffect(() => {
    if (latest.current) onSnapshot(JSON.parse(JSON.stringify(latest.current)))
  }, [sessionKey, onSnapshot])

  if (result.type === "loading") return <p>Loading Stripe&hellip;</p>
  if (result.type === "error") return <Notice kind="error">{result.error.message}</Notice>
  const c = result.checkout

  const pay = async () => {
    setError(undefined)
    // Stripe's actions can throw as well as return {type: "error"}.
    try {
      setBusy("Checking your details…")
      log("running the export check before confirm()")
      await runExportCheck(state.exportCheck === "fail")
      setBusy("Paying…")
      log("calling confirm()")
      const res = await c.confirm({ redirect: "if_required" })
      log("confirm result", res.type === "error" ? res.error : { type: res.type, status: res.session.status })
      if (res.type === "error") throw new Error(res.error.message)
      router.push(`/complete?mode=elements&session_id=${encodeURIComponent(c.id)}`)
    } catch (err) {
      log("payment stopped", String(err))
      setError((err as Error).message)
      setBusy(undefined)
    }
  }

  return (
    <>
      <StripeRegion>
        <PaymentElement
          options={{
            // Link adds its own rows (Bank, Klarna) even on a card-only session.
            wallets: { link: "never" },
          }}
        />
      </StripeRegion>
      {error && (
        <Notice kind="error" style={{ marginTop: 16 }}>
          {error}
        </Notice>
      )}
      <Button
        variant="primary"
        onClick={pay}
        disabled={!!busy || !c.canConfirm}
        style={{ width: "100%", marginTop: 24 }}
      >
        {busy ?? `Pay ${c.total.total.amount}`}
      </Button>
      <Muted style={{ marginBottom: 0 }}>Your card is charged when you click Pay.</Muted>
    </>
  )
}

export function ElementsView({ stripePromise, state, log, onSnapshot }: CheckoutViewProps) {
  // The provider reads its options once, so create the session once per mount.
  const [clientSecret] = React.useState(() =>
    createClientSecret("elements", state.discountCode).then((secret) => {
      log("created elements session", { discountCode: state.discountCode })
      return secret
    }),
  )

  return (
    <Card>
      <SectionHeading>Payment</SectionHeading>
      <CheckoutElementsProvider
        stripe={stripePromise}
        options={{ clientSecret, elementsOptions: { appearance: LEARN_APPEARANCE } }}
      >
        <Payment state={state} log={log} onSnapshot={onSnapshot} />
      </CheckoutElementsProvider>
    </Card>
  )
}
