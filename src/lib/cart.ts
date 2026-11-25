/**
 * The product, discounts and pricing rules, shared by the pages (for display)
 * and the API routes (for Stripe line items). Discounts follow MITx Online's
 * rules: one discount per basket, an automatic promotion competes with any
 * typed code, and the cheapest price wins.
 */
export type Product = {
  sku: string
  kind: string
  name: string
  /** Shown under the name on Stripe's pages. */
  description: string
  /** Under `public/`. */
  imagePath: string
  starts: string
  listPriceCents: number
}

export const PRODUCT: Product = {
  sku: "program-v1:MITx+SDS",
  kind: "Program",
  name: "Statistics and Data Science",
  description:
    "Left column background matches Learn's light gray background. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  imagePath: "/images/default_resource.jpg",
  starts: "Anytime",
  listPriceCents: 135000,
}

export type Discount = { code: string | null; label: string; percent: number }

/** Applies without a code, like an MITx Online automatic discount. */
export const AUTOMATIC_DISCOUNT: Discount = { code: null, label: "Promotional Savings", percent: 15 }

/** Codes a learner can type. Upper-case, matched case-insensitively. */
export const DISCOUNT_CODES: Record<string, number> = { LEVELUP: 25, WELCOME10: 10 }

export const normalizeCode = (code: string) => code.trim().toUpperCase()

function discountFor(code: string | null): Discount {
  const percent = code ? DISCOUNT_CODES[code] : undefined
  if (code && percent !== undefined && percent > AUTOMATIC_DISCOUNT.percent) {
    return { code, label: code, percent }
  }
  return AUTOMATIC_DISCOUNT
}

export type BasketState = { inCart: boolean; discountCode: string | null }

export type PricedBasket = {
  product: Product | null
  discount: Discount | null
  listCents: number
  discountCents: number
  totalCents: number
}

export function priceBasket({ inCart, discountCode }: BasketState): PricedBasket {
  if (!inCart) return { product: null, discount: null, listCents: 0, discountCents: 0, totalCents: 0 }
  const discount = discountFor(discountCode)
  const listCents = PRODUCT.listPriceCents
  const discountCents = Math.round((listCents * discount.percent) / 100)
  return { product: PRODUCT, discount, listCents, discountCents, totalCents: listCents - discountCents }
}

/**
 * MITx Online's add-discount endpoint: 404 for an unknown code; otherwise the
 * basket, with the code applied only if it lowers the price. A code that
 * doesn't beat the current discount is dropped silently, so the client has to
 * compare the basket before and after to tell the learner.
 */
export function applyDiscountCode(
  current: string | null,
  typed: string,
): { found: false } | { found: true; discountCode: string | null } {
  const code = normalizeCode(typed)
  if (!(code in DISCOUNT_CODES)) return { found: false }
  const before = discountFor(current).percent
  return { found: true, discountCode: DISCOUNT_CODES[code] > before ? code : current }
}

export const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })
