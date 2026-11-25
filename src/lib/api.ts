import type { UiMode } from "./modes"
import type { CreateSessionResponse } from "@/app/api/checkout-sessions/route"
import type { SessionSummary } from "@/app/api/checkout-sessions/[id]/route"
import type { DiscountResponse } from "@/app/api/basket/discount/route"

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(body.error ?? `${res.status} ${res.statusText}`, res.status)
  return body as T
}

const postJson = <T>(url: string, body: unknown) =>
  getJson<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

export const createSession = (
  uiMode: UiMode,
  extra: { branding?: boolean; discountCode?: string | null } = {},
) => postJson<CreateSessionResponse>("/api/checkout-sessions", { uiMode, ...extra })

export async function createClientSecret(uiMode: Exclude<UiMode, "hosted_page">, discountCode: string | null) {
  const res = await createSession(uiMode, { discountCode })
  if (!("clientSecret" in res)) throw new Error("Expected a client secret")
  return res.clientSecret
}

export const getSessionSummary = (id: string) =>
  getJson<SessionSummary>(`/api/checkout-sessions/${encodeURIComponent(id)}`)

export const applyDiscount = (current: string | null, typed: string) =>
  postJson<DiscountResponse>(`/api/basket/discount?discount_code=${encodeURIComponent(typed)}`, { current })

/** Resolves when the check passes; rejects with the message to show when it fails. */
export const runExportCheck = (forceFail: boolean) =>
  postJson<{ ok: true }>("/api/export-check", { forceFail })
