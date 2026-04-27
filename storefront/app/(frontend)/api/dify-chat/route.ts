import { NextRequest, NextResponse } from "next/server";

/**
 * Dify Service API proxy.
 *
 * Why server-side instead of the `udify.app` embed widget:
 * 1. The `app-*` Service API key is a SECRET — cannot live in NEXT_PUBLIC_*
 *    (which is baked into client JS and publicly visible).
 * 2. `udify.app/chatbot/{token}` was returning 404 on this project (pattern
 *    changed / public sharing toggle issue), making the embed fallback
 *    unreliable. The API at `api.dify.ai/v1/chat-messages` is fully live.
 * 3. This proxy lets us theme the chat UI in Sericia colors + add our own
 *    abuse guards (length cap, rate limit future-hook) without trusting a
 *    third-party CDN.
 *
 * Env:
 *   DIFY_SERVICE_API_KEY  → `app-xxxxxx...` secret from Dify dashboard
 *   DIFY_API_URL          → defaults to `https://api.dify.ai/v1`
 *
 * Rule V: if the secret is unset we fail-close with 503 and a clear error
 * code so the client can render an "offline" state instead of a mysterious
 * silent failure.
 */

const DIFY_API_URL = process.env.DIFY_API_URL ?? "https://api.dify.ai/v1";
const DIFY_SERVICE_API_KEY = process.env.DIFY_SERVICE_API_KEY;
const MAX_QUERY_LENGTH = 2000;

export const runtime = "nodejs";

type ChatRequestBody = {
  query?: unknown;
  conversation_id?: unknown;
  user?: unknown;
};

export async function POST(req: NextRequest) {
  if (!DIFY_SERVICE_API_KEY) {
    console.error("[dify-chat] DIFY_SERVICE_API_KEY is not set — cannot proxy to Dify");
    return NextResponse.json(
      { error: "dify_not_configured", hint: "DIFY_SERVICE_API_KEY must be set in Coolify env" },
      { status: 503 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  const conversationId = typeof body.conversation_id === "string" && body.conversation_id.length > 0
    ? body.conversation_id
    : undefined;
  const user = typeof body.user === "string" && body.user.length > 0 ? body.user : null;

  if (!query) {
    return NextResponse.json({ error: "query_required" }, { status: 400 });
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: "query_too_long", max: MAX_QUERY_LENGTH },
      { status: 400 },
    );
  }
  if (!user) {
    return NextResponse.json({ error: "user_required" }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_SERVICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: "blocking",
        user,
        conversation_id: conversationId,
      }),
      // Dify LLM calls can legitimately run 20s+ for long answers.
      signal: AbortSignal.timeout(35_000),
    });

    if (!upstream.ok) {
      const raw = await upstream.text();
      console.error(
        `[dify-chat] upstream ${upstream.status}`,
        raw.slice(0, 300),
      );
      return NextResponse.json(
        { error: "dify_upstream_error", status: upstream.status },
        { status: 502 },
      );
    }

    const data = (await upstream.json()) as {
      answer?: string;
      conversation_id?: string;
      id?: string;
      metadata?: unknown;
    };

    return NextResponse.json({
      answer: data.answer ?? "",
      conversation_id: data.conversation_id ?? null,
      message_id: data.id ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[dify-chat] exception", msg);
    return NextResponse.json(
      { error: "internal_error", detail: msg },
      { status: 500 },
    );
  }
}
