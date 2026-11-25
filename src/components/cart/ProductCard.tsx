"use client"

import React from "react"
import { styled } from "@mitodl/smoot-design"
import { money, type Product } from "@/lib/cart"
import { Card, TextButton } from "@/components/ui"

const Layout = styled(Card)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto 200px",
  gap: "24px",
  [theme.breakpoints.down("sm")]: { gridTemplateColumns: "minmax(0, 1fr) auto" },
}))

const Info = styled.div(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  "& .kind": { ...theme.typography.body2, color: theme.custom.colors.silverGrayDark },
  "& .name": {
    ...theme.typography.h5,
    margin: "8px 0 24px",
    color: "inherit",
    textDecoration: "none",
    "&:hover": { textDecoration: "underline" },
  },
}))

const Footer = styled.div(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: "auto",
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "8px 20px",
  "& .label": { color: theme.custom.colors.silverGrayDark },
  "& .links": { display: "inline-flex", alignItems: "center", gap: "16px" },
  "& .divider": { width: "1px", alignSelf: "stretch", backgroundColor: theme.custom.colors.lightGray2 },
}))

const Price = styled.div(({ theme }) => ({ ...theme.typography.subtitle1 }))

/** Learn's default resource image, which programs without their own image use. */
const Picture = styled.img(({ theme }) => ({
  width: "100%",
  aspectRatio: "16 / 9",
  objectFit: "cover",
  borderRadius: "6px",
  [theme.breakpoints.down("sm")]: { display: "none" },
}))

export function ProductCard({ product, onRemove }: { product: Product; onRemove: () => void }) {
  return (
    <Layout>
      <Info>
        <div className="kind">{product.kind}</div>
        <a className="name" href={product.url} target="_blank" rel="noreferrer">
          {product.name}
        </a>
        <Footer>
          <span>
            <span className="label">Starts:</span> {product.starts}
          </span>
          <span className="links">
            <a href={product.url} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>
              Program details
            </a>
            <span className="divider" aria-hidden />
            <TextButton type="button" onClick={onRemove}>
              Remove
            </TextButton>
          </span>
        </Footer>
      </Info>
      <Price>{money(product.listPriceCents)}</Price>
      <Picture src={product.imagePath} alt="" />
    </Layout>
  )
}
