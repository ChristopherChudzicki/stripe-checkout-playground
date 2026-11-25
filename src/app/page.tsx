import type { ModeKey } from "@/lib/modes"
import CartPage from "./CartPage"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { mode, canceled } = await searchParams
  return <CartPage modeKey={typeof mode === "string" ? (mode as ModeKey) : undefined} canceled={canceled === "1"} />
}
