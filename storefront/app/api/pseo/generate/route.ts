/**
 * POST /api/pseo/generate
 *
 * Consumers:
 *   - n8n cron (hourly): calls with no body → dequeues one pending brief.
 *   - Admin dashboard retry: calls with `{ brief_id: number }` → forces
 *     a specific brief through the pipeline regardless of queue order.
 *
 * Auth: `x-admin-secret` header must match SERICIA_ADMIN_SECRET.
 *       Same pattern as /api/orders/[id]/ship — see lib/admin-auth.ts
 *       for why the cookie variant of the same check also exists.
 *
 * Queue claim strategy (why it's the way it is):
 *   We use `UPDATE ... RETURNING` against a single pending row. If no
 *   pending row is available, we also sweep for stale `processing` rows
 *   (processing_started_at < now() - 15min) — those come from crashed
 *   n8n workers and should be retried. This gives us at-least-once
 *   semantics without needing a full advisory-lock dance for the MVP.
 *
 *   FUTURE: if we scale to multiple concurrent workers, swap the two
 *   UPDATEs below for `SELECT ... FOR UPDATE SKIP LOCKED` via
 *   supabase.rpc('pseo_claim_next') — but for one worker, the simpler
 *   atomic UPDATE is fine and has zero extra moving parts.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getPayloadClient } from "@/lib/payload";
import { generatePseoArticle, type PseoBrief, type PseoLocale } from "@/lib/pseo";

// ─── Types ──────────────────────────────────────────────────────────────────

type BriefRow = {
  id: number;
  topic: string;
  locale: PseoLocale;
  keywords: string[];
  related_product_handle: string | null;
  cluster: string | null;
  grounding_facts: string[];
  attempts: number;
};

const InputSchema = z.object({
  brief_id: z.number().int().positive().optional(),
}).optional();

// ─── Auth ───────────────────────────────────────────────────────────────────

function authorise(req: NextRequest): boolean {
  const secret = process.env.SERICIA_ADMIN_SECRET;
  if (!secret) {
    console.error("[pseo/generate] SERICIA_ADMIN_SECRET not set");
    return false;
  }
  const provided = req.headers.get("x-admin-secret") ?? "";
  return provided.length > 0 && provided === secret;
}

// ─── Queue claim ────────────────────────────────────────────────────────────

const STALE_PROCESSING_MINUTES = 15;

/**
 * Claim a brief for this worker.
 * Priority order:
 *   1. Specific brief_id requested (dashboard retry flow).
 *   2. Oldest pending brief.
 *   3. Stale 'processing' brief (worker crashed before marking done/failed).
 * Returns null if queue is empty.
 */
async function claimBrief(briefId?: number): Promise<BriefRow | null> {
  const stampNow = new Date().toISOString();

  // Path 1: specific brief_id
  if (typeof briefId === "number") {
    const { data, error } = await supabaseAdmin
      .from("sericia_pseo_briefs")
      .update({
        status: "processing",
        processing_started_at: stampNow,
        attempts: 1, // reset — dashboard retry is an explicit fresh shot
      })
      .eq("id", briefId)
      .in("status", ["pending", "failed"])
      .select("id, topic, locale, keywords, related_product_handle, cluster, grounding_facts, attempts")
      .single();
    if (error) {
      if (error.code === "PGRST116") return null; // no rows matched
      throw new Error(`claim by id failed: ${error.message}`);
    }
    return data as BriefRow;
  }

  // Path 2: oldest pending
  {
    const { data: pendingId } = await supabaseAdmin
      .from("sericia_pseo_briefs")
      .select("id")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (pendingId) {
      const { data, error } = await supabaseAdmin
        .from("sericia_pseo_briefs")
        .update({
          status: "processing",
          processing_started_at: stampNow,
        })
        .eq("id", pendingId.id)
        .eq("status", "pending")
        .select("id, topic, locale, keywords, related_product_handle, cluster, grounding_facts, attempts")
        .single();
      if (!error && data) {
        // Bump attempts separately so update+select returns the post-bump value.
        const bumped = { ...data, attempts: (data.attempts ?? 0) + 1 } as BriefRow;
        await supabaseAdmin
          .from("sericia_pseo_briefs")
          .update({ attempts: bumped.attempts })
          .eq("id", data.id);
        return bumped;
      }
      // If error was a lost race (another worker grabbed it), fall through
      // to stale-processing sweep.
    }
  }

  // Path 3: stale processing sweep
  {
    const staleBefore = new Date(
      Date.now() - STALE_PROCESSING_MINUTES * 60_000,
    ).toISOString();
    const { data: staleId } = await supabaseAdmin
      .from("sericia_pseo_briefs")
      .select("id")
      .eq("status", "processing")
      .lt("processing_started_at", staleBefore)
      .order("processing_started_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (staleId) {
      const { data, error } = await supabaseAdmin
        .from("sericia_pseo_briefs")
        .update({ processing_started_at: stampNow })
        .eq("id", staleId.id)
        .eq("status", "processing")
        .select("id, topic, locale, keywords, related_product_handle, cluster, grounding_facts, attempts")
        .single();
      if (!error && data) {
        const bumped = { ...data, attempts: (data.attempts ?? 0) + 1 } as BriefRow;
        await supabaseAdmin
          .from("sericia_pseo_briefs")
          .update({ attempts: bumped.attempts })
          .eq("id", data.id);
        return bumped;
      }
    }
  }

  return null;
}

