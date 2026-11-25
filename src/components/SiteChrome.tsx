"use client"

import React from "react"
import Link from "next/link"
import { styled } from "@mitodl/smoot-design"
import { PlaygroundSidebar } from "./PlaygroundSidebar"

/** The playground's sidebar beside the page that stands in for MIT Learn. */
const Playground = styled.div(({ theme }) => ({
  display: "flex",
  minHeight: "100vh",
  [theme.breakpoints.down("md")]: { flexDirection: "column" },
}))

const Page = styled.div(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.custom.colors.lightGray1,
  color: theme.custom.colors.darkGray2,
  ...theme.typography.body1,
}))

const Header = styled.header(({ theme }) => ({
  backgroundColor: theme.custom.colors.darkGray2,
  color: theme.custom.colors.white,
  minHeight: "60px",
  padding: "8px 24px",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  a: { color: theme.custom.colors.white, textDecoration: "none" },
}))

const Brand = styled.div({ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "4px 16px" })

const Logo = styled(Link)({
  fontSize: "24px",
  letterSpacing: "-0.5px",
  whiteSpace: "nowrap",
  "& b": { fontWeight: 700 },
  "& span": { fontWeight: 400 },
})

const DemoNotice = styled.span(({ theme }) => ({
  ...theme.typography.body3,
  color: theme.custom.colors.lightGray2,
}))

const Main = styled.main({
  flex: 1,
  width: "100%",
  maxWidth: "1132px",
  margin: "0 auto",
  padding: "40px 16px 56px",
  boxSizing: "border-box",
})

const Footer = styled.footer(({ theme }) => ({
  backgroundColor: theme.custom.colors.white,
  borderTop: `1px solid ${theme.custom.colors.lightGray2}`,
  padding: "20px 16px",
  textAlign: "center",
  ...theme.typography.body3,
  color: theme.custom.colors.silverGrayDark,
}))

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <Playground>
      <PlaygroundSidebar />
      <Page>
        <Header>
          <Brand>
            <Logo href="/">
              <b>MIT</b> <span>Learn</span>
            </Logo>
            <DemoNotice>
              Checkout playground. Demo using Stripe test mode, not a real checkout; nothing is
              charged and no one is enrolled.
            </DemoNotice>
          </Brand>
          <Link href="/">Cart</Link>
        </Header>
        <Main>{children}</Main>
        <Footer>
          Stripe checkout playground, test mode only. Pay with 4242 4242 4242 4242, any future
          expiry, any CVC.
        </Footer>
      </Page>
    </Playground>
  )
}
