export const UI_MODES = ["hosted_page", "embedded_page", "form", "elements"] as const
export type UiMode = (typeof UI_MODES)[number]

export type ModeKey = "hosted" | "embedded" | "form" | "elements"

export type ModeInfo = {
  key: ModeKey
  uiMode: UiMode
  label: string
  blurb: string
  /** Who draws the Checkout step, for the stepper. */
  checkoutOwner: string
}

export const MODES: ModeInfo[] = [
  {
    key: "hosted",
    uiMode: "hosted_page",
    label: "Hosted page",
    blurb: "Redirect to Stripe's page. What MITx Online does today.",
    checkoutOwner: "Stripe's page",
  },
  {
    key: "embedded",
    uiMode: "embedded_page",
    label: "Embedded page",
    blurb: "Stripe's whole checkout in an iframe on our page.",
    checkoutOwner: "Stripe iframe",
  },
  {
    key: "form",
    uiMode: "form",
    label: "Form",
    blurb: "Stripe's payment form and Pay button; our page around it.",
    checkoutOwner: "Stripe form, our page",
  },
  {
    key: "elements",
    uiMode: "elements",
    label: "Elements",
    blurb: "Only the card field is Stripe's; our page and Pay button.",
    checkoutOwner: "Our page, Stripe card field",
  },
]

export const DEFAULT_MODE: ModeKey = "hosted"

export function modeInfo(key: string | undefined | null): ModeInfo {
  return MODES.find((m) => m.key === key) ?? MODES.find((m) => m.key === DEFAULT_MODE)!
}

export function modeForUiMode(uiMode: string | null | undefined): ModeInfo | undefined {
  return MODES.find((m) => m.uiMode === uiMode)
}
