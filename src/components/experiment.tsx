"use client"

import React from "react"
import { styled } from "@mitodl/smoot-design"
import { usePlayground } from "@/lib/playground"

const STRIPE_PURPLE = "#635bff"

const Outlined = styled.div<{ show: boolean }>(({ show }) =>
  show
    ? {
        position: "relative",
        outline: `2px dashed ${STRIPE_PURPLE}`,
        outlineOffset: "6px",
        "&::before": {
          content: '"Drawn by Stripe"',
          position: "absolute",
          top: "-30px",
          right: "-6px",
          fontSize: "11px",
          fontWeight: 600,
          color: "#fff",
          background: STRIPE_PURPLE,
          padding: "2px 6px",
          borderRadius: "3px",
          zIndex: 1,
        },
      }
    : {},
)

/** Wraps anything Stripe renders, so "Outline what Stripe draws" can mark it. */
export function StripeRegion({ children }: { children: React.ReactNode }) {
  const { state } = usePlayground()
  return <Outlined show={state.outline}>{children}</Outlined>
}

export type LogEntry = { at: number; message: string; data?: unknown }

/** Append-only record of what Stripe.js did, shown under each demo. */
export function useExperimentLog() {
  const start = React.useRef(performance.now())
  const [entries, setEntries] = React.useState<LogEntry[]>([])
  const log = React.useCallback((message: string, data?: unknown) => {
    console.log(message, data ?? "")
    setEntries((prev) => [...prev, { at: performance.now() - start.current, message, data }])
  }, [])
  return { entries, log }
}

const LogList = styled.ol({
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "12px",
  paddingLeft: "20px",
  margin: 0,
  "& li": { padding: "3px 0", whiteSpace: "pre-wrap", wordBreak: "break-word" },
})

const Pre = styled.pre(({ theme }) => ({
  fontSize: "12px",
  background: theme.custom.colors.lightGray1,
  padding: "12px",
  borderRadius: "4px",
  overflow: "auto",
  maxHeight: "360px",
}))

const LogDetails = styled.details(({ theme }) => ({
  ...theme.typography.body3,
  marginTop: "24px",
  color: theme.custom.colors.silverGrayDark,
  "& > summary": { cursor: "pointer" },
}))

/** What Stripe.js did, collapsed under each checkout. Also logged to the console. */
export function ExperimentLog({
  entries,
  snapshot,
  snapshotLabel,
}: {
  entries: LogEntry[]
  snapshot?: unknown
  snapshotLabel?: React.ReactNode
}) {
  return (
    <LogDetails>
      <summary>Experiment log ({entries.length})</summary>
      <LogList>
        {entries.map((e, i) => (
          <li key={i}>
            {(e.at / 1000).toFixed(1).padStart(5)}s {e.message}
            {e.data === undefined ? "" : `  ${JSON.stringify(e.data)}`}
          </li>
        ))}
      </LogList>
      {snapshotLabel && (
        <details style={{ marginTop: 12 }}>
          <summary>{snapshotLabel}</summary>
          <Pre>{snapshot === undefined ? "(none yet)" : JSON.stringify(snapshot, null, 2)}</Pre>
        </details>
      )}
    </LogDetails>
  )
}
