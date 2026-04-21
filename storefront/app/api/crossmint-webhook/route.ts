import { NextRequest, NextResponse } from "next/server";

/**
 * Storefront-side Crossmint webhook passthrough.
 * Primary handler lives in Medusa (api.sericia.com/webhooks/crossmint).
 * This endpoint is a backup/debug log path if Medusa is unreachable.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;

  if (medusaUrl) {
    try {
      const forwarded = await fetch(`${medusaUrl}/webhooks/crossmint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-crossmint-signature": req.headers.get("x-crossmint-signature") ?? "",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });
      return NextResponse.json({ forwarded: true, status: forwarded.status });
    } catch (e) {
      console.error("crossmint forward failed", e);
    }
  }

  console.error("crossmint webhook received but not forwarded", body);
  return NextResponse.json({ ok: true, stored: false });
}
