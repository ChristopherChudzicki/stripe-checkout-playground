"use client"

import React from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { createClientSecret } from "@/lib/api"
import { Card } from "@/components/ui"
import { StripeRegion } from "@/components/experiment"
import type { CheckoutViewProps } from "./CheckoutPage"

/**
 * Stripe draws everything here, including its own order summary and Pay
 * button. The export check already ran on the Cart: embedded checkout has no
 * hook between the click and the charge.
 */
export function EmbeddedView({ stripePromise, state, log }: CheckoutViewProps) {
  const { discountCode } = state
  const fetchClientSecret = React.useCallback(async () => {
    const secret = await createClientSecret("embedded_page", discountCode)
    log("created embedded_page session", { discountCode })
    return secret
  }, [discountCode, log])

  return (
    <Card>
      <StripeRegion>
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{
            fetchClientSecret,
            onComplete: () => log("onComplete fired (Stripe then redirects to return_url)"),
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </StripeRegion>
    </Card>
  )
}
