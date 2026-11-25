"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@mitodl/smoot-design"
import { PRODUCT, priceBasket } from "@/lib/cart"
import { modeInfo, type ModeKey } from "@/lib/modes"
import { createSession, runExportCheck } from "@/lib/api"
import { detailsComplete, updatePlayground, usePlayground } from "@/lib/playground"
import { Card, CheckoutSteps, Columns, Heading, Muted, Notice, OrderSummary, Stack } from "@/components/ui"
import { ProductCard } from "@/components/cart/ProductCard"
import { DetailsCard } from "@/components/cart/DetailsCard"
import { DiscountCodeField } from "@/components/cart/DiscountCodeField"

export default function CartPage({ modeKey, canceled }: { modeKey: ModeKey | undefined; canceled: boolean }) {
  const mode = modeInfo(modeKey)
  const router = useRouter()
  const { state, hydrated } = usePlayground()
  const basket = priceBasket(state)
  const [editingDetails, setEditingDetails] = React.useState(false)
  const [showDetailErrors, setShowDetailErrors] = React.useState(false)
  const [busy, setBusy] = React.useState<string>()
  const [error, setError] = React.useState<string>()

  const showDetailsForm = editingDetails || !state.addressOnFile

  /** Saves the details to the "profile" if they're complete; says whether they were. */
  const saveDetails = () => {
    if (!detailsComplete(state.details)) {
      setShowDetailErrors(true)
      document.getElementById("your-details")?.scrollIntoView({ behavior: "smooth", block: "start" })
      return false
    }
    updatePlayground({ addressOnFile: true })
    setEditingDetails(false)
    setShowDetailErrors(false)
    return true
  }

  // Hosted and embedded give us no hook between the learner's click and the
  // charge, so the export check has to pass before Stripe's UI loads. Form
  // and Elements run it on the Checkout page, just before confirming.
  const checksHere = mode.key === "hosted" || mode.key === "embedded"

  const proceed = async () => {
    setError(undefined)
    if (showDetailsForm && !saveDetails()) return
    try {
      if (checksHere) {
        setBusy("Checking your details…")
        await runExportCheck(state.exportCheck === "fail")
      }
      if (mode.key === "hosted") {
        setBusy("Opening Stripe…")
        const res = await createSession("hosted_page", {
          branding: state.branding,
          discountCode: state.discountCode,
        })
        if (!("url" in res)) throw new Error("Expected a redirect URL")
        window.location.assign(res.url)
        return
      }
      router.push(`/checkout?mode=${mode.key}`)
    } catch (err) {
      setError((err as Error).message)
      setBusy(undefined)
    }
  }

  return (
    <>
      <CheckoutSteps current="cart" mode={mode} />
      {canceled && (
        <Notice kind="warn" style={{ marginBottom: 24 }}>
          You left Stripe&apos;s page without paying. Nothing was charged.
        </Notice>
      )}
      <Heading>Your cart</Heading>
      <Columns>
        <Stack>
          {basket.product ? (
            <ProductCard product={basket.product} onRemove={() => updatePlayground({ inCart: false })} />
          ) : (
            <Card>
              <p style={{ marginTop: 0 }}>Your cart is empty.</p>
              <Button variant="secondary" size="small" onClick={() => updatePlayground({ inCart: true })}>
                Put {PRODUCT.name} back
              </Button>
            </Card>
          )}
          <DetailsCard
            details={state.details}
            showForm={showDetailsForm}
            showErrors={showDetailErrors}
            onEdit={() => setEditingDetails(true)}
            onSave={saveDetails}
          />
        </Stack>
        <OrderSummary basket={basket}>
          {basket.product && <DiscountCodeField current={state.discountCode} />}
          <Button
            variant="primary"
            onClick={proceed}
            disabled={!hydrated || !basket.product || !!busy}
            style={{ width: "100%", marginTop: 24 }}
          >
            {busy ?? "Continue to payment"}
          </Button>
          <Muted style={{ marginBottom: 0 }}>
            {mode.key === "hosted"
              ? "Next, you'll pay on Stripe's secure page."
              : "Next, you'll enter your card. You won't be charged until you pay."}
          </Muted>
          {error && (
            <Notice kind="error" style={{ marginTop: 16 }}>
              {error}
            </Notice>
          )}
        </OrderSummary>
      </Columns>
    </>
  )
}
