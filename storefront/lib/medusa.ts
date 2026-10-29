/**
 * Medusa v2 Store API client (singleton).
 *
 * Consumed by:
 *  - lib/products-medusa.ts  (product catalog fetchers)
 *  - lib/cart-medusa.ts      (cart + checkout ops — added in M4a phase 2)
 *
 * Env vars (set in Coolify Storefront):
 *  - NEXT_PUBLIC_MEDUSA_BACKEND_URL   → https://api.sericia.com
 *  - NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY → pk_...
 *  - NEXT_PUBLIC_DEFAULT_REGION       → jp (ISO region code, not region_id)
 *
 * NOTE on publishable key: unlike the admin JWT, the publishable key is safe
 * to expose client-side. It scopes all reads to the sales channel the key is
 * bound to. Missing key = empty product lists — we emit a loud error rather
 * than silently returning [] (rule V: no silent env fallbacks).
 */

import Medusa from "@medusajs/js-sdk";

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://127.0.0.1:9000";

const PUBLISHABLE_KEY = process.env.MEDUSA_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  // Don't throw at import time (Next build would fail on any route touching it).
  // Instead log loudly so misconfiguration surfaces in Coolify deploy logs.
  console.error(
    "[medusa] NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set. " +
      "Catalog requests will fail until configured. Set it in Coolify → Storefront env vars.",
  );
}

export const medusa = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  ...(PUBLISHABLE_KEY ? { publishableKey: PUBLISHABLE_KEY } : {}),
  debug: process.env.NODE_ENV !== "production",
});

/**
 * Default region code (ISO-ish — "jp" | "us" | "eu" | "gb" | "ca" | "au" | "sg" | "hk" | "me").
 * Medusa stores regions with a `name`/`currency_code` pair; we key by a stable
 * slug that the seed script writes into region.metadata.slug.
 */
export const DEFAULT_REGION_SLUG =
  process.env.MEDUSA_REGION ?? process.env.NEXT_PUBLIC_DEFAULT_REGION ?? "jp";

// Resolve the currency together with its region; never guess it from a country.
export async function getRegion(slug: string) {
  if (!PUBLISHABLE_KEY) throw new Error("Medusa publishable key is missing");
  const { regions } = await medusa.store.region.list({
    fields: "id,name,currency_code,metadata,countries.iso_2", limit: 100,
  });
  const region = regions.find((r: { id: string; name: string; currency_code: string; metadata?: Record<string, unknown> | null; countries?: { iso_2: string }[] }) => [r.name, r.metadata?.slug,
    ...(r.countries ?? []).map(c => c.iso_2),
  ].some(key => typeof key === "string" && key.toLowerCase() === slug.toLowerCase()));
  if (!region) throw new Error("The configured Medusa region is unavailable");
  return { regionId: region.id, currency: region.currency_code };
}
