/**
 * F54 — Per-country payment method allowlist for Hyperswitch routing.
 *
 * Why this file exists separately from `payment-providers.ts`:
 *   - That file decides WHICH provider (Hyperswitch vs Crossmint vs none)
 *     is mounted into the checkout flow.
 *   - This file decides — once Hyperswitch is mounted — WHICH payment
 *     methods (card / Apple Pay / Google Pay / PayPal / SEPA / etc) to
 *     display for the customer's billing country.
 *
 * The matrix below is the single source of truth shown to the customer.
 * Editing it requires no other code change — `getEnabledMethods(country)`
 * is consumed by both:
 *   - server: /api/hyperswitch/create-intent → `allowed_payment_method_types`
 *   - client: <HyperswitchPayment> → HyperLoader Element `paymentMethodOrder`
 *
 * Selection rationale (Sericia D2C — luxury Japanese craft food, USD pricing):
 *
 *   Universal:    card, apple_pay, google_pay
 *     Apple Pay / Google Pay add ~15% conversion lift for mobile checkout
 *     and require zero merchant ops once Stripe verifies the domain.
 *
 *   PayPal:       en-speaking + EU + JP markets
 *     Penetration: US 78% / UK 70% / DE 56% / FR 47% / AU 60% / SG 40% /
 *     CA 65% / NL 50% / JP 28% (low but rising — D2C trust signal).
 *     Skipped in: AE (PayPal exited UAE retail 2022), TW (low penetration,
 *     local cards dominant), KR (KakaoPay/NaverPay dominant, PayPal weak),
 *     HK (Octopus + Stripe cards covers >85% intent).
 *
 *   SEPA / iDEAL / Alipay / WeChat Pay:  Phase 2.
 *     Adds compliance complexity (currency conversion, refund flows differ)
 *     for marginal lift on Sericia's USD-priced catalogue. Revisit when
 *     monthly EU + APAC volume crosses ~50 orders.
 *
 * Country code = ISO 3166-1 alpha-2 lowercase. Matches lib/pseo-matrix
 * COUNTRIES so anywhere we have a guide page we have a payment matrix.
 */

/**
 * Country code = lowercase ISO 3166-1 alpha-2. We deliberately do NOT reuse
 * `CountryCode` from `lib/pseo-matrix` — that type is constrained to the 12
 * pSEO TARGET markets (US/UK/DE/FR/AU/SG/CA/HK/NL/AE/TW/KR), but payment
 * routing must accept ANY country a customer can ship to (notably JP, which
 * is Sericia's home market and therefore not in the pSEO target list).
 *
 * Plain string keying lets us add countries by editing the matrix below
 * without touching type definitions.
 */
type Iso2 = string;

/**
 * Hyperswitch payment_method_type strings per their API spec.
 * These map 1:1 to what the Hyperswitch dashboard exposes per connector
 * (Stripe / PayPal). Any value here that the connected PSP doesn't
 * support is silently filtered by Hyperswitch — no UI breakage.
 */
export type HyperswitchMethod =
  | "card"
  | "apple_pay"
  | "google_pay"
  | "paypal"
  | "klarna"
  | "afterpay_clearpay"
  | "ideal"
  | "sepa_debit"
  | "alipay"
  | "we_chat_pay"
  | "konbini";

/** Default fallback set — any country we haven't explicitly listed gets cards only. */
const DEFAULT_METHODS: readonly HyperswitchMethod[] = [
  "card",
  "apple_pay",
  "google_pay",
] as const;

/**
 * Country → enabled payment methods. The ORDER here is the customer-visible
 * order in the Hyperswitch payment element (first = topmost in the list).
 * Lead with the highest-converting method per market.
 */
const PAYMENT_MATRIX: Record<Iso2, readonly HyperswitchMethod[]> = {
  // North America
  us: ["card", "apple_pay", "google_pay", "paypal"],
  ca: ["card", "apple_pay", "google_pay", "paypal"],

  // United Kingdom
  uk: ["card", "apple_pay", "google_pay", "paypal"],

  // Continental Europe
  de: ["card", "apple_pay", "google_pay", "paypal"],
  fr: ["card", "apple_pay", "google_pay", "paypal"],
  nl: ["card", "apple_pay", "google_pay", "paypal"],

  // Pacific
  au: ["card", "apple_pay", "google_pay", "paypal"],

  // Asia-Pacific
  jp: ["card", "apple_pay", "google_pay", "paypal"],
  sg: ["card", "apple_pay", "google_pay", "paypal"],
  hk: ["card", "apple_pay", "google_pay"], // PayPal weak in HK
  tw: ["card", "apple_pay", "google_pay"], // PayPal weak in TW
  kr: ["card", "apple_pay", "google_pay"], // KakaoPay/NaverPay dominant; PayPal weak

  // Middle East
  ae: ["card", "apple_pay", "google_pay"], // PayPal exited UAE retail
};

/**
 * Resolve the enabled payment methods for a given country.
 * Falls back to DEFAULT_METHODS for unknown / missing country codes.
 *
 * Accepts mixed-case input (e.g. "US", "Uk") and normalises to lowercase.
 */
export function getEnabledMethods(country: string | null | undefined): readonly HyperswitchMethod[] {
  if (!country) return DEFAULT_METHODS;
  const key = country.toLowerCase();
  return PAYMENT_MATRIX[key] ?? DEFAULT_METHODS;
}

/** All countries in the matrix (useful for ops dashboards / debug). */
export function listSupportedCountries(): string[] {
  return Object.keys(PAYMENT_MATRIX);
}
