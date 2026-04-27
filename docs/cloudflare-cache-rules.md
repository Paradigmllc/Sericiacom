#### 📋 目次

| # | セクション |
|---|-----------|
| 1 | [Why this matters](#cf-1) |
| 2 | [Rule 1 — static assets](#cf-2) |
| 3 | [Rule 2 — HTML pages](#cf-3) |
| 4 | [Rule 3 — bypass dynamic paths](#cf-4) |
| 5 | [Verification — `cf-cache-status: HIT`](#cf-5) |
| 6 | [Rollback](#cf-6) |

---

# Cloudflare cache rules — admin runbook

`Server: cloudflare` is already on every response (verified
2026-04-28). Sericia's domain is proxied through CF — what's missing
is **caching rules**. Without rules every request becomes
`cf-cache-status: DYNAMIC` (passthrough) and the Hetzner CPX22 takes
the full hit during a Reddit/SNS spike. This runbook adds three rules
that flip the cache-hit ratio from ~0% → 90%+ on HTML routes.

**Time to apply: 5 minutes. Reversible.**

<a id="cf-1"></a>

## 1. Why this matters

Baseline measured 2026-04-28 (post-F15):

| Endpoint | Cold render | Without CF cache | With CF cache (estimated) |
|----------|-------------|------------------|---------------------------|
| `/` | 6.2 s | 6.2 s every visitor | ~80 ms (CF edge) |
| `/products` | 2.2 s | 2.2 s every visitor | ~80 ms |
| PDP | 2.1 s | 2.1 s every visitor | ~80 ms |

The 80 ms target = "request never touched the origin". For Reddit
spike survival this is the only number that matters.

<a id="cf-2"></a>

## 2. Rule 1 — Static assets (aggressive cache)

**Where**: Cloudflare Dashboard → `sericia.com` → Caching → Cache Rules → Create rule

| Field | Value |
|-------|-------|
| Rule name | `Static assets — long cache` |
| When incoming requests match | Custom filter expression |
| Expression | `(starts_with(http.request.uri.path, "/_next/static/")) or (starts_with(http.request.uri.path, "/placeholders/")) or (http.request.uri.path eq "/favicon.ico") or (http.request.uri.path eq "/og-default.svg") or (ends_with(http.request.uri.path, ".svg")) or (ends_with(http.request.uri.path, ".woff2"))` |
| Then | `Cache eligible` |
| Edge TTL | `Override origin → 1 month` |
| Browser TTL | `Override origin → 1 month` |

**Why**: `/_next/static/*` paths are content-hashed by Next.js — they
never change for a given hash, so 1 month is safe. SVG/woff2 brand
assets are similar.

<a id="cf-3"></a>

## 3. Rule 2 — HTML pages (short cache + SWR)

| Field | Value |
|-------|-------|
| Rule name | `Storefront HTML — 2 min cache + SWR` |
| Expression | `(http.request.uri.path eq "/") or (http.request.uri.path eq "/products") or (starts_with(http.request.uri.path, "/products/")) or (http.request.uri.path eq "/journal") or (starts_with(http.request.uri.path, "/journal/")) or (starts_with(http.request.uri.path, "/articles/")) or (http.request.uri.path eq "/guides") or (starts_with(http.request.uri.path, "/guides/")) or (http.request.uri.path eq "/tools") or (starts_with(http.request.uri.path, "/tools/")) or (http.request.uri.path in {"/about" "/shipping" "/refund" "/terms" "/accessibility" "/faq" "/sitemap" "/tokushoho"})` |
| Then | `Cache eligible` |
| Edge TTL | `Override origin → 2 minutes` |
| Browser TTL | `0 seconds` |
| Stale while revalidate | `1 hour` |
| Bypass cache on cookie | enable, value: `sb-yihdmgtxiqfdgdueolub-auth-token` |

**Why each setting**:
- 2-minute Edge TTL matches the storefront's Next.js `revalidate=60`
  windows — CF won't serve stale HTML longer than the origin already
  considers stale.
- 0 second Browser TTL means a logged-in user who hits Cmd-R always
  gets the live shell from CF, never their own browser cache.
- 1-hour SWR is the magic — if the origin is down OR the 2 min
  expires, CF still serves the stale HTML *and* asynchronously
  revalidates from origin. Visitors NEVER see a 502 until the SWR
  window itself expires.
- The auth-token cookie bypass means signed-in users see live data
  (their wishlist count, etc.) — only anonymous traffic is cached.

<a id="cf-4"></a>

## 4. Rule 3 — Dynamic paths (bypass cache entirely)

| Field | Value |
|-------|-------|
| Rule name | `Dynamic paths — bypass` |
| Expression | `(starts_with(http.request.uri.path, "/api/")) or (starts_with(http.request.uri.path, "/cms/")) or (starts_with(http.request.uri.path, "/account/")) or (http.request.uri.path eq "/checkout") or (http.request.uri.path eq "/cart")` |
| Then | `Bypass cache` |

**Why**: any cached `/api/orders/create-cart` response = catastrophic
data leak. Cart and checkout must hit origin every time.

**Order matters**: place this rule **above** Rule 2 so the bypass
wins when paths overlap (e.g. some hypothetical `/products/api/...`
path).

<a id="cf-5"></a>

## 5. Verification — `cf-cache-status: HIT`

After applying all three rules, hit `/products` from a fresh location
twice and check the response header:

```
curl -sI https://sericia.com/products | grep -i cf-cache-status
# 1st hit: MISS
# 2nd hit (within 2 min): HIT
# 2-30 min later: REVALIDATED (SWR)
```

Expected ratios after 24h with real traffic:

- `/` and `/products` → 90%+ HIT
- PDP `/products/*` → 70%+ HIT (long tail of slugs)
- `/api/*` → 0% HIT (correct — they should never cache)

If you see `cf-cache-status: DYNAMIC` for an HTML route, the rule
didn't match — review the expression in Rule 2.

<a id="cf-6"></a>

## 6. Rollback

Each rule has a toggle in the dashboard. To roll back:

1. Cache → Cache Rules
2. Toggle the rule "Off" — instant. CF stops caching new requests
   matching that rule.
3. Existing CF-cached HTML continues serving until its 2-minute Edge
   TTL expires (so worst-case 2 minutes of slightly-stale content).
4. Origin starts seeing 100% traffic again — CPX22 should still
   handle it under non-spike conditions.

No cache purge required for the rollback to take effect.

If aggressive purge is needed during a debug session:

> Cache → Configuration → Purge Cache → Purge Everything

Effective immediately. Use sparingly — every purge cold-starts the
edge globally and the next visitor pays the origin render bill.
