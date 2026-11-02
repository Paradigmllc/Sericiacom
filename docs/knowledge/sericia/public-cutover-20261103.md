# Medusa public cutover — 2026-11-03

The user's latest instruction replaces the previous "keep Shopify public" plan.
Public infrastructure now uses Cloudflare Workers and the existing Hetzner Medusa
storefront. No Shopify origin fallback exists. Shopify billing is separate and
has not been cancelled by this deployment.

## Verified public routing

- Worker `sericia-medusa-storefront`, source `infra/storefront/edge`.
- Custom Domains `sericia.com` and `www.sericia.com` attached; www redirects to apex.
- Removed only former apexA23.227.38.65 and wwwCNAMEshops.myshopify.com (automatic
  TTL, observed300seconds). MX/TXT/other subdomains untouched. OAuth cannot edit
  DNS; existing browser sign-in used to remove conflicting records, then API
  attached custom domains. Wrangler automatic overwrite returned100117.
- Worker → authenticated `https://paradigmjp.com/_sericia-medusa/` → isolated
  storefront → private Medusa. `ORIGIN_TOKEN` remains in Wrangler secrets and
  mode0600 origin config, never Git. Traefik template is JSON installed as`.yml`.
- Router priority400000 deliberately exceeds the existing shared app's200000
  route; only exact host/prefix plus origin token selects this route. A lower
  priority produced an actual redirect loop during cutover, corrected and rechecked.
- Storefront joins Coolify proxy network via committed compose overlay. DB/Redis
  remain isolated. The application image remains7a5cc041 until payment release.
- Missing local image metadata was restored from the retained CI archive. Loaded
  imageID26e280282946b716b6c6886ee0e4a3e6bea742fc722adf8de344b55aeae8422e
  matches the running container. BuildID hash6d8f8b43fa6ce95112183307175c5d7e46e01dd2a77371e40763f34bfcef606a
  and home serverJS hash3e10f604cf53620e991d22dd6646b605a8ff1f1828f2a9d0ecafe87e37d272be
  match. OCI config digest differs from manifest imageID; do not conflate them.
- Edge unit tests/typecheck and CI41542948320 passed. HTTP checks verified home,
  ja, products, about, shipping, refund, privacy, legal, cart and checkout. Browser
  verified home→products; actual public home200 with X-Sericia-Platform:medusa.
- Legacy order/payment API410, private surfaces/unconnected API503; auth cookies
  not forwarded. All pages noindex/no-store; no customer purchase claim.

## Payment implementation / activation boundary

Standard Medusa payment collection/session and cart-completion APIs use its DB
and Redis workflow locks. The UI uses Stripe Payment Element, and verifies the
order through Medusa after any return. URL payment flags never confirm a purchase.
Existing Medusa payment webhook processing completes carts independently of a
browser return; the existing order.placed subscriber handles idempotent email
when configured. No second custom order/payment database is introduced.

Before activation, supply/configure the Stripe sandbox public/API/webhook keys,
verify exact webhookURL`https://sericia.com/hooks/payment/stripe_stripe`, assign
provider`pp_stripe_stripe` to the selling region, configure real stock/delivery,
and pass a sandbox purchase including duplicate/delayed webhook and customer
closing the browser. Then separately approve live financial activation.

Flags defaultclosed: backendSTRIPE_ENABLED, storefrontSERICIA_PAYMENTS_ENABLED,
edgePAYMENT_WEBHOOKS_ENABLED. Live keys additionally requireSERICIA_LIVE_PAYMENTS.
The API checks cookie-owned cart, region, items, authoritative total, shipping,
stock and provider before returning a Stripe client secret. Completion failure
instructs verification retry, not a second charge. Error logs exclude SDK payloads.

## Remaining commercial dependencies

Six draft products; stock levels zero; warehouse not contracted. Supplier/BASE
stock access, actual shipping prices/countries, legal commercial terms, Stripe
provider activation and live end-to-end purchase/fulfillment are not established.
SNS and customer-account integrations are not connected. Public migration does
not establish sellability or daily operations automation. Shopify cancellation
and any retained historical records require separate billing/account review.
