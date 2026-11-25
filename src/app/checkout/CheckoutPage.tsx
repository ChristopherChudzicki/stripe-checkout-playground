"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { styled } from "@mitodl/smoot-design"
import { loadStripe } from "@stripe/stripe-js"
import { priceBasket } from "@/lib/cart"
import { modeInfo, type ModeKey } from "@/lib/modes"
import { formatDetails, usePlayground, type PlaygroundState } from "@/lib/playground"
import { Card, CheckoutSteps, Columns, Heading, OrderSummary, Stack, TextLink } from "@/components/ui"
import { ExperimentLog, useExperimentLog } from "@/components/experiment"
import { EmbeddedView } from "./EmbeddedView"
import { FormView } from "./FormView"
import { ElementsView } from "./ElementsView"

export type CheckoutViewProps = {
  stripePromise: ReturnType<typeof loadStripe>
  state: PlaygroundState
  log: ReturnType<typeof useExperimentLog>["log"]
  onSnapshot: (s: unknown) => void
}

const DetailsRow = styled(Card)(({ theme }) => ({
  ...theme.typography.body2,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: "16px",
  padding: "16px 24px",
  "& .label": { ...theme.typography.subtitle3, color: theme.custom.colors.silverGrayDark },
}))

/** A reminder of who is enrolling; changing it means going back to the Cart. */
function DetailsSummary({ state, cartHref }: { state: PlaygroundState; cartHref: string }) {
  return (
    <DetailsRow>
      <div>
        <div className="label">Enrolling</div>
        <div>
          {state.details.name} &middot; {formatDetails(state.details)}
        </div>
      </div>
      <TextLink href={cartHref}>Edit</TextLink>
    </DetailsRow>
  )
}

export default function CheckoutPage({
  modeKey,
  publishableKey,
}: {
  modeKey: Exclude<ModeKey, "hosted">
  publishableKey: string
}) {
  const mode = modeInfo(modeKey)
  const cartHref = `/?mode=${mode.key}`
  const router = useRouter()
  const { state, hydrated } = usePlayground()
  const stripePromise = React.useMemo(() => loadStripe(publishableKey), [publishableKey])
  const { entries, log } = useExperimentLog()
  const [snapshot, setSnapshot] = React.useState<unknown>()
  const ready = hydrated && state.inCart && state.addressOnFile

  React.useEffect(() => {
    if (hydrated && !ready) router.replace(cartHref)
  }, [hydrated, ready, router, cartHref])

  const view = { stripePromise, state, log, onSnapshot: setSnapshot }

  return (
    <>
      <CheckoutSteps current="checkout" mode={mode} />
      <Heading>Checkout</Heading>
      {!ready ? (
        <p>Loading&hellip;</p>
      ) : mode.key === "embedded" ? (
        <Stack>
          <DetailsSummary state={state} cartHref={cartHref} />
          <EmbeddedView {...view} />
        </Stack>
      ) : (
        <Columns>
          <Stack>
            <DetailsSummary state={state} cartHref={cartHref} />
            {mode.key === "form" ? <FormView {...view} /> : <ElementsView {...view} />}
          </Stack>
          <OrderSummary basket={priceBasket(state)} />
        </Columns>
      )}
      <ExperimentLog
        entries={entries}
        snapshot={snapshot}
        snapshotLabel={mode.key === "elements" ? "Latest session object from useCheckoutElements()" : undefined}
      />
    </>
  )
}