// ─── Slug collision handling ────────────────────────────────────────────────

/**
 * Namespace slugs by locale for non-English to avoid the global
 * `unique: true` constraint on articles.slug. SEO-wise the URL will end up
 * at `/journal/de-foo-bar` for German — totally fine, distinct from English.
 */
function namespacedSlug(locale: PseoLocale, rawSlug: string): string {
  return locale === "en" ? rawSlug : `${locale}-${rawSlug}`;
}

/** Append -2, -3, ... up to MAX_COLLISION_RETRIES if slug already exists. */
const MAX_COLLISION_RETRIES = 5;
async function resolveUniqueSlug(
  base: string,
  payloadFind: (slug: string) => Promise<boolean>,
): Promise<string | null> {
  for (let i = 0; i < MAX_COLLISION_RETRIES; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await payloadFind(candidate);
    if (!taken) return candidate;
  }
  return null;
}

// ─── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    if (!authorise(req)) {
      return NextResponse.json({ error: "unauthorised" }, { status: 401 });
    }

    // Body is optional. Treat empty/invalid body as "dequeue next".
    let briefId: number | undefined;
    try {
      const raw = await req.text();
      if (raw.trim().length > 0) {
        const parsed = InputSchema.safeParse(JSON.parse(raw));
        if (parsed.success) briefId = parsed.data?.brief_id;
      }
    } catch {
      // Empty / non-JSON body → treat as dequeue-next. Not fatal.
    }

    const brief = await claimBrief(briefId);
    if (!brief) {
      return NextResponse.json({ ok: true, claimed: null, reason: "queue_empty" });
    }

    // ── Generation ────────────────────────────────────────────────────────
    try {
      const briefInput: PseoBrief = {
        topic: brief.topic,
        locale: brief.locale,
        keywords: brief.keywords,
        related_product_handle: brief.related_product_handle,
        cluster: brief.cluster,
        grounding_facts: brief.grounding_facts,
      };

      const article = await generatePseoArticle(briefInput);
      const payload = await getPayloadClient();

      // Resolve a unique slug — prefix by locale for non-English.
      const base = namespacedSlug(brief.locale, article.slug);
      const finalSlug = await resolveUniqueSlug(base, async (s) => {
        const { totalDocs } = await payload.find({
          collection: "articles",
          where: { slug: { equals: s } },
          limit: 1,
          pagination: false,
        });
        return totalDocs > 0;
      });
      if (!finalSlug) {
        throw new Error(
          `slug collision: could not find a free slug after ${MAX_COLLISION_RETRIES} attempts (base=${base})`,
        );
      }

      // Persist. `locale` directs Payload to write localized fields into the
      // correct column — title/tldr/body/highlights/pullQuotes/faq/seo.*
      // are all localized on the Articles collection.
      const created = await payload.create({
        collection: "articles",
        locale: brief.locale,
        data: {
          title: article.title,
          slug: finalSlug,
          category: "journal",
          tldr: article.tldr,
          body: article.body,
          highlights: article.highlights.map((text) => ({ text })),
          faq: article.faq,
          tags: [
            { tag: "pseo" },
            ...(brief.cluster ? [{ tag: brief.cluster }] : []),
          ],
          publishedAt: new Date().toISOString(),
          seo: {
            metaTitle: article.meta_title,
            metaDescription: article.meta_description,
          },
          _status: "published",
        },
      });

      // Mark brief done.
      await supabaseAdmin
        .from("sericia_pseo_briefs")
        .update({
          status: "done",
          article_slug: finalSlug,
          article_id: String(created.id),
          usage: article.telemetry.usage,
          prompt_version: article.telemetry.prompt_version,
          elapsed_ms: article.telemetry.elapsed_ms,
          completed_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", brief.id);

      return NextResponse.json({
        ok: true,
        brief_id: brief.id,
        article_id: created.id,
        slug: finalSlug,
        locale: brief.locale,
        usage: article.telemetry.usage,
        elapsed_ms: article.telemetry.elapsed_ms,
      });
    } catch (genErr) {
      const message = genErr instanceof Error ? genErr.message : String(genErr);
      console.error("[pseo/generate] generation failed", {
        brief_id: brief.id,
        message,
      });
      await supabaseAdmin
        .from("sericia_pseo_briefs")
        .update({
          status: "failed",
          last_error: message.slice(0, 2000),
        })
        .eq("id", brief.id);
      return NextResponse.json(
        { ok: false, brief_id: brief.id, error: "generation_failed", detail: message },
        { status: 500 },
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[pseo/generate] unhandled", msg, err);
    return NextResponse.json(
      { error: "unhandled_exception", detail: msg },
      { status: 500 },
    );
  }
}
