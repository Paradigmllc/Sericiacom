/**
 * F54 — Active payment providers feature flag.
 *
 * Sericia ships with TWO production payment rails:
 *
 *   A. Hyperswitch  → Stripe + PayPal (cards, Apple/Google Pay, PayPal)
 *      Live now. Routes per `payment-routing.ts` country matrix.
 *      Sales team enabled these connectors in Hyperswitch dashboard,
 *      so day 1 of Drop #1 has working real-card payments.
 *
 *   B. Crossmint   → USDC on Polygon/Base (card → crypto onramp)
 *      Pending Sales Onramp activation (sales form submitted
 *      2026-04-30, SLA 1-3 business days). Until activation, the
 *      Crossmint UI must NOT render — the iframe would 400 with
 *      "Onramp is not yet enabled for production use" and the
 *      visitor would think the whole checkout is broken.
 *
 * Operator control is by env var, not code change. To enable Crossmint
 * once Sales approves, set `NEXT_PUBLIC_CROSSMINT_ENABLED=true` in
 * Coolify and redeploy. No code edit required.
 *
 * UX modes:
 *   "hyperswitch_only"   → only Stripe/PayPal embed shown
 *   "both"               → Hyperswitch primary + small "Pay with crypto"
 *                          accordion link reveals Crossmint embed
 *
 * Crossmint never displays alone — Stripe/PayPal stays the default rail
 * for all customers. Crossmint is positioned as an alternative payment
 * method (the right luxury-D2C pattern: stable rail primary, novel rail
 * as opt-in for crypto-native customers).
 */

export type PaymentProviderMode = "hyperswitch_only" | "both";

/**
 * Resolve which providers should render at checkout.
 *
 * Server-only call: uses non-public env vars (PAYMENT_MODE_OVERRIDE) and
 * MUST NOT be invoked from a "use client" file. Client components receive
 * the resolved mode via props from server components.
 */
export function getActiveProviders(): {
  mode: PaymentProviderMode;
  hyperswitchEnabled: boolean;
  crossmintEnabled: boolean;
} {
  // Default: Hyperswitch only. Crossmint requires explicit opt-in via env.
  const crossmintEnabled =
    (process.env.NEXT_PUBLIC_CROSSMINT_ENABLED ?? "").toLowerCase() === "true";
  const hyperswitchEnabled = true; // Always on — primary rail.

  return {
    mode: crossmintEnabled ? "both" : "hyperswitch_only",
    hyperswitchEnabled,
    crossmintEnabled,
  };
}
