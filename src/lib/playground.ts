"use client"

import React from "react"

/** The learner's compliance details: what MITx Online's export check needs. */
export type Details = {
  name: string
  line1: string
  city: string
  state: string
  postal_code: string
  country: string
}

export const PROFILE_DETAILS: Details = {
  name: "Test Learner",
  line1: "77 Massachusetts Ave",
  city: "Cambridge",
  state: "MA",
  postal_code: "02139",
  country: "US",
}

export const EMPTY_DETAILS: Details = { name: "", line1: "", city: "", state: "", postal_code: "", country: "" }

export const COUNTRIES: [string, string][] = [
  ["US", "United States"],
  ["CA", "Canada"],
  ["GB", "United Kingdom"],
  ["IN", "India"],
  ["DE", "Germany"],
  ["BR", "Brazil"],
  ["NG", "Nigeria"],
  ["CN", "China"],
]

export const needsState = (country: string) => country === "US" || country === "CA"

export function detailsErrors(d: Details): Partial<Record<keyof Details, string>> {
  const errors: Partial<Record<keyof Details, string>> = {}
  if (!d.name.trim()) errors.name = "Enter your legal name."
  if (!d.country) errors.country = "Choose a country."
  if (!d.line1.trim()) errors.line1 = "Enter a street address."
  if (!d.city.trim()) errors.city = "Enter a city."
  if (needsState(d.country) && !d.state.trim()) errors.state = "Enter a state or province."
  if (!d.postal_code.trim()) errors.postal_code = "Enter a postal code."
  return errors
}

export const detailsComplete = (d: Details) => Object.keys(detailsErrors(d)).length === 0

export function formatDetails(d: Details) {
  const country = COUNTRIES.find(([code]) => code === d.country)?.[1] ?? d.country
  const region = [d.state, d.postal_code].filter(Boolean).join(" ")
  return [d.line1, d.city, region, country].filter(Boolean).join(", ")
}

/**
 * Everything the playground remembers between pages: the basket, the
 * learner's details, and the demo settings. Kept in sessionStorage so the
 * hosted page's round trip through Stripe keeps it.
 */
export type PlaygroundState = {
  inCart: boolean
  discountCode: string | null
  /** Whether the learner's profile already holds complete details. */
  addressOnFile: boolean
  details: Details
  exportCheck: "pass" | "fail"
  branding: boolean
  outline: boolean
  sidebarOpen: boolean
}

const DEFAULTS: PlaygroundState = {
  inCart: true,
  discountCode: null,
  addressOnFile: false,
  details: EMPTY_DETAILS,
  exportCheck: "pass",
  branding: true,
  outline: true,
  sidebarOpen: true,
}

const KEY = "stripe-playground-state"
const listeners = new Set<() => void>()
let cache: PlaygroundState | undefined

function read(): PlaygroundState {
  if (cache) return cache
  try {
    const raw = window.sessionStorage.getItem(KEY)
    cache = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    cache = DEFAULTS
  }
  return cache!
}

export function updatePlayground(
  patch: Partial<PlaygroundState> | ((s: PlaygroundState) => Partial<PlaygroundState>),
) {
  const prev = read()
  cache = { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    // Storage can be unavailable (private windows); the state still lives in memory.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const noSubscribe = () => () => {}

/**
 * The playground state, plus whether it has been read from storage yet. On
 * the server and during hydration the state is the defaults, so anything that
 * acts on it (creating a session, redirecting) waits for `hydrated`.
 */
export function usePlayground() {
  const state = React.useSyncExternalStore(subscribe, read, () => DEFAULTS)
  const hydrated = React.useSyncExternalStore(noSubscribe, () => true, () => false)
  return { state, hydrated }
}
