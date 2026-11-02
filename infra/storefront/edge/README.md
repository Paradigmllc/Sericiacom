# Medusa public ingress

Cloudflare Worker → HTTPS authenticated origin path on paradigmjp.com → existing
Next storefront → private Medusa. Shopify is not an upstream or fallback.
The backend/database remain private. Uses the existing Workers paid account.

- `wrangler deploy --config infra/storefront/edge/wrangler.jsonc` publishes the Worker
  and replaces only apex/www DNS via Custom Domains. Back up those records first.
- Configure `ORIGIN_TOKEN` using Wrangler secrets, with a matching high-entropy value
  substituted into `traefik.template.json`. Install it as a mode0600 **.yml** file
  in `/data/coolify/proxy/dynamic/` (JSON is valid YAML). Never commit the rendered file.
- Apply `compose.public.yaml` over the existing storefront compose. Verify the
  runtime image is present before recreation. An archived Docker image can be
  restored after verifying application build fingerprints against the running container.
- Test with `node --test infra/storefront/edge/worker.test.mjs` and verify public
  `X-Sericia-Release` and `X-Sericia-Platform` headers plus desktop/mobile navigation.
- Legacy order/payment routes return410; other unconnected APIs/private surfaces
  return503. Only Medusa checkout and catalog search APIs are routed. No Shopify or
  account auth cookies forwarded; server-only origin token never returned.
- The collection remains draft until supplier stock and delivery are established.
  Noindex/no-store stay enabled. Public site migration is NOT purchase readiness.
- Failed origin requests return503, never Shopify fallback or fabricated success.

Before changing these gates, connect/test the relevant service and update the
allowlist/tests. No automated Shopify cancellation: billing/contract termination
must be checked separately; domain migration does not stop the subscription.

Prior DNS observed2026-11-03: apex A23.227.38.65 (observed TTL300), www CNAME
shops.myshopify.com (observed TTL300). Email/TXT/MX are not part of this change.
For rollback, retain the Worker and previous version; disable the custom domains
and restore those two DNS records only if explicitly returning to Shopify.
