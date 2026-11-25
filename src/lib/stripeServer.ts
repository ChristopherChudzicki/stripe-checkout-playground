import Stripe from "stripe"
import { priceBasket } from "./cart"
import { modeForUiMode, type UiMode } from "./modes"

let client: Stripe | undefined

/**
 * The Stripe client, created on first use so `next build` works without keys.
 * Refuses anything but a test-mode secret or restricted key.
 */
export function stripe(): Stripe {
  if (client) return client
  const key = process.env.STRIPE_SECRET_KEY ?? ""
  if (!/^(sk|rk)_test_/.test(key)) {
    throw new Error(
      "STRIPE_SECRET_KEY must be a test-mode key (sk_test_... or rk_test_...). See .env.example.",
    )
  }
  client = new Stripe(key)
  return client
}

export function publishableKey(): string {
  const key = process.env.STRIPE_PUBLISHABLE_KEY ?? ""
  if (!key.startsWith("pk_test_")) {
    throw new Error("STRIPE_PUBLISHABLE_KEY must be a test-mode key (pk_test_...).")
  }
  return key
}

/** Marks sessions this app created, so the summary route serves only those. */
export const SESSION_SOURCE = "stripe-checkout-playground"

/** Approximates MIT Learn's palette; Stripe only accepts a few named fonts here. */
const LEARN_BRANDING: Stripe.Checkout.SessionCreateParams.BrandingSettings = {
  display_name: "MIT Learn",
  button_color: "#750014",
  // Learn's page background (smoot-design's lightGray1).
  background_color: "#f3f4f8",
  border_style: "rounded",
  font_family: "inter",
}

/**
 * Stripe downloads product images itself, so it can't reach one on localhost;
 * there, use the copy in the public GitHub repo.
 */
function imageUrl(origin: string, path: string) {
  const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:|$)/.test(origin)
  return local
    ? `https://raw.githubusercontent.com/ChristopherChudzicki/stripe-checkout-playground/main/public${path}`
    : `${origin}${path}`
}

/**
 * Session parameters shaped like the ones MITx Online sends (ol-django's
 * StripeGateway.prepare_checkout): inline prices that already include any
 * discount, inclusive tax, a client_reference_id and the customer's email.
 */
export function sessionParams(
  uiMode: UiMode,
  origin: string,
  { branding = false, discountCode = null }: { branding?: boolean; discountCode?: string | null } = {},
): Stripe.Checkout.SessionCreateParams {
  const completeUrl = `${origin}/complete?mode=${modeForUiMode(uiMode)!.key}&session_id={CHECKOUT_SESSION_ID}`
  const basket = priceBasket({ inCart: true, discountCode })
  const product = basket.product!
  const base: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    ui_mode: uiMode,
    client_reference_id: `playground-${Date.now()}`,
    customer_email: "learner@example.com",
    metadata: { source: SESSION_SOURCE, discount: basket.discount?.code ?? "automatic" },
    // Cards only, as MITx Online's RC sessions offer. Without this, Stripe
    // offers whatever the account's Dashboard enables (Link, Klarna, ...).
    allowed_payment_method_types: ["card"],
    // Link adds its own options (Bank, Klarna) even on a card-only session.
    wallet_options: { link: { display: "never" } },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: basket.totalCents,
          tax_behavior: "inclusive",
          product_data: {
            name: product.name,
            description: product.description,
            images: [imageUrl(origin, product.imagePath)],
            metadata: { sku: product.sku },
          },
        },
      },
    ],
  }

  if (uiMode === "hosted_page") {
    // success_url and cancel_url are accepted only for hosted pages; the
    // other modes take a single return_url.
    return {
      ...base,
      success_url: completeUrl,
      cancel_url: `${origin}/?mode=hosted&canceled=1`,
      ...(branding ? { branding_settings: LEARN_BRANDING } : {}),
    }
  }
  return { ...base, return_url: completeUrl }
}
