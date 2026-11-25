import { NextResponse, type NextRequest } from "next/server"
import Stripe from "stripe"
import { UI_MODES, type UiMode } from "@/lib/modes"
import { sessionParams, stripe } from "@/lib/stripeServer"

export type CreateSessionResponse = { url: string } | { clientSecret: string }

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    uiMode?: string
    branding?: boolean
    discountCode?: string | null
  }
  if (!UI_MODES.includes(body.uiMode as UiMode)) {
    return NextResponse.json(
      { error: `uiMode must be one of ${UI_MODES.join(", ")}` },
      { status: 400 },
    )
  }
  const uiMode = body.uiMode as UiMode

  try {
    const session = await stripe().checkout.sessions.create(
      sessionParams(uiMode, request.nextUrl.origin, {
        branding: body.branding,
        discountCode: body.discountCode ?? null,
      }),
    )
    const payload: CreateSessionResponse =
      uiMode === "hosted_page"
        ? { url: session.url! }
        : { clientSecret: session.client_secret! }
    return NextResponse.json(payload)
  } catch (err) {
    // Error details (Stripe's, or the key check's) are for the server log, not visitors.
    console.error(err)
    const status = err instanceof Stripe.errors.StripeError ? (err.statusCode ?? 500) : 500
    return NextResponse.json({ error: "Couldn't start a checkout session. Try again." }, { status })
  }
}
