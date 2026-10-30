import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkoutInput, sameOrigin } from "@/lib/checkout-contract";
import { CheckoutError, checkoutCountries, checkoutQuote, prepareCheckout } from "@/lib/checkout-medusa";

export const dynamic = "force-dynamic";
const cookieName = "sericia_medusa_checkout";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
function failure(error: unknown) {
  const status = error instanceof CheckoutError ? error.status : error instanceof Error && "status" in error && typeof error.status === "number" ? error.status : 503;
  // SDK errors can contain customer addresses and upstream URLs. Log only classification.
  console.error("[checkout] Request failed", { status, type: error instanceof Error ? error.name : "unknown" });
  return json({ error: error instanceof CheckoutError ? error.message : status === 400 || status === 409
    ? "An item or delivery method is unavailable. Review your cart and try again."
    : "Checkout is temporarily unavailable. Please try again." }, status >= 500 ? 503 : status);
}
export async function GET() {
  try { return json({ countries: (await checkoutCountries()).countries }); }
  catch (error) { return failure(error); }
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request.headers.get("origin"), request.headers.get("host"))) return json({ error: "Invalid request origin" }, 403);
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 20_000) return json({ error: "Request too large" }, 413);
    body = JSON.parse(raw);
  } catch (error) {
    console.warn("[checkout] Invalid JSON", { type: error instanceof Error ? error.name : "unknown" });
    return json({ error: "Invalid checkout details" }, 400);
  }
  const parsed = checkoutInput.safeParse(body);
  if (!parsed.success) return json({ error: "Please check your address, options and quantities." }, 400);
  try {
    const jar = await cookies();
    const cart = await prepareCheckout(parsed.data, jar.get(cookieName)?.value);
    jar.set(cookieName, cart.id, { httpOnly: true, sameSite: "lax", secure: new URL(request.headers.get("origin")!).protocol === "https:", path: "/", maxAge: 60 * 60 * 24 * 7 });
    const quote = await checkoutQuote(cart);
    if (parsed.data.action === "prepare") quote.shippingSelected = false;
    return json({ quote });
  } catch (error) { return failure(error); }
}
