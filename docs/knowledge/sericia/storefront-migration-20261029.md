# Storefront migration — 2026-10-29

## Scope

Reuse existing storefront components, Medusa catalog API and standard pricing. No paid plugin, external message, charge or completed order. Public Shopify and DNS unchanged.

## Changes

- Replace the USD-only product/view/cart field with `price` and `currency` throughout catalog listings, PDP, JSON-LD, search, wishlist, recently viewed and cart. Historical Supabase USD order/drop fields stay unchanged.
- Use region.currency_code and calculated_price in major units. Missing/invalid/mismatched prices fail explicitly instead of displaying zero. Regional lookup failures are not cached indefinitely. Catalog failures reach a retryable error boundary.
- Mixed-currency cart additions fail without mutation. Version2 of browser-only cart/wishlist/recent history discards legacy cached prices whose unit/currency was ambiguous. No server customer/order data is deleted.
- Legacy USD checkout rejects non-USD products before writes; its UI disables non-USD submission and USD referral discounts. This is a migration guard, not completed Medusa checkout.
- Remove unsupported free-shipping/delivery promises from touched cart/PDP structured data. Other legacy brand/drop/shipping content still needs migration review before public cutover.
- Crossmint UI and SDK removed. `/api/pay/create` and `/api/crossmint-webhook` return410 with no body parsing, DB/stock/order changes or notifications. Historical ledger fields retained.
- Next16.4.3, Payload3.92.1, React19.2.7, Node>=24.22.1. Clean npm lock replaces legacy-peer-deps installation. Stripe22.1.1 stays pinned, preserving existing API version. DOMPurify3.4.17/graphql-scalars2.0.1/happy-dom21.0.4 overrides patch vulnerable transitive versions; production build must verify compatibility.
- Lazy Supabase initialization avoids import-time build failure without credentials. CMS calls explicitly reject missing DB/signing configuration. Guides skip prerendering when the content database is unconfigured; runtime errors remain visible.

## Verification

- Four local tests pass: major-unit JPY/decimalUSD, regional price selection/rejection, mixed-currency cart atomicity, retired payment routes410 without service initialization.
- TypeScript passes. Next production webpack build passes on Node24.22.1 without production credentials. New CI uses npm ci, type generation/check, tests, audit, production build and Playwright.
- Actual isolated Medusa API: transient clearly labelled pricing fixture returned calculated_amount1200, currencyjpy, inventory0 using the storefront field projection. Fixture deleted in finally. No real product published, no order created.
- Audit: high0, critical0, moderate5, low12 (remaining findings are not represented as audit-zero).
- Local build initially exhausted disk. Removed only dependency backup and build cache created in this task; existing project data/server backups preserved. Current source remains in migration worktree.
- Playwright desktop/mobile6 checks passed locally; CI40871577555 and deployed storefront verification also passed all six checks. Backend deployment remains8630c832 until explicitly updated. This is not production cutover or commercial readiness.

## Remaining

Standard Medusa variant/cart/order/payment flow, current non-food-inclusive branding and actual catalog images, operations adapter, supplier/warehouse/social provider access, CMS/account migration, Cloudflare routing, capacity headroom, final backup and Shopify cancellation.

References: [Next security update](https://nextjs.org/blog/nextjs-security-update-october-14-2026), [Payload Next support](https://github.com/payloadcms/payload/discussions/14330).

## Preview privacy and availability

- Browser testing exposed a header crash when account credentials are missing. Account service failures now show an unavailable control and toast while leaving guest browsing/cart usable.
- Removed telephone links and unconfigured editorial/legal fallback copy from the footer. Announcements/coupons now require explicit CMS enablement and content. Cleared remaining free-shipping/48-hour promises from the cart surfaces.
- Replaced the old hardcoded legal disclosure (personal defaults and unverified operational terms) with a bilingual pre-launch notice. This is deliberately **not** a claim of legal launch readiness. Before sales, verify business terms and a functioning disclosure-request procedure. [CAA guidance](https://www.no-trouble.caa.go.jp/qa/advertising.html-2) permits omission only under its conditions; no such readiness is inferred from removing text.
- Added desktop/mobile browser checks for currency persistence, quantity changes, removal, retired routes, unavailable account control and absence of unconfigured promotion/telephone links.

## Isolated deployment evidence

- Source73fb662f; CI40871577555 success (clean install, four unit tests, typegen/tsc, audit threshold, production build, six browser checks, container build). Backend regression CI40871577480 also success.
- Artifact12896053798 ZIP SHA256 `d1138cb77f53564b8de1ff450bba52206eaf2d1b1f4d910b4782e69cece5193b`; inner image archive SHA256 `5e2ad30313135ec82f57575b4e9c0369d4c4419bb33a7df26bf54dc236d68582` verified before loading.
- Image `sericia-storefront:73fb662f`, ID `f560588001616d340c8d301c78e4477f253f327f00b6c0ac204f2a8bab1acee8`, running healthy. Compose under `/opt/sericia-storefront-preview`, private env mode0600, localhost18000 only, no public DNS change. Backend remains8630c832.
- `/products`, `/cart`, `/tokushoho`, `/api/products/search-index` HTTP200; search products empty as expected for six unpublished drafts. Admin login200, product query200, six drafts retained.
- Deployed desktop/mobile browser checks: six passed27.8s, including JPY1200→2400 browser-only fixture, reload/removal, retired endpoints410 and privacy/promotion checks. No real order/payment, supplier or warehouse call. Expected account-service unavailability is visible; CMS/account configuration intentionally absent.
- Served chunk `4bd1b696-8cd12253b448cc13.js` SHA256 `898c71c4da75489e3cf225ab3cd3d44d6232a491ee816510ba79b6e3ac17885e` matches container. New retired-route response and legal notice verified over deployed HTTP.
- Post-deploy root93% /12GiB free; dedicated volume18GiB free. No unrelated service, backup or image removed. Capacity remains a blocker for broad production migration; preview is resource-capped and not evidence of production readiness.
- SSH tunnel exposes preview locally at `http://127.0.0.1:18000` while connection persists. It is not a public/shareable website URL.
