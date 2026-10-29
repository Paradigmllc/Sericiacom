# Medusa migration — 2026-10-29

## Decision and scope

User approved migration away from Shopify because its base subscription is unaffordable, and explicitly authorized Cloudflare charges. No paid plugins. Reuse `medusa-backend/`, Medusa's database/API/admin, standard Stripe provider and standard S3 provider for R2. Existing Next storefront and Paradigm operations UI are not yet switched. No Shopify cancellation or DNS cutover until a verified replacement exists.

## Verified resources

- Cloudflare account Workers Paid is already active: USD 5/month plus usage; no new subscription purchased.
- R2 bucket `sericia-product-media` created in APAC, Standard storage, empty. Public access was not enabled. Existing securely stored R2 credentials passed HeadBucket and a temporary Put/Get/Delete round trip against this bucket; no new S3 credentials created and no catalog images uploaded.
- Existing shared Hetzner `paradigm-prod-01` is running. Root disk 89%, 17GB available; existing release guard requires below 88%. Memory available ~7.3GB; swap usage ~11GB. Do not infer spare production capacity from free memory alone.
- Former SERICIA host `46.62.217.172` times out on SSH and is absent from the configured Hetzner project's server list. This does not prove every other Hetzner project/account has no server.
- Hetzner API currently quotes volumes at USD 0.0767/GB/month (net=gross in this account). 20GB would be USD 1.534/month. User subsequently approved this exact cost. Created volume `107303029` (`sericia-medusa-data`), ext4, attached and mounted at `/mnt/sericia-medusa-data`, with persistent fstab entry; 19GB free verified. Existing databases and backups were not moved or deleted. A separate volume does not reduce root usage; image builds happen in CI and data is placed on the new volume.

## Data preservation

Read-only Shopify export saved outside Git with mode 0600:
`/Users/apple/.codex/sericia-release-evidence/migration/shopify-catalog.json`.

- Products 6, variants 13, store currency **JPY**.
- SHA256 `d37c3074891c4c3493342cd0661c18939d57bd7bf7be49893c5e289200260607`.
- Includes source product/variant/inventory identifiers, options, prices, source description and image references. Does not contain a complete store backup, themes, orders or customers.
- Draft-only Medusa input plan generated beside the snapshot: `medusa-draft-plan.json`. The snapshot was subsequently imported into the isolated preview (verification below). Source image references stay in metadata pending rights verification. Source descriptions are metadata, not rendered HTML. Stock levels are not imported; products remain drafts, managed inventory, backorders disabled.

## Backend changes

- Medusa 2.4.0 -> 2.22.1, Node >=22.22 (Docker Node24), committed npm lock, reproducible npm ci.
- Explicit required connection/CORS/signing-secret validation. Worker/server split configurable. Redis event bus, workflow engine, locking, caching.
- Optional standard Stripe integration. Disabled by default; test keys required unless explicit live setting. Enabling a provider is not approval of merchant onboarding or commercial launch.
- Optional standard R2 S3 integration; all credentials required together and checksum compatibility options configured.
- Retired Crossmint callback returns HTTP410 and cannot create orders. Legacy storefront Crossmint code still remains and must be removed/replaced before storefront release.
- Release image starts as non-root. Database migrations run as a separate release step before either process starts.
- Dependency overrides: patched lodash4, Zod4 and BullMQ5; GraphQL utilities12.1 (upstream codegen transitively pinned10) and AJV8.20. Build/type/runtime checks must cover compatibility.
- The obsolete custom product/shipping-profile link duplicated the built-in Medusa link and failed DB migration; removed it. Verified twice against a new CI database.
- Medusa's current product/promotion packages still resolve direct MikroORM imports. Keep the four direct MikroORM packages aligned to the version in @medusajs/deps (6.6.14); removing them caused module-not-found despite bundled reexports.

## Verification and remaining work

- Local config, retired payment endpoint and migration price/draft safety tests.
- Type check and Medusa backend/admin production build.
- CI covers clean npm install, security audit at high threshold, Docker build, PostgreSQL/Redis, migrations twice, health, unauthenticated admin rejection, retired callback and admin HTML.
- CI run40828641186 passed: 12 tests/type/security threshold, Docker build, PostgreSQL/Redis, migrations twice, catalog import twice with real DB assertions, HTTP health/401/410/Admin HTML. Verified image artifact exported with 1-day retention. Runtime source commit1ae48492.
- CI is not a full purchase E2E or a production deployment.
- Isolated preview compose committed under infra/medusa; validated on host. Root-only deployment config generated at /opt/sericia-medusa-preview, independent passwords and signing secrets, localhost-only HTTP19000, server/worker resource caps, payments and mail disabled.
- Runtime deployment, draft import and backup restore are verified below. Still needed: storefront Medusa cart/payment completion, shipping/tax/returns configuration, shared operations adapter, provider access and browser E2E.
- Legacy order email currency scaling corrected to Medusa v2 major units; HTML fields escaped, unverified 48-hour EMS promise removed, provider errors rethrown for worker failure visibility, stable per-order idempotency key. Order mail remains disabled unless SERICIA_ORDER_EMAILS_ENABLED=true. Sender verification and delivery tests still required.
- Current dependency audit: high/critical/moderate 0, low9 through deepmerge in notification dependencies; unresolved, not an audit-zero claim.
- Existing source/supplier permissions, warehouse credentials and social account authorization remain outstanding.

