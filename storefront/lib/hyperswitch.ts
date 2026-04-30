/**
 * F54 — Hyperswitch server-side client.
 *
 * Hyperswitch is the OSS payment orchestrator (Apache-2.0) sitting in front
 * of Stripe + PayPal + others. From Sericia's storefront perspective it's a
 * single API that:
 *   - Creates a payment intent for an order
 *   - Returns a `client_secret` the browser uses to mount an embedded
 *     payment element (HyperLoader.js)
 *   - Webhooks us when the payment lands (or fails)
 *
 * We use Hyperswitch Cloud (https://hyperswitch.io) for launch. The free
 * tier covers 100K txns/month — Sericia's Phase 1 (20/mo) and Phase 2
 * (100/mo) targets fit with three orders of magnitude headroom.
 *
 * No npm SDK is used; bare `fetch` against the documented v1 endpoints.
 * Reasons:
 *   - Build-size discipline (storefront deploys on a 4GB Hetzner box —
 *     every avoidable dep is OOM risk during webpack pass).
 *   - Hyperswitch's TypeScript SDK is still beta. The fetch shape is
 *     stable per their OpenAPI spec.
 *   - Easier to mock in tests / scripts.
 *
 * Required env (set in Coolify):
 *   HYPERSWITCH_API_URL         — defaults to Hyperswitch Cloud prod.
 *                                 Override only when self-hosting or
 *                                 sandbox testing.
 *   HYPERSWITCH_API_KEY         — secret API key (`snd_...` sandbox /
 *                                 `pk_snd_...` server / `pk_prd_...`
 *                                 production). Server-only — NEVER
 *                                 expose with NEXT_PUBLIC_ prefix.
 *   HYPERSWITCH_PROFILE_ID      — connector profile id (operator gets
 *                                 from Hyperswitch dashboard after
 *                                 connecting Stripe + PayPal).
 *
 * Public env (browser-readable, set with NEXT_PUBLIC_ prefix):
 *   NEXT_PUBLIC_HYPERSWITCH_PUBLISHABLE_KEY  — `pk_snd_*` / `pk_prd_*`
 *                                              for HyperLoader.
 */

const HYPERSWITCH_API_URL_DEFAULT = "https://api.hyperswitch.io";

export interface HyperswitchPaymentIntent {
  payment_id: string;
  client_secret: string;
  status: "requires_payment_method" | "requires_confirmation" | "processing" | "succeeded" | "failed" | string;
  amount: number;
  currency: string;
  created: string;
}

export interface CreatePaymentIntentInput {
  /** Sericia order id — used as `metadata.sericia_order_id` for reconciliation. */
  sericiaOrderId: string;
  /** USD amount in dollars (integer or 2-decimal). Will be converted to cents. */
  amountUsd: number;
  /** Customer email — Hyperswitch uses for receipts + risk scoring. */
  email: string;
  /** ISO 3166-1 alpha-2 (lowercase) — billing/customer country. */
  country: string;
  /** Allowed payment methods for this country (per payment-routing.ts). */
  allowedPaymentMethods: readonly string[];
  /** URL Hyperswitch redirects the customer to after payment completes. */
  returnUrl: string;
}

/**
 * Create a Hyperswitch PaymentIntent. Returns the client_secret + payment_id
 * which the browser uses to mount the HyperLoader embedded element.
 *
 * Throws on auth / network / Hyperswitch errors — caller wraps in a
 * try/catch and maps to a user-facing error code.
 */
