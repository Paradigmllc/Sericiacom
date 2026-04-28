import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/pay/create — initialise a Crossmint Headless Checkout order.
 *
 * Architecture (post-F28 — token-locator pattern):
 *   Customer pays USD on their card on Crossmint's hosted checkout page.
 *   Crossmint converts USD → USDC under the hood and settles the USDC to
 *   Sericia's external treasury wallet (Tria / RedotPay / similar).
 *   Sericia then off-ramps to fiat via Visa-debit issued against the wallet.
 *
 *   Why we use `tokenLocator: "<chain>:<USDC_contract>"` instead of
 *   `productLocator: "url:..." | "amazon:..."`:
 *     - Crossmint's `productLocator` flow is for buying goods FROM a
 *       marketplace (Amazon ASIN, Shopify variant, URL scrape) — Crossmint
 *       acts as the merchant of record and ships the goods.
 *     - Sericia is its own merchant of record; we own the catalog (Medusa)
 *       and ship from Kyoto. We just need Crossmint to process the card and
 *       deliver USDC.
 *     - The `tokenLocator` flow used by memecoin checkouts is exactly this:
 *       customer pays card → Crossmint delivers tokens to a wallet. We
 *       point that wallet at Sericia treasury and pick USDC as the "token".
 *     - Customer-facing wording is configured via Crossmint Console
 *       appearance settings (logo, brand colour, "Pay $X for Sericia
 *       order #ABCD" copy). They never see "buying USDC" — just card form.
 *
 * Env requirements:
 *   - CROSSMINT_SERVER_SK            — production server SK (already set)
 *   - SERICIA_TREASURY_WALLET_ADDRESS — Tria/RedotPay USDC receiving address
 *   - SERICIA_TREASURY_CHAIN          — "base" (default) | "solana"
 *   - CROSSMINT_ENV                   — "production" (default) | "staging"
 *
 * Crossmint Console gates (operator must enable, F28 still under gate):
 *   - "Onramp" production access  → otherwise:
 *       400 "Onramp is not yet enabled for production use"
 *   - Card payments capability    → required for payment.method: "card"
 *   - Apple Pay domain verification (already done — `verified` ✅)
 *   - Redirect Domains whitelist (already done ✅)
 */

// USDC contract addresses, indexed by Crossmint chain identifier.
// Verified working (schema-accepted) by F28 probe; production gating only.
const USDC_TOKEN_LOCATORS: Record<string, string> = {
  base: "base:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  solana: "solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  // ethereum / arbitrum / optimism intentionally omitted — Sericia treasury
  // settles on Base (Coinbase ecosystem, lowest gas, easiest off-ramp).
};

export async function POST(req: NextRequest) {
  const { order_id } = (await req.json().catch(() => ({}))) as {
    order_id?: unknown;
  };
  if (typeof order_id !== "string" || order_id.length === 0) {
    return NextResponse.json({ error: "order_id_required" }, { status: 400 });
  }

  const { data: order, error: orderErr } = await supabaseAdmin
    .from("sericia_orders")
    .select("*")
    .eq("id", order_id)
    .maybeSingle();
  if (orderErr || !order) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }
  if (order.status !== "pending") {
    return NextResponse.json(
      { error: "order_not_pending", status: order.status },
      { status: 409 },
    );
  }

  const { data: items, error: itemsErr } = await supabaseAdmin
    .from("sericia_order_items")
    .select("product_id, name, quantity, unit_price_usd")
    .eq("order_id", order_id);
  if (itemsErr) {
    console.error("[pay/create] items query failed", itemsErr);
    return NextResponse.json({ error: "items_unavailable" }, { status: 500 });
  }

  // ── Env-driven config ─────────────────────────────────────────────────
  const apiKey = process.env.CROSSMINT_SERVER_SK?.trim();
  const env = (process.env.CROSSMINT_ENV ?? "production").toLowerCase();
  const treasuryAddress = process.env.SERICIA_TREASURY_WALLET_ADDRESS?.trim();
  const treasuryChain = (process.env.SERICIA_TREASURY_CHAIN ?? "base").toLowerCase();

  const apiBase =
    env === "staging"
      ? "https://staging.crossmint.com/api/2022-06-09"
      : "https://www.crossmint.com/api/2022-06-09";

  // Pre-flight env checks — surface precise errors so the UI shows the
  // correct operator-actionable CTA, not a vague "Try again later".
  if (!apiKey) {
    console.error("[pay/create] CROSSMINT_SERVER_SK not set");
    return NextResponse.json(
      { error: "payment_provider_unconfigured", hint: "CROSSMINT_SERVER_SK missing" },
      { status: 503 },
    );
  }
  if (!treasuryAddress) {
    console.error("[pay/create] SERICIA_TREASURY_WALLET_ADDRESS not set");
    return NextResponse.json(
      {
        error: "treasury_wallet_unconfigured",
        hint: "SERICIA_TREASURY_WALLET_ADDRESS env required (Tria/RedotPay USDC address)",
      },
      { status: 503 },
    );
  }
  const tokenLocator = USDC_TOKEN_LOCATORS[treasuryChain];
  if (!tokenLocator) {
    console.error("[pay/create] unknown SERICIA_TREASURY_CHAIN:", treasuryChain);
    return NextResponse.json(
      {
        error: "treasury_chain_unsupported",
        hint: `SERICIA_TREASURY_CHAIN must be one of: ${Object.keys(USDC_TOKEN_LOCATORS).join(", ")}`,
      },
      { status: 503 },
    );
  }

  const totalUsd = Number(order.amount_usd ?? 0);
  if (!Number.isFinite(totalUsd) || totalUsd <= 0) {
    return NextResponse.json({ error: "invalid_order_amount" }, { status: 422 });
  }

  // ── Crossmint Headless Checkout — tokenLocator flow ───────────────────
  // Sends customer USD → USDC on `treasuryChain` → `treasuryAddress`.
  // Customer sees Crossmint's hosted card form with order metadata; never
  // sees "USDC" or "memecoin" terminology (Crossmint Console controls that
  // surface via appearance + receipt customisation).
  //
  // The `metadata.sericia_*` fields are echoed back to our webhook
  // (/api/crossmint-webhook) when payment succeeds, letting us reconcile
  // the Crossmint order to the sericia_orders row + decrement Medusa stock
  // + send the order-confirmation email.
  const payload = {
    lineItems: [
      {
        tokenLocator,
        executionParameters: {
          mode: "exact-in",
          amount: totalUsd.toFixed(2),
        },
      },
    ],
    payment: {
      method: "card",
      receiptEmail: order.email,
    },
    recipient: {
      walletAddress: treasuryAddress,
    },
    metadata: {
      sericia_order_id: order.id,
      sericia_email: order.email,
      sericia_item_count: (items ?? []).length,
      sericia_locale: order.locale ?? "en",
    },
  };

  try {
    const res = await fetch(`${apiBase}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      // Map Crossmint errors to UI-actionable codes.
      const apiMsg = (data as { message?: string })?.message ?? "";
      let errKey: string;
      if (res.status === 401) {
        errKey = "provider_auth_invalid";
      } else if (res.status === 403) {
        errKey = "provider_scope_missing";
      } else if (apiMsg.includes("Onramp is not yet enabled")) {
        // Project-level Onramp gate — operator must enable in Crossmint Console.
        errKey = "provider_onramp_disabled";
      } else if (apiMsg.includes("Unsupported token")) {
        errKey = "provider_token_unsupported";
      } else {
        errKey = "provider_error";
      }
      console.error("[pay/create] crossmint", res.status, JSON.stringify(data));
      return NextResponse.json(
        { error: errKey, status: res.status, details: data },
        { status: 502 },
      );
    }

    // Crossmint may return both top-level and nested clientSecret depending
    // on the order phase. Normalise to a single field for the client.
    const orderObj = (data as { order?: { orderId?: string } })?.order;
    const crossmintOrderId = orderObj?.orderId ?? null;
    const clientSecret =
      (data as { clientSecret?: string })?.clientSecret ??
      (data as {
        order?: { payment?: { preparation?: { stripeClientSecret?: string } } };
      })?.order?.payment?.preparation?.stripeClientSecret ??
      null;

    if (crossmintOrderId) {
      await supabaseAdmin
        .from("sericia_orders")
        .update({
          crossmint_order_id: crossmintOrderId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order_id);
    }

    return NextResponse.json({
      clientSecret,
      crossmintOrderId,
      // Surface chain + locator for client-side debugging / observability.
      treasuryChain,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[pay/create] network error", msg, e);
    return NextResponse.json({ error: "network_error", details: msg }, { status: 502 });
  }
}