Official references:
- https://docs.medusajs.com/learn/deployment/general
- https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe
- https://docs.medusajs.com/resources/infrastructure-modules/file/s3
- https://developers.cloudflare.com/r2/pricing/

## Verified image

Artifact from CI40828641186: SHA256 `3681c2f5ce1641e3b4351e8fa467c092a3a941cc2549fa9b8165215c9cf4e2d5`. Downloaded to the host directly and verified before loading. The archived image lives on the new volume; no host build is run. Existing shared application images/backups remain intact. Preview preflight checks >10GiB free on root and data volume, >4GiB available memory, then enforces per-service memory/CPU limits. The root disk percentage remains a constraint for later shared-app deployments.

## Deployed preview and verification

- Isolated compose stack `sericia-medusa-preview` is running: PostgreSQL/Redis healthy, Medusa server healthy, worker running. Bound only to 127.0.0.1:19000. Docker image `sericia-medusa:1ae48492`, verified archive above. No customer-facing DNS change.
- Real snapshot imported twice: **6 draft products, 13 variants, 13 JPY prices, 0 overselling variants, 0 stock levels**. No products published. No sales channel or region has been enabled for purchasing.
- DB backup `catalog-1ae48492.dump` restored to a disposable verification DB and checked for the same 6/13/13 counts, then verification DB removed. Backup retained on volume and copied to Mac; SHA256 `20816cc70ad0f0dc8cf07a0362f63f05a90bd9404f386f2f71d10f47d3796115` matches.
- Server/worker restart passed. HTTP health200, unauthenticated Admin401. Browser renders Medusa login screen; an admin was subsequently created and authenticated API access verified; authenticated browser E2E is not complete.
- `/app/login` response SHA256 matches the deployed image's `public/admin/index.html`: `6b0bffaa52f4ffacfc31fef4d19f6f5b8312e59eef309742c4098f9de33ddcf8`.
- Snapshot resource use: server~199MiB, worker~183MiB; limits2GiB/1GiB. Root disk now90% (~15GiB free), data volume~240MiB used/19GiB free. Root headroom is still a constraint; do not run future image builds on this host.
- R2 transport works, but public media domain and Medusa runtime R2 configuration remain pending. No images uploaded, no real Stripe keys or mail credentials injected.
- Remaining migration: secure admin access, current branded storefront/checkout replacement, Medusa adapter for existing operations dashboard/jobs, supplier/warehouse/SNS access, final store backup, cutover and Shopify cancellation. Shopify billing has not been stopped.

## Store API preparation — runtime 8630c832

- CI40839700759 passed all checks, including preparing the preview twice and actual HTTP Store API checks against PostgreSQL/Redis. Uses Medusa standard workflows ([reference](https://docs.medusajs.com/resources/commerce-modules/sales-channel/workflows)), with no new dependency or paid plugin.
- `prepare-storefront-preview` is dry-run unless SERICIA_PREVIEW_APPLY=true. Reuses channel/key/region; rejects duplicate, disabled, revoked or conflicting configuration. No countries, payments, product publication or inventory inferred.
- `check-storefront-preview` asserts missing-key rejection, empty public catalog, JPY cart, channel scoping, no payment providers, rejection of unavailable item, and no partial item after rejection. Creates one empty cart; no completed order or payment.
- First preview admin created without sending an invitation. Random password is saved only in macOS Keychain service `Sericia-Medusa-Preview-Admin`, business account email. Auth endpoint200 and authenticated Admin products200, 6 drafts verified. Existing Paradigm/Shopify passwords unchanged.
- Legacy storefront is NOT release-ready: products-medusa divides v2 major-unit amounts by100 and uses price_usd for other currencies; checkout still uses old custom ledger and Crossmint paths. Replace those paths before switching public DNS. These have not been deployed to the new preview.

- Deployed image `sericia-medusa:8630c832`, image ID `8bdbcba3dc88373ad17b09b592d9f26001aea153302ff534b8bc7bbca93ab6ca`. GitHub artifact12882611297 ZIP SHA `472bb52b4f24c28686315abcb04b8381e36054701aa17b0b986da066a35266c5` verified before extraction; image archive SHA `93875d4a458519c9eef5ef3c54ac0f6e982047dcffc08197c890fa5421466566` checked before load. Host was not used for building.
- Backup before update: volume `backups/pre-store-8630c832.dump`. Previous image/config retained. Applied preview preparation twice successfully; server healthy and worker running on new image; localhost health200. Authenticated Admin still returns6 drafts, inventory levels0.
- Store HTTP checks also passed on this deployed stack; one empty verification cart created. Runtime compiled prepare-script SHA `612ffa91f16c7eb9478a0a4df637e9824f821a7bb1e589460bcb53f39054ee6c`, check-script SHA `6a8f020ee7dddb5b3ae306ccbf5f38874cc1fff7aca4d89e5a9cf96a92130e94`.
- Public DNS, current Shopify storefront, shipping, Stripe and external supplier/warehouse/social connections were not changed. Root usage remains90%, so additional shared-app deployments must address the existing capacity guard.
