"use client"

import React from "react"
import { Button, SelectField, TextField, styled } from "@mitodl/smoot-design"
import MenuItem from "@mui/material/MenuItem"
import {
  COUNTRIES,
  detailsErrors,
  formatDetails,
  needsState,
  updatePlayground,
  type Details,
} from "@/lib/playground"
import { Card, Muted, SectionHeading, TextButton } from "@/components/ui"

const Grid = styled.div(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  marginTop: "16px",
  "& .wide": { gridColumn: "1 / -1" },
  [theme.breakpoints.down("sm")]: { gridTemplateColumns: "1fr" },
}))

/** Groups the address fields under one "Legal address" label. */
const AddressGroup = styled.fieldset(({ theme }) => ({
  border: "none",
  margin: "24px 0 0",
  padding: 0,
  minWidth: 0,
  "& legend": { ...theme.typography.subtitle1, padding: 0, marginBottom: "12px" },
  "& > div": { marginTop: 0 },
}))

const OnFile = styled.div(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: "16px",
  "& .name": { ...theme.typography.subtitle2 },
  "& .address": { ...theme.typography.body2, color: theme.custom.colors.silverGrayDark },
}))

const WhyButton = styled.button(({ theme }) => ({
  ...theme.typography.body3,
  color: theme.custom.colors.red,
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  "&:hover": { textDecoration: "underline" },
}))

/**
 * The compliance details MITx Online needs before anyone enrolls. They are
 * the learner's, not the card's: Stripe collects the card's billing details
 * itself at payment.
 */
export function DetailsCard({
  details,
  showForm,
  showErrors,
  onEdit,
  onSave,
}: {
  details: Details
  showForm: boolean
  showErrors: boolean
  onEdit: () => void
  onSave: () => void
}) {
  const [whyOpen, setWhyOpen] = React.useState(false)
  const errors = showErrors ? detailsErrors(details) : {}
  const set = (key: keyof Details) => (e: { target: { value: unknown } }) =>
    updatePlayground((s) => ({ details: { ...s.details, [key]: String(e.target.value) } }))
  const field = (key: keyof Details, label: string, wide = false) => (
    <div className={wide ? "wide" : undefined}>
      <TextField
        name={key}
        label={label}
        value={details[key]}
        onChange={set(key)}
        errorText={errors[key]}
        error={!!errors[key]}
        required
        fullWidth
      />
    </div>
  )

  return (
    <Card id="your-details">
      <SectionHeading style={{ marginBottom: 8 }}>Your details</SectionHeading>
      <Muted style={{ margin: "0 0 16px" }}>
        Required to enroll.{" "}
        <WhyButton
          type="button"
          aria-expanded={whyOpen}
          aria-controls="details-why"
          onClick={() => setWhyOpen((o) => !o)}
        >
          Why?
        </WhyButton>
      </Muted>
      {whyOpen && (
        <Muted id="details-why" style={{ margin: "-8px 0 16px" }}>
          U.S. export regulations require MIT to check who enrolls, using your legal name and
          address. They aren&apos;t used for billing; you&apos;ll give your card&apos;s billing
          details at payment.
        </Muted>
      )}
      {showForm ? (
        <>
          <Grid>{field("name", "Legal name", true)}</Grid>
          <AddressGroup>
            <legend>Legal address</legend>
            <Grid>
              <div className="wide">
                <SelectField
                  name="country"
                  label="Country"
                  value={details.country}
                  onChange={set("country")}
                  errorText={errors.country}
                  error={!!errors.country}
                  required
                  fullWidth
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Choose a country
                  </MenuItem>
                  {COUNTRIES.map(([code, name]) => (
                    <MenuItem key={code} value={code}>
                      {name}
                    </MenuItem>
                  ))}
                </SelectField>
              </div>
              {field("line1", "Street", true)}
              {field("city", "City")}
              {needsState(details.country) && field("state", "State or province")}
              {field("postal_code", "Postal code")}
            </Grid>
          </AddressGroup>
          <div style={{ marginTop: 16 }}>
            <Button variant="secondary" size="small" onClick={onSave}>
              Save details
            </Button>
          </div>
        </>
      ) : (
        <OnFile>
          <div>
            <div className="name">{details.name}</div>
            <div className="address">{formatDetails(details)}</div>
          </div>
          <TextButton type="button" onClick={onEdit}>
            Edit
          </TextButton>
        </OnFile>
      )}
    </Card>
  )
}
