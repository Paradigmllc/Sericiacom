import { z } from "zod";
const text = z.string().trim().min(1).max(200);
export const checkoutItems = z.array(z.object({
  variant_id: z.string().regex(/^variant_[a-zA-Z0-9_-]+$/).max(100),
  quantity: z.number().int().min(1).max(99),
}).strict()).min(1).max(50).refine(items => new Set(items.map(i => i.variant_id)).size === items.length, "Duplicate options");
export const checkoutInput = z.discriminatedUnion("action", [
  z.object({ action: z.literal("prepare"), items: checkoutItems, email: z.email().max(254),
    address: z.object({ first_name: text, last_name: text, address_1: text,
      address_2: z.string().trim().max(200), city: text, province: z.string().trim().max(100),
      postal_code: text, country_code: z.string().regex(/^[a-z]{2}$/), phone: z.string().trim().max(40),
    }).strict(),
  }).strict(),
  z.object({ action: z.literal("shipping"), option_id: z.string().regex(/^so_[a-zA-Z0-9_-]+$/).max(100), items: checkoutItems }).strict(),
]);
export function sameCartItems(actual: { variant_id?: string | null; quantity: number }[], expected: { variant_id: string; quantity: number }[]) {
  return actual.length === expected.length && actual.every(a => expected.some(e => e.variant_id === a.variant_id && e.quantity === a.quantity));
}
export function sameOrigin(origin: string | null, host: string | null) {
  if (!origin || !host) return false;
  try { const url = new URL(origin); return ["http:", "https:"].includes(url.protocol) && url.host === host; }
  catch (error) { console.warn("[checkout] Invalid origin", error instanceof Error ? error.name : "invalid"); return false; }
}
export type CheckoutQuote = {
  currency: string; subtotal: number; shipping: number; tax: number; discount: number; credit: number; total: number;
  items: { id: string; name: string; quantity: number; total: number }[];
  options: { id: string; name: string; amount: number }[];
  shippingSelected: boolean;
};
