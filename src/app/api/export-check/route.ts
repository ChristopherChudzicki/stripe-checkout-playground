import { NextResponse, type NextRequest } from "next/server"

/**
 * A fake of MITx Online's export-control check, which sends the learner's
 * name and legal address to CyberSource before checkout. `forceFail` comes
 * from the playground's settings.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { forceFail?: boolean }
  await new Promise((r) => setTimeout(r, 600))
  if (body.forceFail) {
    return NextResponse.json(
      {
        error:
          "We can't complete this enrollment. U.S. export regulations may restrict it. Contact support if you think this is a mistake.",
      },
      { status: 403 },
    )
  }
  return NextResponse.json({ ok: true })
}
