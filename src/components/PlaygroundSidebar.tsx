"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { styled } from "@mitodl/smoot-design"
import { RiArrowLeftSLine, RiSettings3Line } from "@remixicon/react"
import { MODES, modeInfo, type ModeKey } from "@/lib/modes"
import { EMPTY_DETAILS, PROFILE_DETAILS, updatePlayground, usePlayground } from "@/lib/playground"

const STRIPE_PURPLE = "#635bff"

const Aside = styled.aside<{ open: boolean }>(({ theme, open }) => ({
  ...theme.typography.body3,
  flex: `0 0 ${open ? 300 : 48}px`,
  position: "sticky",
  top: 0,
  alignSelf: "flex-start",
  height: "100vh",
  overflowY: "auto",
  boxSizing: "border-box",
  padding: open ? "20px" : "12px 0",
  backgroundColor: "#f7f7ff",
  borderRight: `2px dashed ${STRIPE_PURPLE}`,
  "& code": { fontSize: "0.9em" },
  [theme.breakpoints.down("md")]: {
    flex: "none",
    position: "static",
    height: "auto",
    padding: open ? "16px" : "8px 16px",
    borderRight: "none",
    borderBottom: `2px dashed ${STRIPE_PURPLE}`,
  },
}))

const TitleRow = styled.div(({ theme }) => ({
  ...theme.typography.subtitle2,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: STRIPE_PURPLE,
  marginBottom: "4px",
}))

const IconButton = styled.button({
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  background: "none",
  border: "none",
  padding: 0,
  color: STRIPE_PURPLE,
  cursor: "pointer",
  font: "inherit",
})

/** The collapsed sidebar: one button, its label written vertically on wide screens. */
const Rail = styled(IconButton)(({ theme }) => ({
  ...theme.typography.subtitle3,
  flexDirection: "column",
  width: "100%",
  "& span": { writingMode: "vertical-rl" },
  [theme.breakpoints.down("md")]: {
    flexDirection: "row",
    width: "auto",
    "& span": { writingMode: "horizontal-tb" },
  },
}))

const Group = styled.fieldset(({ theme }) => ({
  border: "none",
  margin: "20px 0 0",
  padding: 0,
  "& legend": { ...theme.typography.subtitle3, padding: 0, marginBottom: "6px" },
  "& label": { display: "flex", gap: "8px", alignItems: "baseline", padding: "3px 0", cursor: "pointer" },
  "& small": { display: "block", color: theme.custom.colors.silverGrayDark },
}))

function Radios<T extends string>({
  legend,
  name,
  value,
  choices,
  onChange,
}: {
  legend: string
  name: string
  value: T
  choices: [T, React.ReactNode][]
  onChange: (v: T) => void
}) {
  return (
    <Group>
      <legend>{legend}</legend>
      {choices.map(([v, label]) => (
        <label key={v}>
          <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} />
          <span>{label}</span>
        </label>
      ))}
    </Group>
  )
}

/**
 * Controls for the playground itself, kept out of the checkout design. The
 * mode comes from the URL, so every page (including the receipt) can show it.
 */
function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const mode = modeInfo(useSearchParams().get("mode"))
  const { state } = usePlayground()
  const open = state.sidebarOpen

  const switchMode = (key: ModeKey) => {
    // Stay on Checkout if the new mode has one; otherwise start at the Cart.
    const onCheckout = pathname === "/checkout" && key !== "hosted"
    router.push(`${onCheckout ? "/checkout" : "/"}?mode=${key}`, { scroll: false })
  }

  if (!open) {
    return (
      <Aside open={false}>
        <Rail type="button" onClick={() => updatePlayground({ sidebarOpen: true })} aria-label="Show playground settings">
          <RiSettings3Line size={20} />
          <span>Playground settings</span>
        </Rail>
      </Aside>
    )
  }

  return (
    <Aside open aria-label="Playground settings">
      <TitleRow>
        <span>Playground settings</span>
        <IconButton type="button" onClick={() => updatePlayground({ sidebarOpen: false })} aria-label="Hide playground settings">
          <RiArrowLeftSLine size={20} />
        </IconButton>
      </TitleRow>
      <small style={{ color: "#6f7175" }}>Not part of the design.</small>
      <Radios
        legend="Stripe integration (ui_mode)"
        name="mode"
        value={mode.key}
        choices={MODES.map((m) => [
          m.key,
          <>
            <strong>{m.label}</strong> <code>{m.uiMode}</code>
            <small>{m.blurb}</small>
          </>,
        ])}
        onChange={switchMode}
      />
      <Radios
        legend="Learner's address"
        name="address"
        value={state.addressOnFile ? "onFile" : "missing"}
        choices={[
          ["onFile", "On file in their profile"],
          ["missing", "Missing"],
        ]}
        onChange={(v) =>
          updatePlayground(
            v === "onFile"
              ? { addressOnFile: true, details: PROFILE_DETAILS }
              : { addressOnFile: false, details: EMPTY_DETAILS },
          )
        }
      />
      <Radios
        legend="Export-control check"
        name="export"
        value={state.exportCheck}
        choices={[
          ["pass", "Passes"],
          ["fail", "Fails"],
        ]}
        onChange={(v) => updatePlayground({ exportCheck: v })}
      />
      <Group>
        <legend>Display</legend>
        <label>
          <input
            type="checkbox"
            checked={state.outline}
            onChange={(e) => updatePlayground({ outline: e.target.checked })}
          />
          <span>Outline what Stripe draws</span>
        </label>
        {mode.key === "hosted" && (
          <label>
            <input
              type="checkbox"
              checked={state.branding}
              onChange={(e) => updatePlayground({ branding: e.target.checked })}
            />
            <span>
              Brand Stripe&apos;s page (<code>branding_settings</code>)
            </span>
          </label>
        )}
      </Group>
      <Group>
        <legend>Discount codes</legend>
        <small>
          <code>LEVELUP</code> (25%), <code>WELCOME10</code> (10%, loses to the 15% promotion);
          anything else is invalid.
        </small>
      </Group>
    </Aside>
  )
}

export function PlaygroundSidebar() {
  return (
    <React.Suspense fallback={null}>
      <Sidebar />
    </React.Suspense>
  )
}
