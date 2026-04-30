import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { decrementVariantInventory } from "@/lib/medusa-admin";
import { notifySlackOrderPaid } from "@/lib/slack";
import { verifyWebhookSignature, type HyperswitchWebhookPayload } from "@/lib/hyperswitch";

/**
 * F54 — Hyperswitch webhook receiver.
 *
 * Mirrors /api/crossmint-webhook semantics for the Stripe/PayPal rail.
 * Identical post-paid side-effects: Supabase ledger flip → Medusa stock
 * decrement → events row → Slack bell → Resend email → n8n escalation.
 * The ONLY differences from the Crossmint webhook:
 *   - HMAC SHA-512 (not SHA-256)
 *   - Header `x-webhook-signature-512` (not svix-style)
 *   - Event type strings: "payment_succeeded" / "payment_failed"
 *   - We don't have a tx_hash (cards don't have one) — column stays null
 *
 * Same fail-close stance for production: without HYPERSWITCH_WEBHOOK_SECRET
 * we 503 every webhook. Hyperswitch retries 5xx with backoff, so legit
 * events survive an operator config gap.
 *
 * Docs: https://docs.hyperswitch.io/hyperswitch-cloud/webhooks
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature =
    req.headers.get("x-webhook-signature-512") ??
    req.headers.get("x-webhook-signature") ??
    null;
  const secret = process.env.HYPERSWITCH_WEBHOOK_SECRET;

  // ── Fail-close: production rejects unsigned/unconfigured webhooks ──
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[hyperswitch-webhook] CRITICAL: HYPERSWITCH_WEBHOOK_SECRET not set — " +
          "rejecting all webhooks. Set it in Coolify env + Hyperswitch dashboard, then redeploy.",
      );
      return NextResponse.json(
        { error: "webhook_misconfigured", hint: "HYPERSWITCH_WEBHOOK_SECRET not set" },
        { status: 503 },
      );
    }
    console.warn("[hyperswitch-webhook] HYPERSWITCH_WEBHOOK_SECRET not set (dev) — passing through");
  } else {
    if (!verifyWebhookSignature(raw, signature, secret)) {
      console.warn("[hyperswitch-webhook] signature mismatch / missing");
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  }

  // ── Parse payload ───────────────────────────────────────────────────
  let body: HyperswitchWebhookPayload;
  try {
    body = JSON.parse(raw) as HyperswitchWebhookPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const eventType = body?.event_type ?? "";
  const obj = body?.content?.object;
  if (!obj) {
    return NextResponse.json({ error: "malformed_payload" }, { status: 400 });
  }

  const sericiaOrderId =
    (obj.metadata?.sericia_order_id as string | undefined) ?? null;
  const hyperswitchPaymentId = obj.payment_id;

  if (!sericiaOrderId) {
    console.warn("[hyperswitch-webhook] no sericia_order_id in metadata", { eventType });
    return NextResponse.json({ ok: true, skipped: "no_order_id" });
  }

  const isSuccess = eventType === "payment_succeeded" || /succeeded|paid/i.test(eventType);
  const isFailed = eventType === "payment_failed" || /failed|cancelled/i.test(eventType);

  // ── Success path ────────────────────────────────────────────────────
  if (isSuccess) {
    const { data: order } = await supabaseAdmin
      .from("sericia_orders")
      .select("id, drop_id, order_type, status, email, full_name, amount_usd, quantity")
      .eq("id", sericiaOrderId)
      .maybeSingle();
    if (!order) return NextResponse.json({ error: "order_not_found" }, { status: 404 });
    if (order.status === "paid" || order.status === "shipped") {
      return NextResponse.json({ ok: true, already_processed: true });
    }

    const now = new Date().toISOString();
    // We reuse the `crossmint_order_id` column to store the Hyperswitch
    // payment_id so the existing admin views, exports, and Slack message
    // template continue to work without a schema migration. Operationally
    // unambiguous because Crossmint ids start with `cm_` and Hyperswitch
    // ids start with `pay_`.
    await supabaseAdmin
      .from("sericia_orders")
      .update({
        status: "paid",
        crossmint_order_id: hyperswitchPaymentId,
        paid_at: now,
        updated_at: now,
      })
      .eq("id", order.id);

    // Drop sold_units bookkeeping (drop orders only).
    let drop: { sold_units: number; total_units: number; title: string } | null = null;
    if (order.drop_id) {
      const { data: d } = await supabaseAdmin
        .from("sericia_drops")
        .select("sold_units, total_units, title")
        .eq("id", order.drop_id)
        .maybeSingle();
      drop = d;
      if (drop) {
        const newSold = Math.min(drop.sold_units + order.quantity, drop.total_units);
        await supabaseAdmin
          .from("sericia_drops")
          .update({ sold_units: newSold, status: newSold >= drop.total_units ? "sold_out" : "active" })
          .eq("id", order.drop_id);
      }
    }

    // Rule N half #1: DB bell
    await supabaseAdmin.from("sericia_events").insert({
      event_name: "order_paid",
      distinct_id: order.email,
      drop_id: order.drop_id,
      order_id: order.id,
      properties: { amount_usd: order.amount_usd, provider: "hyperswitch" },
    });

    // Medusa stock decrement (cart orders only — drop orders are tracked
    // via sericia_drops.sold_units above).
    let inventoryDecremented = 0;
    let inventoryTotal = 0;
    if (order.order_type === "cart") {
      const { data: orderItems } = await supabaseAdmin
        .from("sericia_order_items")
        .select("product_id, quantity")
        .eq("order_id", order.id);
      if (orderItems?.length) {
        inventoryTotal = orderItems.length;
        const results = await Promise.allSettled(
          orderItems.map((it) => decrementVariantInventory(it.product_id, it.quantity)),
        );
        inventoryDecremented = results.filter(
          (r) => r.status === "fulfilled" && r.value.ok && r.value.decremented > 0,
        ).length;
      }
    }

    // Rule N half #2: Slack bell (fire-and-forget)
    notifySlackOrderPaid({
      order_id: order.id,
      email: order.email,
      full_name: order.full_name,
      amount_usd: order.amount_usd,
      tx_hash: null,
      crossmint_order_id: hyperswitchPaymentId,
      inventory_decremented: inventoryDecremented,
      inventory_total: inventoryTotal,
    }).catch((e) => console.error("[hyperswitch-webhook] slack notify exception", e));

    // Resend email (fire-and-forget)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Sericia <contact@sericia.com>",
          to: order.email,
          subject: `Your Sericia order is confirmed — ${drop?.title ?? "Sericia"}`,
          html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2b221c">
            <h1 style="font-weight:normal">Thank you, ${order.full_name.split(" ")[0]}.</h1>
            <p>We've received your payment for <strong>${drop?.title ?? "your Sericia order"}</strong>.</p>
            <p>Your package ships from Japan within 48 hours via EMS. Tracking arrives by email once scanned.</p>
            <hr style="border:none;border-top:1px solid #e8e0d3;margin:24px 0" />
            <p style="font-size:13px;color:#6b5e4f">Order ID: ${order.id}<br/>Amount: $${order.amount_usd} USD</p>
            <p style="font-size:13px;color:#6b5e4f">Questions? Reply or write <a href="mailto:contact@sericia.com">contact@sericia.com</a>.</p>
          </div>`,
        }),
        signal: AbortSignal.timeout(10_000),
      }).catch((e) => console.error("[hyperswitch-webhook] resend failed", e));
    }

    // n8n escalation router (fire-and-forget)
    const n8n = process.env.N8N_ESCALATION_WEBHOOK;
    if (n8n) {
      fetch(n8n, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order_paid",
          order_id: order.id,
          drop_id: order.drop_id,
          amount_usd: order.amount_usd,
          email: order.email,
          provider: "hyperswitch",
        }),
        signal: AbortSignal.timeout(5_000),
      }).catch((e) => console.error("[hyperswitch-webhook] n8n failed", e));
    }
    return NextResponse.json({ ok: true, order_id: order.id, status: "paid" });
  }

  // ── Failure path ────────────────────────────────────────────────────
  if (isFailed) {
    await supabaseAdmin
      .from("sericia_orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", sericiaOrderId);
    return NextResponse.json({ ok: true, order_id: sericiaOrderId, status: "cancelled" });
  }

  return NextResponse.json({ ok: true, event: eventType, ignored: true });
}
