/**
 * /api/pseo/briefs
 *
 *   POST — enqueue a new pSEO brief. Admin-gated (x-admin-secret).
 *   GET  — list recent briefs, optionally filtered by status. Admin-gated.
 *
 * This is the control-plane counterpart to /api/pseo/generate:
 *   briefs (write) ─►  queue  ─►  generate (consume)  ─►  payload articles
 *
 * POST body:
 *   {
 *     topic: string,
 *     locale: "en" | "de" | "fr" | "es" | "ja" | "zh" | "ar" | "vi" | "th" | "id",
 *     keywords: string[],
 *     related_product_handle?: string | null,
 *     cluster?: string | null,
 *     grounding_facts?: string[]
 *   }
 *
 * Returns the inserted brief id, or 409 if a (lower(topic), locale) row
 * already exists in a non-terminal state (see partial unique index on
 * sericia_pseo_briefs).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

// MUST match Payload's localization.locales set in payload.config.ts AND the
// PseoLocale union in lib/pseo.ts AND the CHECK constraint on sericia_pseo_briefs.
const LOCALES = [
  "en", "ja", "de", "fr", "es", "it", "ko", "zh-TW", "ru", "ar",
] as const;

const BriefInput = z.object({
  topic: z.string().min(8).max(200),
  locale: z.enum(LOCALES),
  keywords: z.array(z.string().min(2).max(80)).min(1).max(12),
  related_product_handle: z.string().max(80).nullable().optional(),
  cluster: z.string().max(80).nullable().optional(),
  grounding_facts: z.array(z.string().min(4).max(400)).max(20).optional(),
});

function authorise(req: NextRequest): boolean {
  const secret = process.env.SERICIA_ADMIN_SECRET;
  if (!secret) {
    console.error("[pseo/briefs] SERICIA_ADMIN_SECRET not set");
    return false;
  }
  const provided = req.headers.get("x-admin-secret") ?? "";
  return provided.length > 0 && provided === secret;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    if (!authorise(req)) {
      return NextResponse.json({ error: "unauthorised" }, { status: 401 });
    }
    const parsed = BriefInput.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_input", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const b = parsed.data;

    const { data, error } = await supabaseAdmin
      .from("sericia_pseo_briefs")
      .insert({
        topic: b.topic,
        locale: b.locale,
        keywords: b.keywords,
        related_product_handle: b.related_product_handle ?? null,
        cluster: b.cluster ?? null,
        grounding_facts: b.grounding_facts ?? [],
        status: "pending",
      })
      .select("id, created_at")
      .single();

    if (error) {
      // 23505 = unique_violation (from the partial index on lower(topic),locale)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "duplicate_topic", detail: "A pending/processing/done brief for this topic+locale already exists." },
          { status: 409 },
        );
      }
      console.error("[pseo/briefs] insert failed", error);
      return NextResponse.json(
        { error: "insert_failed", detail: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, brief_id: data.id, created_at: data.created_at });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[pseo/briefs] POST unhandled", msg, err);
    return NextResponse.json(
      { error: "unhandled_exception", detail: msg },
      { status: 500 },
    );
  }
}

const ListQuery = z.object({
  status: z.enum(["pending", "processing", "done", "failed"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    if (!authorise(req)) {
      return NextResponse.json({ error: "unauthorised" }, { status: 401 });
    }
    const url = new URL(req.url);
    const parsed = ListQuery.safeParse({
      status: url.searchParams.get("status") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_input", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    let q = supabaseAdmin
      .from("sericia_pseo_briefs")
      .select(
        "id, topic, locale, status, article_slug, attempts, last_error, created_at, completed_at, elapsed_ms, usage",
      )
      .order("created_at", { ascending: false })
      .limit(parsed.data.limit);

    if (parsed.data.status) q = q.eq("status", parsed.data.status);

    const { data, error } = await q;
    if (error) {
      console.error("[pseo/briefs] list failed", error);
      return NextResponse.json(
        { error: "list_failed", detail: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, briefs: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[pseo/briefs] GET unhandled", msg, err);
    return NextResponse.json(
      { error: "unhandled_exception", detail: msg },
      { status: 500 },
    );
  }
}
