#### 📋 目次

| # | セクション |
|---|----------|
| 1 | [Why Hyperswitch (architecture overview)](#hs-arch) |
| 2 | [Sign up Hyperswitch Cloud](#hs-signup) |
| 3 | [Connect Stripe (production)](#hs-stripe) |
| 4 | [Connect PayPal (production)](#hs-paypal) |
| 5 | [Webhook configuration](#hs-webhook) |
| 6 | [Coolify env vars](#hs-env) |
| 7 | [\$1 live smoke test](#hs-smoke) |
| 8 | [Country / payment method matrix tuning](#hs-matrix) |
| 9 | [Operations / refunds / disputes](#hs-ops) |

---

# Sericia Hyperswitch Setup Runbook

> Operator runbook for activating Hyperswitch (Stripe + PayPal) as Sericia's
> production payment rail. Companion to `launch-operator-checklist.md`.
> Status target: end-to-end Drop #1 \$1 smoke test passing within 60 minutes.

<a id="hs-arch"></a>
## 1. Why Hyperswitch (architecture overview)

Sericia's checkout originally used Crossmint exclusively (USDC onramp via
card → token). Crossmint Sales hadn't activated production Onramp yet at
Drop #1 launch window, so we needed an immediate payment fallback.

Hyperswitch (Apache-2.0 OSS, Hyperswitch Cloud free tier) sits in front of
Stripe + PayPal as a unified API, giving us:

- **One integration, two PSPs**: storefront talks to Hyperswitch only;
  Stripe/PayPal connector keys live in Hyperswitch dashboard, not our env.
- **Country-routed methods**: `lib/payment-routing.ts` filters payment
  method types per ISO country. Hyperswitch silently drops any method the
  connected PSP doesn't support — over-listing is safe.
- **Free tier covers launch**: 100K txns/month free. Sericia's Phase 1
  target is 20/month; Phase 3 is 500/month. Three orders of magnitude
  headroom.
- **Crossmint stays parallel**: when Crossmint Sales activates, set env
  `NEXT_PUBLIC_CROSSMINT_ENABLED=true` and Crossmint reappears as a
  "Pay with crypto (USDC)" accordion below the primary rail.

Storefront integration:
```
Customer → /checkout              (cart-checkout-form, no change)
        → POST /api/orders/create-cart  (existing — creates sericia_orders row)
        → /pay/[orderId]            (new provider switch)
        → HyperswitchPayment        (HyperLoader.js embedded element)
        → POST /api/hyperswitch/create-intent
        → window.Hyper.confirmPayment()
        → /thank-you/[orderId]      (Hyperswitch redirects on success)
        ⤷ /api/hyperswitch/webhook   (server-side: mark paid + Slack +
                                      decrement Medusa stock + Resend)
```

<a id="hs-signup"></a>
## 2. Sign up Hyperswitch Cloud

1. https://app.hyperswitch.io/dashboard/register
2. Sign up with `tomohiro@sericia.com` (forwards to `apple.info.9124@gmail.com`
   via Cloudflare Email Routing — receive the verification email there)
3. Complete email verification
4. Create organisation: **Sericia** (or whatever brand display you prefer)
5. Create the **Production** profile (skip Test if you want — but Test is
   useful for the smoke section below before you flip live)

After dashboard loads, copy three values into `~/.claude/projects/.../memory/reference_api_keys.md`:

| Field | Where to find it |
|-------|------------------|
| **API key (server)** | Developers → API keys → "Create new key" → name "sericia-storefront-server" → copy `snd_...` (sandbox) or production key |
| **Publishable key**  | Developers → API keys → publishable key column |
| **Profile ID**       | Profiles → "default" or "Sericia" → copy `pro_...` |

<a id="hs-stripe"></a>
## 3. Connect Stripe (production)

You need a **Stripe production account** with:
- Business verified (corporate Sericia / Paradigm LLC profile)
- Payment activated (`activated: true` on Stripe dashboard)
- US bank account or Wise USD account on file

Then in Hyperswitch Console:

1. Connectors → Add → **Stripe**
2. Profile: select the production profile
3. Connector account label: `sericia-stripe-prod`
4. Paste **Stripe `sk_live_...` secret key** (Hyperswitch encrypts at rest)
5. Webhook endpoint: leave default (Hyperswitch handles Stripe webhooks
   internally; we only listen to **Hyperswitch's** webhook — see §5)
6. Payment methods to enable on Stripe connector:
   - `card` ✅
   - `apple_pay` ✅ (requires Apple Pay domain verification — see step 7)
   - `google_pay` ✅
   - `klarna` (optional Phase 2)
   - `afterpay_clearpay` (optional Phase 2)
7. **Apple Pay domain verification**: Hyperswitch dashboard → Connectors →
   Stripe → "Verify Apple Pay domain" → enter `sericia.com` → Hyperswitch
   uploads the Apple Pay association file. Confirm at:
   ```bash
   curl -sI https://sericia.com/.well-known/apple-developer-merchantid-domain-association | grep -i "200 OK"
   ```
8. Save → Stripe connector status should turn green within 30s

<a id="hs-paypal"></a>
## 4. Connect PayPal (production)

You need a **PayPal Business account** (NOT personal). If you don't have one:
1. https://www.paypal.com/business → Sign up
2. Use Paradigm LLC business name + EIN
3. Verify with first US bank account

Then in PayPal developer dashboard:
1. https://developer.paypal.com/dashboard/applications/live → Create app
2. App name: `Sericia Production`
3. Copy the **Client ID** and **Secret**

In Hyperswitch Console:
1. Connectors → Add → **PayPal**
2. Profile: select the same production profile as Stripe
3. Paste **Client ID** and **Secret**
4. Webhook URL: leave default
5. Payment methods:
   - `paypal` ✅
6. Save → green status within 30s

Country activation: PayPal supports US/UK/EU/AU/CA/SG/JP by default. Hyperswitch
auto-routes PayPal-eligible countries; cross-reference `lib/payment-routing.ts`
matrix.

<a id="hs-webhook"></a>
## 5. Webhook configuration

Hyperswitch sends ONE outbound webhook (regardless of which connector handled
the payment) signed with HMAC SHA-512. Configure in dashboard:

1. Developers → Webhooks → Add new endpoint
2. Endpoint URL: `https://sericia.com/api/hyperswitch/webhook`
3. Events to subscribe:
   - `payment_succeeded` ✅
   - `payment_failed` ✅
   - `refund_succeeded` (Phase 2)
4. Save → copy the **Webhook Secret** (`whsec_...`)
5. Add to Coolify env (next section): `HYPERSWITCH_WEBHOOK_SECRET=whsec_...`

The webhook handler is fail-close in production: missing
`HYPERSWITCH_WEBHOOK_SECRET` → 503 + log-out. Hyperswitch retries 5xx with
exponential backoff (max 24h), so legit events survive a config gap.

<a id="hs-env"></a>
## 6. Coolify env vars

Add these in Coolify storefront app → Environment → Save → Redeploy:

```
HYPERSWITCH_API_URL=https://api.hyperswitch.io
HYPERSWITCH_API_KEY=<server API key from §2>
HYPERSWITCH_PROFILE_ID=<profile id from §2>
HYPERSWITCH_WEBHOOK_SECRET=<webhook secret from §5>
NEXT_PUBLIC_HYPERSWITCH_PUBLISHABLE_KEY=<publishable key from §2>
```

Verify after redeploy:
```bash
# Should return 503 (HMAC missing in unsigned curl) NOT 503 (env missing)
curl -sI -X POST https://sericia.com/api/hyperswitch/webhook -d '{}' | head -3
# Status: 401 invalid_signature (this is correct — HMAC required) ✅
# vs 503 webhook_misconfigured (env still missing) ❌
```

<a id="hs-smoke"></a>
## 7. \$1 live smoke test

After §3 + §4 + §5 + §6 complete, run end-to-end on production:

1. Open `https://sericia.com/products` in incognito (cold cookie state)
2. Add 1 unit of Sencha to cart, proceed to checkout
3. Fill in your real address + email
4. Hit "Continue to payment" → land on `/pay/[orderId]`
5. Wait for Hyperswitch element to render (~2s)
6. Pay with **your real card** for $1 (use a $1 test product — set up via
   Medusa admin if needed, OR use an admin discount code to bring an
   existing product to $1)
7. Watch:
   - Stripe dashboard → Payments → see the $1 charge
   - Hyperswitch dashboard → Payments → see the same payment routed
   - Slack `#all-paradigm` → fire `paid` Block Kit message within 5s
   - `tomohiro@sericia.com` inbox → Resend confirmation arrives
   - Storefront `/thank-you/[orderId]` → renders correctly
8. **REFUND immediately** via Stripe dashboard (not Hyperswitch — Stripe
   refunds are irrevocable, simpler accounting)

If any step fails, see §9 ops triage section.

<a id="hs-matrix"></a>
## 8. Country / payment method matrix tuning

The matrix lives in `storefront/lib/payment-routing.ts`. To tune:

1. Edit `PAYMENT_MATRIX` for the country code
2. Save + commit + deploy
3. Hyperswitch silently filters server-listed methods to what's actually
   configured on connectors (Stripe + PayPal) — over-listing is safe

Per-country defaults shipped in F54:
- US/CA/UK/EU (DE/FR/NL): card + Apple Pay + Google Pay + PayPal
- AU/SG/JP: same + PayPal
- HK/TW/KR/AE: cards + wallets only (PayPal weak penetration)

Phase 2 additions worth considering when volume justifies:
- DE/FR/NL: SEPA Debit + iDEAL (NL only)
- JP: Konbini convenience-store cash payment
- AU: Afterpay Clearpay
- DE/UK/US: Klarna (Pay in 4)

<a id="hs-ops"></a>
## 9. Operations / refunds / disputes

### Refund flow

Customer-initiated refund:
1. Customer emails `contact@sericia.com` with order id
2. Operator opens Hyperswitch dashboard → Payments → search order id
3. Click "Refund" → enter amount → submit
4. Hyperswitch routes refund to Stripe (or PayPal) automatically
5. `payment_refunded` webhook arrives at `/api/hyperswitch/webhook`
   (Phase 2 — currently we manually update sericia_orders.status="refunded")

### Dispute / chargeback

Stripe + PayPal disputes flow through Hyperswitch dashboard:
1. Email alert from Hyperswitch → operator triages
2. Provide evidence (shipping proof, customer signature, EMS scan) via
   Stripe dashboard (chargeback-only feature)
3. Mark sericia_orders.status="disputed" manually
4. Phase 2: automate via `payment_disputed` webhook → Slack escalation

### Daily reconciliation

Each morning:
- Hyperswitch dashboard → Reports → Yesterday's transactions
- Compare to `sericia_orders WHERE created_at::date = yesterday AND status = 'paid'`
- Investigate any mismatch (network blip = order paid in Hyperswitch but
  webhook never landed; rare but possible)

Reconciliation query:
```sql
select id, email, amount_usd, crossmint_order_id as provider_id, paid_at
from sericia_orders
where status = 'paid' and paid_at::date = current_date - 1
order by paid_at;
```

The `crossmint_order_id` column is reused for Hyperswitch payment_ids (start
with `pay_`). Crossmint ids start with `cm_`. Disambiguates by prefix.
