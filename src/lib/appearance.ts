import type { Appearance } from "@stripe/stripe-js"

/** Client-side Appearance API settings approximating MIT Learn. */
export const LEARN_APPEARANCE: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#750014",
    colorText: "#212326",
    colorDanger: "#b00020",
    fontFamily: "neue-haas-grotesk-text, Inter, system-ui, sans-serif",
    borderRadius: "4px",
  },
}
