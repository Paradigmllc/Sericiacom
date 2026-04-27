#### 📋 目次

| # | セクション |
|---|-----------|
| 1 | [Baseline (F16 audit) measured numbers](#rel-1) |
| 2 | [Layer 1 — Cloudflare cache rules](#rel-2) |
| 3 | [Layer 2 — ISR warm-up after deploy](#rel-3) |
| 4 | [Layer 3 — Rate limiter middleware](#rel-4) |
| 5 | [Layer 4 — Hetzner upgrade path](#rel-5) |
| 6 | [Pre-launch checklist (Reddit / SNS drop)](#rel-6) |

---

# Sericia reliability runbook

Operational handbook for surviving SNS / Reddit / press traffic spikes
on the current Hetzner CPX22 (2 vCPU, 4 GB RAM, ~$11/mo) without
moving to a $200/mo platform. Layered defence: edge cache → origin
warm cache → rate limit → vertical scale.

<a id="rel-1"></a>

## 1. Baseline (measured 2026-04-28, post-F15)

| Endpoint | Cold (1st hit after deploy) | Warm (2nd hit) | Notes |
|----------|------------------------------|----------------|-------|
| `/` (homepage) | 6.2 s | ~2 s | Heaviest page; CinematicVideo + Payload + Medusa |
| `/products` | 2.2 s | 0.8 s | Listing of 56 |
| `/products/<slug>` (PDP) | 2.1 s | 0.5 s | ISR=30s |
| `/journal` | 3.9 s | 1.4 s | Hybrid index pulls 3 sources |
| `/tools/<name>` | 2.0 s | 0.5 s | ToolPageShell + JSON-LD |
| `/api/products/search-index` | 1.2 s | 0.2 s | Cached server-side |

**10-parallel burst on /products with cache-buster** (worst case):
all 10 returned 200, latencies 2.8 s – 5.4 s, total wall 5.9 s.
CPX22 survives moderate concurrent cold paths; **>20 concurrent cold
will tank**.

<a id="rel-2"></a>

## 2. Layer 1 — Cloudflare cache rules

**Why first**: every request that returns from edge cache never touches
Hetzner. Reddit hug-of-death (200-500 req/s for 10 min) becomes
a non-event if 99% hits are CF edge.

### Rules to add in CF Dashboard → Cache → Cache Rules

1. **Cache static asset paths aggressively**
   - Match: `URI Path` matches `/_next/static/*`
   - Action: `Cache eligible` + Edge TTL `1 month` + Browser TTL `1 month`

2. **Cache HTML for storefront pages — short TTL, SWR**
   - Match: `URI Path` matches one of:
     `/`, `/products`, `/products/*`, `/journal`, `/journal/*`,
     `/articles/*`, `/guides`, `/guides/*`, `/tools`, `/tools/*`,
     `/about`, `/shipping`, `/refund`, `/terms`, `/accessibility`
   - Action: `Cache eligible` + Edge TTL `2 minutes` (matches Next ISR
     window) + Browser TTL `0` + Stale-while-revalidate `1 hour`
   - Bypass conditions:
     - `Request Method` is `POST`
     - URI has cookie `sb-*-auth-token` (logged-in users see fresh)

3. **Never cache `/api/*` or `/cms/*` or `/account/*` or `/checkout`**
   - Match: `URI Path` matches `/api/*` OR `/cms/*` OR `/account/*` OR `/checkout`
   - Action: `Bypass cache`

4. **Always-Online (already on by default)** — serves last-known-good
   page from CF edge if origin returns 5xx.

### Verification

After adding the rules, hit `/products` twice from a fresh location
and check `cf-cache-status` header:

```
curl -sI https://sericia.com/products | grep -i cf-cache-status
# Expected on 2nd hit: HIT (or REVALIDATED on stale)
```

<a id="rel-3"></a>

## 3. Layer 2 — ISR warm-up after deploy

After every Coolify deploy the storefront container restarts → all
Next.js HTML caches and `unstable_cache` maps go cold. The first
visitor pays a 2-6 s render. Pre-warming side-steps this entirely.

### Manual

```
SERICIA_BASE_URL=https://sericia.com npm run warmup
```

Reads `/sitemap.xml` (currently 102 URLs), hits each sequentially
with a `Sericia-Warmup/1.0` UA. Logs slow URLs (>3 s) at the bottom
so we can flag regressions.

### Automated

Add an n8n workflow node after the Coolify deploy webhook fires:

1. Trigger: HTTP webhook from Coolify on deploy `succeeded`
2. Wait: 60 s (let container boot + payload migrations settle)
3. Action: HTTP request to a `/api/warmup` endpoint OR `npm run warmup`
   in a one-shot Node container.

Cost: ~30 s of CPU once per deploy. Worth it.

<a id="rel-4"></a>

## 4. Layer 3 — Rate limiter middleware

**File**: `storefront/middleware.ts` (F16 in-process limiter).

| Path prefix | Limit | Window |
|-------------|-------|--------|
| `/api/dify-chat*` | 20 req | 60 s |
| `/api/orders/*` | 30 req | 60 s |
| `/api/*` (default) | 60 req | 60 s |
| `/api/auth/*` | unlimited | (OAuth bursts ok) |

Returns 429 with `retry-after` and `x-ratelimit-*` headers. Map is
per-process (no Redis); a redeploy resets buckets, which is fine for
the threat model (single bot client).

### NOT what this protects against

- Distributed botnet → **needs Cloudflare WAF rules**
- Slow-loris on `/api/dify-chat` → CF + Hetzner timeout already kills
- Brute-force on `/api/login` → Supabase rate limits at provider level

<a id="rel-5"></a>

## 5. Layer 4 — Hetzner CPX22 → CPX32 ready button

When CPU pegs at 100% sustained for >5 min during a real spike, scale
up the box. CPX32 doubles vCPU + RAM for ~$22/mo (vs CPX22 ~$11).

### Steps (~3 min downtime)

1. Hetzner Cloud Console → server `46.62.217.172` → "Rescale"
2. Pick `CPX32` (4 vCPU / 8 GB / 160 GB SSD)
3. Confirm — Hetzner reboots the host and boots into the new size
4. Coolify's helper containers come back automatically
5. Verify `df -h /` shows the same disk + `free -h` shows ~8 GB

The Hetzner rescale is non-destructive and reversible. Once traffic
calms, scale back to CPX22 to save the $11.

### When to consider permanent CPX32

- Sustained > 50 concurrent visitors for several days
- pSEO drain → 200+ articles/night
- Adding heavy workloads (image processing, real-time inventory sync)

<a id="rel-6"></a>

## 6. Pre-launch checklist (Reddit / SNS drop)

Before posting:

- [ ] Cloudflare cache rules section active (CF dashboard)
- [ ] Last deploy is at least 5 min old (so pre-warm has happened)
- [ ] `npm run warmup` ran after the last deploy (manual verify)
- [ ] Rate limiter is live (`grep -c "rate_limited" storefront/middleware.ts` > 0)
- [ ] Hetzner CPX32 button is one click away (operator knows where it is)
- [ ] Slack `#all-paradigm` is monitored — Uptime Kuma alerts wired
- [ ] Optional: pre-stage a CPX32 rescale during off-hours so first
      real spike doesn't include the 3-min reboot window

After posting:

- [ ] Watch `docker stats` for the storefront container — RAM > 2.5 GB
      OR CPU > 90% sustained ⇒ rescale
- [ ] Watch Cloudflare Analytics → Cache Hit Ratio. Goal ≥ 85% on
      HTML routes. < 60% means the cache rule isn't matching — debug
      by inspecting CF response headers on a sample request.
- [ ] If 502s appear: SSH `docker logs --tail 200 <storefront>` to
      confirm OOM (kill -9 OOMKiller line) → rescale CPX32 immediately.
