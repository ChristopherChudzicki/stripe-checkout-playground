"use client"

import React from "react"
import Link from "next/link"
import { styled } from "@mitodl/smoot-design"
import type { Theme } from "@mui/material/styles"
import { money, type PricedBasket } from "@/lib/cart"
import type { ModeInfo } from "@/lib/modes"

export const Card = styled.section(({ theme }) => ({
  backgroundColor: theme.custom.colors.white,
  border: `1px solid ${theme.custom.colors.lightGray2}`,
  borderRadius: "8px",
  padding: "24px",
  boxShadow: "0 2px 4px rgba(37, 38, 43, 0.05)",
}))

export const Columns = styled.div(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
  gap: "24px",
  alignItems: "start",
  [theme.breakpoints.down("md")]: { gridTemplateColumns: "1fr" },
}))

export const Stack = styled.div({ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 })

export const Heading = styled.h1(({ theme }) => ({ ...theme.typography.h3, margin: "0 0 24px" }))
export const SectionHeading = styled.h2(({ theme }) => ({ ...theme.typography.h5, margin: "0 0 16px" }))

export const Muted = styled.p(({ theme }) => ({
  ...theme.typography.body3,
  color: theme.custom.colors.silverGrayDark,
}))

export const Actions = styled.div({
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "24px",
})

export const TextLink = styled(Link)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.custom.colors.red,
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
}))

export const TextButton = styled.button(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.custom.colors.red,
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  "&:hover": { textDecoration: "underline" },
}))

type NoticeKind = "info" | "warn" | "error" | "ok"
const NOTICE_COLORS: Record<NoticeKind, [string, string]> = {
  info: ["#eef0ff", "#c9ccff"],
  warn: ["#fff5e5", "#f3c77a"],
  error: ["#fdecee", "#f2aab4"],
  ok: ["#e8f6f0", "#9fd8c0"],
}
export const Notice = styled.div<{ kind: NoticeKind }>(({ theme, kind }) => ({
  ...theme.typography.body2,
  backgroundColor: NOTICE_COLORS[kind][0],
  border: `1px solid ${NOTICE_COLORS[kind][1]}`,
  borderRadius: "6px",
  padding: "12px 16px",
}))

const SummaryRow = styled.div<{ variant?: "discount" | "total" }>(({ theme, variant }) => ({
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  padding: "6px 0",
  ...(variant === "discount" && { color: theme.custom.colors.green }),
  ...(variant === "total" && {
    ...theme.typography.subtitle1,
    borderTop: `1px solid ${theme.custom.colors.lightGray2}`,
    marginTop: "8px",
    paddingTop: "14px",
  }),
}))

export function OrderSummary({ basket, children }: { basket: PricedBasket; children?: React.ReactNode }) {
  const { product, discount } = basket
  return (
    <Card as="aside">
      <SectionHeading>Order summary</SectionHeading>
      {product && (
        <SummaryRow>
          <span>{product.name}</span>
          <span>{money(basket.listCents)}</span>
        </SummaryRow>
      )}
      {discount && (
        <SummaryRow variant="discount">
          <span>
            {discount.code ? `Code ${discount.code}` : discount.label} ({discount.percent}%)
          </span>
          <span>&minus;{money(basket.discountCents)}</span>
        </SummaryRow>
      )}
      <SummaryRow variant="total">
        <span>Total</span>
        <span>{money(basket.totalCents)}</span>
      </SummaryRow>
      {children}
    </Card>
  )
}

const StepList = styled.ol(({ theme }) => ({
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "1fr",
  gap: "8px",
  listStyle: "none",
  padding: "8px",
  margin: "0 0 24px",
  backgroundColor: theme.custom.colors.white,
  border: `1px solid ${theme.custom.colors.lightGray2}`,
  borderRadius: "8px",
}))

type StepState = "done" | "current" | "upcoming"
const stepStyles = (theme: Theme, state: StepState) => ({
  ...theme.typography.subtitle2,
  display: "block",
  textAlign: "center" as const,
  padding: "10px 8px",
  borderRadius: "4px",
  textDecoration: "none",
  backgroundColor:
    state === "current" ? theme.custom.colors.red : state === "done" ? "#f6e6e9" : theme.custom.colors.lightGray1,
  color:
    state === "current"
      ? theme.custom.colors.white
      : state === "done"
        ? theme.custom.colors.red
        : theme.custom.colors.silverGrayDark,
  "& small": { display: "block", ...theme.typography.body4, opacity: 0.85, marginTop: "2px" },
})
const StepBox = styled.span<{ state: StepState }>(({ theme, state }) => stepStyles(theme, state))
const StepLink = styled(Link)<{ state: StepState }>(({ theme, state }) => ({
  ...stepStyles(theme, state),
  "&:hover": { textDecoration: "underline" },
}))

export type StepKey = "cart" | "checkout" | "receipt"
const STEP_KEYS: StepKey[] = ["cart", "checkout", "receipt"]

/**
 * Cart, Checkout, Receipt. Earlier steps link back while the order is open;
 * once paid, nothing does.
 */
export function CheckoutSteps({ current, mode }: { current: StepKey; mode: ModeInfo }) {
  const currentIndex = STEP_KEYS.indexOf(current)
  const steps: { key: StepKey; label: string; owner: string; href?: string }[] = [
    { key: "cart", label: "Cart", owner: "MIT Learn", href: `/?mode=${mode.key}` },
    { key: "checkout", label: "Checkout", owner: mode.checkoutOwner },
    { key: "receipt", label: "Receipt", owner: "MIT Learn" },
  ]
  return (
    <StepList aria-label="Checkout steps">
      {steps.map((step, i) => {
        const state: StepState = i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming"
        const content = (
          <>
            {step.label}
            <small>{step.owner}</small>
          </>
        )
        const linkable = state === "done" && current !== "receipt" && step.href
        return (
          <li key={step.key} aria-current={state === "current" ? "step" : undefined}>
            {linkable ? (
              <StepLink href={step.href!} state={state}>
                {content}
              </StepLink>
            ) : (
              <StepBox state={state}>{content}</StepBox>
            )}
          </li>
        )
      })}
    </StepList>
  )
}
