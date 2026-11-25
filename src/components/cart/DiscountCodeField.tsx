"use client"

import React from "react"
import { Button, TextField, styled } from "@mitodl/smoot-design"
import { DISCOUNT_CODES, normalizeCode } from "@/lib/cart"
import { ApiError, applyDiscount } from "@/lib/api"
import { updatePlayground } from "@/lib/playground"
import { TextButton } from "@/components/ui"

const Row = styled.form({
  display: "flex",
  alignItems: "flex-end",
  gap: "8px",
  marginTop: "20px",
  "& > :first-of-type": { flex: 1 },
})

const Message = styled.p<{ kind: "ok" | "error" | "info" }>(({ theme, kind }) => ({
  ...theme.typography.body3,
  margin: "8px 0 0",
  color:
    kind === "ok"
      ? theme.custom.colors.green
      : kind === "error"
        ? theme.custom.colors.red
        : theme.custom.colors.silverGrayDark,
}))

export function DiscountCodeField({ current }: { current: string | null }) {
  const [typed, setTyped] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [message, setMessage] = React.useState<{ kind: "ok" | "error" | "info"; text: string }>()

  const apply = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = normalizeCode(typed)
    if (!code) return
    setBusy(true)
    setMessage(undefined)
    try {
      const { discountCode } = await applyDiscount(current, code)
      if (discountCode === code && code !== current) {
        updatePlayground({ discountCode })
      } else if (code === current) {
        setMessage({ kind: "info", text: `${code} is already applied.` })
      } else {
        // MITx Online answers 200 with the basket unchanged when a code
        // doesn't lower the price, so the reason is ours to explain.
        setMessage({
          kind: "info",
          text: `${code} (${DISCOUNT_CODES[code]}% off) doesn't beat your current discount, so we kept the lower price.`,
        })
      }
      setTyped("")
    } catch (err) {
      const text =
        err instanceof ApiError && err.status === 404
          ? `${code} isn't a valid discount code.`
          : (err as Error).message
      setMessage({ kind: "error", text })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Row onSubmit={apply}>
        <TextField
          name="discount_code"
          label="Discount code"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          size="small"
          fullWidth
        />
        <Button type="submit" variant="secondary" size="small" disabled={busy || !typed.trim()}>
          {busy ? "Applying…" : "Apply"}
        </Button>
      </Row>
      {message && <Message kind={message.kind}>{message.text}</Message>}
      {current && (
        <Message kind="ok">
          Code {current} applied.{" "}
          <TextButton
            type="button"
            onClick={() => {
              updatePlayground({ discountCode: null })
              setMessage(undefined)
            }}
          >
            Remove code
          </TextButton>
        </Message>
      )}
    </>
  )
}
