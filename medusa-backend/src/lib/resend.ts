import { Resend } from "resend";

const key = process.env.RESEND_API_KEY;
if (!key) console.warn("[resend] RESEND_API_KEY not set — order emails unavailable");

export const resend = key ? new Resend(key) : null;

export const FROM = "Sericia <contact@sericia.com>";

export async function sendEmail(opts: { to: string; subject: string; html: string; idempotencyKey: string }) {
  if (!resend) {
    console.error("[resend] RESEND_API_KEY is required for order emails");
    throw new Error("Order email delivery is not configured");
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }, { idempotencyKey: opts.idempotencyKey });
    if (error) {
      console.error("[resend] send failed", { name: error.name });
      throw new Error("Order email provider rejected delivery");
    }
    return { id: data?.id };
  } catch (e) {
    console.error("[resend] delivery failed");
    throw e;
  }
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);

export function formatOrderTotal(amount: number, currency: string) {
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Invalid order total");
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(amount);
}

export const templates = {
  orderConfirmation: (opts: { name: string; orderId: string; title: string; amount: string }) => ({
    subject: `Order confirmed — #${opts.orderId}`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2a2a2a">
      <h1 style="font-size:24px">Thank you, ${escapeHtml(opts.name)}.</h1>
      <p>Your order for <strong>${escapeHtml(opts.title)}</strong> (${escapeHtml(opts.amount)}) is confirmed.</p>
      <p>We will send your tracking details after your order has shipped.</p>
      <p style="color:#888;font-size:13px;margin-top:32px">
        Questions? Just reply — <a href="mailto:contact@sericia.com">contact@sericia.com</a>
      </p>
    </div>`,
  }),
  shipping: (opts: { name: string; orderId: string; tracking: string }) => ({
    subject: `Shipped — order #${opts.orderId}`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2a2a2a">
      <h1>On its way.</h1>
      <p>Hi ${escapeHtml(opts.name)}, your drop left Japan. Track it here:</p>
      <p><a href="https://trackings.post.japanpost.jp/services/srv/search/?locale=en&reqCodeNo1=${escapeHtml(opts.tracking)}" style="color:#b8860b">${escapeHtml(opts.tracking)}</a></p>
    </div>`,
  }),
  refund: (opts: { name: string; orderId: string; amount: string }) => ({
    subject: `Refund issued — #${opts.orderId}`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2a2a2a">
      <h1>Refund processed.</h1>
      <p>Hi ${escapeHtml(opts.name)}, we've refunded ${escapeHtml(opts.amount)} for order #${opts.orderId}.</p>
      <p>It should appear on your statement within 5–10 business days.</p>
    </div>`,
  }),
  contactAutoReply: (opts: { name: string }) => ({
    subject: `We got your message — Sericia`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2a2a2a">
      <p>Hi ${escapeHtml(opts.name)},</p>
      <p>Thanks for reaching out. A human reads every message — expect a reply within 24h (JST business hours).</p>
      <p>— Sericia</p>
    </div>`,
  }),
};
