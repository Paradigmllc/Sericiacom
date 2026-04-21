import { Resend } from "resend";

const key = process.env.RESEND_API_KEY;
if (!key) console.warn("[resend] RESEND_API_KEY not set — emails will no-op");

export const resend = key ? new Resend(key) : null;

export const FROM = "Sericia <contact@sericia.com>";

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.error("[resend] skipped (no key):", opts.subject, "→", opts.to);
    return { skipped: true };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      console.error("[resend] send failed", error);
      return { error };
    }
    return { id: data?.id };
  } catch (e) {
    console.error("[resend] exception", e);
    return { error: e };
  }
}

export const templates = {
  orderConfirmation: (opts: { name: string; orderId: string; title: string; amount: string }) => ({
    subject: `Your Sericia drop is on its way — #${opts.orderId}`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2a2a2a">
      <h1 style="font-size:24px">Thank you, ${opts.name}.</h1>
      <p>Your order for <strong>${opts.title}</strong> (${opts.amount}) is confirmed.</p>
      <p>We ship from Japan within 48 hours via EMS. You'll get a tracking number shortly.</p>
      <p style="color:#888;font-size:13px;margin-top:32px">
        Questions? Just reply — <a href="mailto:contact@sericia.com">contact@sericia.com</a>
      </p>
    </div>`,
  }),
  shipping: (opts: { name: string; orderId: string; tracking: string }) => ({
    subject: `Shipped — order #${opts.orderId}`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2a2a2a">
      <h1>On its way.</h1>
      <p>Hi ${opts.name}, your drop left Japan. Track it here:</p>
      <p><a href="https://trackings.post.japanpost.jp/services/srv/search/?locale=en&reqCodeNo1=${opts.tracking}" style="color:#b8860b">${opts.tracking}</a></p>
    </div>`,
  }),
  refund: (opts: { name: string; orderId: string; amount: string }) => ({
    subject: `Refund issued — #${opts.orderId}`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2a2a2a">
      <h1>Refund processed.</h1>
      <p>Hi ${opts.name}, we've refunded ${opts.amount} for order #${opts.orderId}.</p>
      <p>It should appear on your statement within 5–10 business days.</p>
    </div>`,
  }),
  contactAutoReply: (opts: { name: string }) => ({
    subject: `We got your message — Sericia`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2a2a2a">
      <p>Hi ${opts.name},</p>
      <p>Thanks for reaching out. A human reads every message — expect a reply within 24h (JST business hours).</p>
      <p>— Sericia</p>
    </div>`,
  }),
};
