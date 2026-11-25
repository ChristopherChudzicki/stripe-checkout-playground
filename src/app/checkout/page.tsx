import { redirect } from "next/navigation"
import { MODES, type ModeKey } from "@/lib/modes"
import { publishableKey } from "@/lib/stripeServer"
import CheckoutPage from "./CheckoutPage"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { mode } = await searchParams
  const found = MODES.find((m) => m.key === mode)
  // Hosted checkout happens on Stripe's page; there is no Checkout page of ours.
  if (!found || found.key === "hosted") redirect(`/?mode=${found?.key ?? ""}`)
  return (
    <CheckoutPage
      modeKey={found.key as Exclude<ModeKey, "hosted">}
      publishableKey={publishableKey()}
    />
  )
}
