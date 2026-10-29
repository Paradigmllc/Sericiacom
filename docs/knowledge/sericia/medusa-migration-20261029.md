# Medusa migration — 2026-10-29

## Decision and scope

User approved migration away from Shopify because its base subscription is unaffordable, and explicitly authorized Cloudflare charges. No paid plugins. Reuse `medusa-backend/`, Medusa's database/API/admin, standard Stripe provider and standard S3 provider for R2. Existing Next storefront and Paradigm operations UI are not yet switched. No Shopify cancellation or DNS cutover until a verified replacement exists.

## Verified resources

- Cloudflare account Workers Paid is already active: USD 5/month plus usage; no new subscription purchased.
- R2 bucket `sericia-product-media` created in APAC, Standard storage, empty. Public access was not enabled. No images uploaded or S3 credentials created.
- Existing shared Hetzner `paradigm-prod-01` is running. Root disk 89%, 17GB available; existing release guard requires below 88%. Memory available ~7.3GB; swap usage ~11GB. Do not infer spare production capacity from free memory alone.
- Former SERICIA host `46.62.217.172` times out on SSH and is absent from the configured Hetzner project's server list. This does not prove every other Hetzner project/account has no server.
- Hetzner API currently quotes volumes at USD 0.0767/GB/month (net=gross in this account). 20GB would be USD 1.534/month. No volume purchased. A separate volume does not automatically reduce root usage: placement/migration plan and capacity validation remain necessary.

## Data preservation

Read-only Shopify export saved outside Git with mode 0600:
`/Users/apple/.codex/sericia-release-evidence/migration/shopify-catalog.json`.

- Products 6, variants 13, store currency **JPY**.
- SHA256 `d37c3074891c4c3493342cd0661c18939d57bd7bf7be49893c5e289200260607`.
- Includes source product/variant/inventory identifiers, options, prices, source description and image references. Does not contain a complete store backup, themes, orders or customers.
- Draft-only Medusa input plan generated beside the snapshot: `medusa-draft-plan.json`. No DB import has happened. Source image references stay in metadata pending rights verification. Source descriptions are metadata, not rendered HTML. Stock levels are not imported; products remain drafts, managed inventory, backorders disabled.

## Backend changes

- Medusa 2.4.0 -> 2.22.1, Node >=22.22 (Docker Node24), committed npm lock, reproducible npm ci.
- Explicit required connection/CORS/signing-secret validation. Worker/server split configurable. Redis event bus, workflow engine, locking, caching.
- Optional standard Stripe integration. Disabled by default; test keys required unless explicit live setting. Enabling a provider is not approval of merchant onboarding or commercial launch.
- Optional standard R2 S3 integration; all credentials required together and checksum compatibility options configured.
- Retired Crossmint callback returns HTTP410 and cannot create orders. Legacy storefront Crossmint code still remains and must be removed/replaced before storefront release.
- Release image starts as non-root. Database migrations run as a separate release step before either process starts.
- Dependency overrides: patched lodash4, Zod4 and BullMQ5; GraphQL utilities12.1 (upstream codegen transitively pinned10) and AJV8.20. Build/type/runtime checks must cover compatibility.
- Medusa's current product/promotion packages still resolve direct MikroORM imports. Keep the four direct MikroORM packages aligned to the version in @medusajs/deps (6.6.14); removing them caused module-not-found despite bundled reexports.

## Verification and remaining work

- Local config, retired payment endpoint and migration price/draft safety tests.
- Type check and Medusa backend/admin production build.
- CI covers clean npm install, security audit at high threshold, Docker build, PostgreSQL/Redis, migrations twice, health, unauthenticated admin rejection, retired callback and admin HTML.
- CI is not a full purchase E2E or a production deployment.
- Need isolated runtime/database, backup/restore drill, actual draft import and source-ID mapping, storefront Medusa cart/payment completion, shipping/tax/returns configuration, shared operations adapter, provider access and browser E2E.
- Legacy order email uses incorrect v2 currency scaling and unverified shipping promises; must fix before any customer messages. Do not send live mail from preview.
- Existing source/supplier permissions, warehouse credentials and social account authorization remain outstanding.

Official references:
- https://docs.medusajs.com/learn/deployment/general
- https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe
- https://docs.medusajs.com/resources/infrastructure-modules/file/s3
- https://developers.cloudflare.com/r2/pricing/
