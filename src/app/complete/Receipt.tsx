"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@mitodl/smoot-design"
import { getSessionSummary } from "@/lib/api"
import type { SessionSummary } from "@/app/api/checkout-sessions/[id]/route"
import { money } from "@/lib/cart"
import { modeForUiMode, modeInfo } from "@/lib/modes"
import { updatePlayground } from "@/lib/playground"
import { Actions, Card, CheckoutSteps, Heading, Notice, SectionHeading } from "@/components/ui"

export default function Receipt({ sessionId }: { sessionId?: string }) {
  const router = useRouter()
  const [summary, setSummary] = React.useState<SessionSummary>()
  const [error, setError] = React.useState<string>()

  React.useEffect(() => {
    if (!sessionId) {
      setError("No session_id in the URL.")
      return
    }
    getSessionSummary(sessionId).then(setSummary, (err: Error) => setError(err.message))
  }, [sessionId])

  const mode = modeForUiMode(summary?.uiMode) ?? modeInfo(undefined)
  const paid = summary?.status === "complete" && summary.paymentStatus === "paid"
  const a = summary?.billingAddress
  const rows: [string, React.ReactNode][] = summary
    ? [
        ["Amount", summary.amountTotal == null ? "" : money(summary.amountTotal)],
        ["Email", summary.email],
        [
          "Card billing address (from Stripe)",
          a ? [a.line1, a.city, a.state, a.postal_code, a.country].filter(Boolean).join(", ") : "(none collected)",
        ],
        ["ui_mode", summary.uiMode],
        ["client_reference_id", summary.clientReferenceId],
        ["Session", summary.id],
      ]
    : []

  const startOver = () => {
    updatePlayground({ inCart: true, discountCode: null })
    router.push(`/?mode=${mode.key}`)
  }

  return (
    <>
      {summary && <CheckoutSteps current="receipt" mode={mode} />}
      <Heading>Receipt</Heading>
      {error && <Notice kind="error">{error}</Notice>}
      {summary && (
        <Notice kind={paid ? "ok" : "warn"} style={{ marginBottom: 24 }}>
          {paid
            ? "Test payment succeeded."
            : `Session status "${summary.status}", payment status "${summary.paymentStatus}".`}
        </Notice>
      )}
      <Card>
        <SectionHeading>Order details</SectionHeading>
        <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "8px 16px", margin: 0 }}>
          {rows.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt>{k}</dt>
              <dd style={{ margin: 0, wordBreak: "break-all" }}>{v}</dd>
            </React.Fragment>
          ))}
        </dl>
        <Actions>
          <Button onClick={startOver}>Start over</Button>
        </Actions>
      </Card>
    </>
  )
}
