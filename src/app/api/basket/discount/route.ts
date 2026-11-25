import { NextResponse, type NextRequest } from "next/server"
import { applyDiscountCode } from "@/lib/cart"

export type DiscountResponse = { discountCode: string | null }

/**
 * Stands in for MITx Online's `add_discount_to_basket` (POST with a
 * `discount_code` query param). The basket lives in the browser here, so the
 * client sends its current code in the body.
 */
export async function POST(request: NextRequest) {
  const typed = request.nextUrl.searchParams.get("discount_code") ?? ""
  const body = (await request.json().catch(() => ({}))) as { current?: string | null }
  await new Promise((r) => setTimeout(r, 300))
  const result = applyDiscountCode(body.current ?? null, typed)
  if (!result.found) {
    return NextResponse.json({ error: `Discount '${typed}' not found` }, { status: 404 })
  }
  const payload: DiscountResponse = { discountCode: result.discountCode }
  return NextResponse.json(payload)
}
