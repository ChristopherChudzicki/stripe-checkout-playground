import React from "react"
import type { Metadata } from "next"
import Providers from "./providers"
import SiteChrome from "@/components/SiteChrome"

export const metadata: Metadata = {
  title: "Stripe Checkout Playground",
  description: "One cart, paid four ways: what each Stripe Checkout Session ui_mode lets us design.",
  robots: { index: false, follow: false },
}

/** Pages read STRIPE_PUBLISHABLE_KEY at request time, not build time. */
export const dynamic = "force-dynamic"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* MIT Learn's Adobe Fonts kit (Neue Haas Grotesk). It may refuse
            domains it isn't configured for; the theme falls back to sans-serif. */}
        <link rel="stylesheet" href="https://use.typekit.net/lbk1xay.css" />
      </head>
      <body style={{ margin: 0 }}>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  )
}
