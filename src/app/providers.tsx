"use client"

import React from "react"
import { ThemeProvider } from "@mitodl/smoot-design"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AppRouterCacheProvider>
  )
}
