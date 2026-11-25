import { NextResponse } from "next/server"
import Stripe from "stripe"
import { SESSION_SOURCE, stripe } from "@/lib/stripeServer"

export type SessionSummary = {
  id: string
  uiMode: string | null
  status: string | null
  paymentStatus: string
  amountTotal: number | null
  email: string | null
  billingAddress: Stripe.Address | null
  clientReferenceId: string | null
}

const notFound = () => NextResponse.json({ error: "Session not found" }, { status: 404 })

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^cs_test_\w+$/.test(id)) return notFound()
  try {
    const session = await stripe().checkout.sessions.retrieve(id)
    // The sandbox may hold other integrations' sessions; serve only ours.
    if (session.metadata?.source !== SESSION_SOURCE) return notFound()
    const summary: SessionSummary = {
      id: session.id,
      uiMode: session.ui_mode,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      email: session.customer_details?.email ?? session.customer_email,
      billingAddress: session.customer_details?.address ?? null,
      clientReferenceId: session.client_reference_id,
    }
    return NextResponse.json(summary)
  } catch (err) {
    if (err instanceof Stripe.errors.StripeInvalidRequestError && err.statusCode === 404) return notFound()
    // Error details (Stripe's, or the key check's) are for the server log, not visitors.
    console.error(err)
    const status = err instanceof Stripe.errors.StripeError ? (err.statusCode ?? 500) : 500
    return NextResponse.json({ error: "Couldn't load the session." }, { status })
  }
}
