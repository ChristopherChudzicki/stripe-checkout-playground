import Receipt from "./Receipt"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { session_id } = await searchParams
  return <Receipt sessionId={typeof session_id === "string" ? session_id : undefined} />
}
