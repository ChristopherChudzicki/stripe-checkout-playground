# Stripe checkout playground

One cart, paid four ways, to show what each Stripe Checkout Session `ui_mode` lets us design. Every mode uses the same flow, **Cart → Checkout → Receipt**, and differs only where Stripe forces it. Sessions carry the fields MITx Online sends Stripe (one inline price with the discount already applied, inclusive tax, `client_reference_id`, `customer_email`, cards only), so behavior here should carry over to MITx Online. Built like MIT Learn: Next.js app router with thin `page.tsx` files, client components, and `@mitodl/smoot-design`.

## The flow

- **Cart** (`/?mode=…`), the same page in every mode: the program, a discount code, and the learner's details for the export-control check (one line with Edit when on file, a form when missing). The program card uses Learn's default resource image.
- **Checkout** (`/checkout?mode=…`): a reminder of who is enrolling, then payment. Hosted has no Checkout page of ours; Stripe's page is the step.
- **Receipt** (`/complete?mode=…&session_id=…`).

A collapsible "Playground settings" sidebar, outside the Learn page, picks the mode, whether the address is on file, whether the export check passes, and whether to outline what Stripe draws. Switching modes on Checkout stays on Checkout (except to hosted, which starts at the Cart).

Steps already done link back while the order is open. State (basket, details, settings) lives in `sessionStorage`, so it survives the round trip through Stripe's hosted page.

## Where the modes differ, and why

| Mode | Checkout step | Export check runs | Why |
|---|---|---|---|
| Hosted (`hosted_page`) | Stripe's page; its back arrow goes to `cancel_url` (the Cart) | On the Cart, before the redirect | No hook between the learner's click and the charge |
| Embedded (`embedded_page`) | Stripe's whole checkout in an iframe | On the Cart, before the iframe loads | Same: no hook before the charge |
| Form (`form`) | Stripe's form and Pay button, our page and summary | In our `onConfirm`, before `confirm()` | Stripe asks us to confirm |
| Elements (`elements`) | Stripe's card field, our page and Pay button | In our Pay handler, before `confirm()` | We call `confirm()` ourselves |

Discount codes go in on the Cart in every mode: hosted and embedded can't change a session's price after it loads. Form and Elements could (`runServerUpdate` plus a server-side `sessions.update`), untested here.

## Findings

- **Form locks after a stopped payment.** Once Stripe's form emits `confirm`, it stays locked (greyed fields, a Pay button that does nothing) until `confirm()` is called. Remounting `CheckoutForm` doesn't unlock it; a new session does, and the learner re-enters the card.
- **MITx Online's discount endpoint doesn't say when a code loses.** It returns 404 for an unknown code, but a valid code that doesn't beat the current discount comes back 200 with the basket unchanged, so the client has to compare before and after.
- **Link shows up unless the Dashboard turns it off.** It adds Bank and Klarna rows (hosted, embedded) and a "Save my information" box (form), even on card-only sessions. `wallets: { link: "never" }` removes it from the Payment Element (Elements only).
- A Stripe field mounted under `display: none` never renders; hide inactive content with `visibility: hidden` instead.
- If our own form feeds Stripe the billing address (`updateBillingAddress()`), the Payment Element needs `fields.billingDetails: { name: "never", address: "never" }`, or `confirm()` throws an `IntegrationError`. The playground doesn't do this: the compliance address isn't the card's address, so Stripe collects the card's ZIP itself.

## Run it

1. In the Stripe dashboard (test mode), copy the publishable key (`pk_test_...`) and create a restricted key (`rk_test_...`) with **Checkout Sessions: Write**, or use the full `sk_test_...` key.
2. `cp .env.example .env` and fill in both keys.
3. `npm install && npm run dev`, then open http://localhost:4242.
4. Pay with `4242 4242 4242 4242`, any future expiry, any CVC. Discount codes: `LEVELUP` (25%), `WELCOME10` (10%, loses to the automatic 15%).

The secret key stays on the server; the browser gets only the publishable key, which Stripe designs to be public. The app refuses live keys.

## Deploying

Any Next.js host works; on Vercel, set `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in the project's environment variables. Every response carries `X-Robots-Tag: noindex, nofollow` (`next.config.ts`) and every page a matching robots meta tag, so search engines that find the URL won't index it. `.npmrc` sets `legacy-peer-deps` because `@mui/lab` 7 exists only as prereleases, which npm won't match against smoot-design's `^7.0.0` peer range.

## License

BSD 3-Clause; see `LICENSE`. `public/images/default_resource.jpg` is MIT Learn's default resource image, from [mitodl/mit-learn](https://github.com/mitodl/mit-learn) (also BSD 3-Clause, © MIT Office of Digital Learning).

## Stripe versions

`@stripe/stripe-js` loads Stripe.js release `endive`, and `stripe@23` pins API version `2026-11-18.endive`. Keep the two on the same release name when upgrading. That API version takes `allowed_payment_method_types` on Checkout Sessions, not `payment_method_types`.