export async function createPaymentIntent(input: CreatePaymentIntentInput): Promise<HyperswitchPaymentIntent> {
  const apiKey = process.env.HYPERSWITCH_API_KEY?.trim();
  const profileId = process.env.HYPERSWITCH_PROFILE_ID?.trim();
  const apiUrl = (process.env.HYPERSWITCH_API_URL ?? HYPERSWITCH_API_URL_DEFAULT).replace(/\/+$/, "");

  if (!apiKey) {
    const err = new Error("HYPERSWITCH_API_KEY env required") as Error & { code?: string };
    err.code = "hyperswitch_api_key_missing";
    throw err;
  }
  if (!profileId) {
    const err = new Error("HYPERSWITCH_PROFILE_ID env required") as Error & { code?: string };
    err.code = "hyperswitch_profile_missing";
    throw err;
  }

  // Hyperswitch amounts are in the smallest unit (cents for USD).
  const amountCents = Math.round(input.amountUsd * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    const err = new Error(`invalid amount: ${input.amountUsd}`) as Error & { code?: string };
    err.code = "hyperswitch_invalid_amount";
    throw err;
  }

  const payload = {
    amount: amountCents,
    currency: "USD",
    confirm: false,
    capture_method: "automatic",
    profile_id: profileId,
    customer_id: `sericia_${input.sericiaOrderId}`,
    email: input.email,
    description: `Sericia order ${input.sericiaOrderId}`,
    return_url: input.returnUrl,
    // Country-filtered methods. Hyperswitch will hide any not configured
    // on the connected PSP, so over-listing here is safe.
    payment_method_types: input.allowedPaymentMethods,
    billing: {
      address: {
        country: input.country.toUpperCase(),
      },
      email: input.email,
    },
    metadata: {
      sericia_order_id: input.sericiaOrderId,
      sericia_email: input.email,
    },
    // Order details surface in Hyperswitch dashboard for ops triage.
    order_details: [
      {
        product_name: `Sericia order ${input.sericiaOrderId}`,
        quantity: 1,
        amount: amountCents,
      },
    ],
  };

  const res = await fetch(`${apiUrl}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const apiMsg = (data as { error?: { message?: string }; message?: string }).error?.message
      ?? (data as { message?: string }).message
      ?? JSON.stringify(data).slice(0, 200);
    const err = new Error(`Hyperswitch ${res.status}: ${apiMsg}`) as Error & {
      code?: string;
      status?: number;
      details?: unknown;
    };
    err.code = res.status === 401 ? "hyperswitch_auth_invalid"
      : res.status === 403 ? "hyperswitch_scope_missing"
      : "hyperswitch_provider_error";
    err.status = res.status;
    err.details = data;
    throw err;
  }

  const paymentId = (data as { payment_id?: string }).payment_id;
  const clientSecret = (data as { client_secret?: string }).client_secret;
  if (!paymentId || !clientSecret) {
    const err = new Error("Hyperswitch response missing payment_id or client_secret") as Error & { code?: string };
    err.code = "hyperswitch_malformed_response";
    throw err;
  }

  return {
    payment_id: paymentId,
    client_secret: clientSecret,
    status: ((data as { status?: string }).status ?? "requires_payment_method"),
    amount: amountCents,
    currency: "USD",
    created: ((data as { created?: string }).created ?? new Date().toISOString()),
  };
}

/**
 * Verify a Hyperswitch webhook signature.
 *
 * Hyperswitch signs the raw request body with HMAC SHA-512 using the
 * webhook secret configured in their dashboard. The signature is sent
 * in the `x-webhook-signature-512` header (hex-encoded).
 *
 * Returns true on match, false otherwise. Caller should reject the
 * request (401) on false.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  // Avoid pulling node:crypto at module load — defer to call time.
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  // Constant-time compare — guard against timing attacks.
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    // Buffer length mismatch → not equal.
    return false;
  }
}

/**
 * Hyperswitch webhook payload shape — only the fields we use.
 * Full schema: https://docs.hyperswitch.io/hyperswitch-cloud/webhooks
 */
export interface HyperswitchWebhookPayload {
  event_type:
    | "payment_succeeded"
    | "payment_failed"
    | "payment_processing"
    | "refund_succeeded"
    | "refund_failed"
    | string;
  content: {
    object: {
      payment_id: string;
      status: string;
      amount: number;
      currency: string;
      metadata?: Record<string, string | number | boolean>;
      email?: string;
    };
  };
}
