import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// Keep the retired URL explicit so old integrations cannot create orders.
export async function POST(_req: MedusaRequest, res: MedusaResponse) {
  return res.status(410).json({ error: "payment_provider_retired" });
}
