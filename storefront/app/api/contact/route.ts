import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const N8N_ESCALATION_WEBHOOK = process.env.N8N_ESCALATION_WEBHOOK;

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    if (resend) {
      await resend.emails.send({
        from: "Sericia <contact@sericia.com>",
        to: email,
        subject: "We got your message — Sericia",
        html: `<p>Hi ${name},</p><p>Thanks for reaching out. A human reads every message — expect a reply within 24h (JST).</p><p>— Sericia</p>`,
      });
      await resend.emails.send({
        from: "Sericia Contact <contact@sericia.com>",
        to: "contact@sericia.com",
        subject: `[Contact] ${name} — ${email}`,
        html: `<p><b>From:</b> ${name} &lt;${email}&gt;</p><pre style="white-space:pre-wrap">${message}</pre>`,
      });
    }

    if (N8N_ESCALATION_WEBHOOK) {
      fetch(N8N_ESCALATION_WEBHOOK, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "contact", name, email, message, ts: Date.now() }),
        signal: AbortSignal.timeout(5000),
      }).catch((e) => console.error("[contact] n8n webhook failed", e));
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[contact] error", e);
    return NextResponse.json({ error: e.message ?? "internal" }, { status: 500 });
  }
}
