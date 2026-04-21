import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import crypto from "crypto";

/**
 * Crossmint webhook bridge (Option B):
 * Crossmint Headless Checkout -> this endpoint -> Medusa order + inventory -1 + Resend email.
 *
 * Expected payload (order.succeeded):
 * {
 *   type: "order.succeeded",
 *   data: {
 *     orderId: "...",
 *     lineItems: [{ metadata: { variant_id, quantity, sku } }],
 *     recipient: { email, physicalAddress: { ... } },
 *     payment: { amount, currency, txHash }
 *   }
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  const secret = process.env.CROSSMINT_WEBHOOK_SECRET;
  if (!secret) {
    logger.error("CROSSMINT_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "webhook secret not configured" });
  }

  const signature = req.headers["x-crossmint-signature"] as string | undefined;
  const rawBody = JSON.stringify(req.body);
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (!signature || signature !== expected) {
    logger.warn(`Crossmint webhook signature mismatch`);
    return res.status(401).json({ error: "invalid signature" });
  }

  const body = req.body as any;
  if (body?.type !== "order.succeeded") {
    return res.status(200).json({ ok: true, ignored: body?.type });
  }

  try {
    const orderModule = req.scope.resolve(Modules.ORDER);
    const inventoryModule = req.scope.resolve(Modules.INVENTORY);

    const data = body.data;
    const items = (data.lineItems || []).map((li: any) => ({
      title: li.metadata?.sku || "Crossmint item",
      quantity: Number(li.metadata?.quantity || 1),
      unit_price: Math.round(Number(li.payment?.amount || 0) * 100),
      variant_id: li.metadata?.variant_id,
    }));

    const order = await (orderModule as any).createOrders({
      currency_code: (data.payment?.currency || "USD").toLowerCase(),
      email: data.recipient?.email,
      items,
      shipping_address: data.recipient?.physicalAddress,
      metadata: {
        crossmint_order_id: data.orderId,
        tx_hash: data.payment?.txHash,
      },
    });

    for (const li of data.lineItems || []) {
      const vId = li.metadata?.variant_id;
      const qty = Number(li.metadata?.quantity || 1);
      if (!vId) continue;
      try {
        await (inventoryModule as any).adjustInventory?.(vId, -qty);
      } catch (e) {
        logger.warn(`inventory adjust failed for ${vId}: ${(e as Error).message}`);
      }
    }

    if (process.env.RESEND_API_KEY && data.recipient?.email) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Sericia <orders@sericia.com>",
          to: data.recipient.email,
          subject: "ご注文ありがとうございます / Order confirmation",
          html: `<p>Order ID: ${data.orderId}</p><p>Tx: ${data.payment?.txHash}</p>`,
        }),
        signal: AbortSignal.timeout(10_000),
      }).catch((e) => logger.error(`resend failed: ${e.message}`));
    }

    return res.status(200).json({ ok: true, order_id: (order as any).id });
  } catch (e) {
    logger.error(`crossmint webhook error: ${(e as Error).message}`);
    return res.status(500).json({ error: (e as Error).message });
  }
}
