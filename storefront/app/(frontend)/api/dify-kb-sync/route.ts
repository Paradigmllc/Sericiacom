/**
 * POST /api/dify-kb-sync
 *
 * Mirrors recently published Payload `articles` (and the static JOURNAL
 * pieces) into a Dify Knowledge Base so the chat assistant at /api/dify-chat
 * answers from the same canon visitors read on /journal and /articles.
 *
 * Auth: `x-admin-secret` must match SERICIA_ADMIN_SECRET (same gate as
 *       /api/pseo/generate). Called by n8n daily; can also be invoked
 *       manually from the admin dashboard.
 *
 * Sync model — "create-document-by-text" with idempotency by name:
 *   • For each article we POST to:
 *       PATCH  /v1/datasets/{kb_id}/documents/{doc_id}/update-by-text
 *         → if a document with name == `article:${slug}` already exists
 *       POST   /v1/datasets/{kb_id}/document/create-by-text
 *         → otherwise
 *   • The doc name carries the slug so re-runs are idempotent without
 *     keeping a separate sync ledger. Dify's GET /datasets/{kb_id}/documents
 *     is consulted once per run to map slug→doc_id.
 *
 * Required env (storefront container):
 *   SERICIA_ADMIN_SECRET     auth gate
 *   DIFY_SERVICE_API_KEY     `app-xxxx` (also used by /api/dify-chat) — wait,
 *                            the KB API uses a DATASET-scoped secret distinct
 *                            from the chat app key. We read DIFY_KB_API_KEY
 *                            instead and document this in commit + memory.
 *   DIFY_KB_API_KEY          dataset key from Dify dashboard
 *   DIFY_KB_DATASET_ID       UUID of the target knowledge base
 *   DIFY_API_URL             defaults to https://api.dify.ai/v1
 *
 * Body (JSON): { since_hours?: number; max_documents?: number; dryRun?: boolean }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPayloadClient } from "@/lib/payload";
import { JOURNAL } from "@/lib/journal";

const InputSchema = z
  .object({
    since_hours: z.coerce.number().int().positive().max(24 * 365).optional(),
    max_documents: z.coerce.number().int().positive().max(500).optional(),
    dryRun: z.boolean().optional(),
  })
  .optional();

const DIFY_API_URL = process.env.DIFY_API_URL ?? "https://api.dify.ai/v1";

function authorise(req: NextRequest): boolean {
  const secret = process.env.SERICIA_ADMIN_SECRET;
  if (!secret) return false;
  return (req.headers.get("x-admin-secret") ?? "") === secret;
}

type DocPayload = { name: string; text: string };

function buildDocFromArticle(a: {
  slug: string;
  title: string;
  body?: unknown;
  tldr?: unknown;
  highlights?: unknown[];
  faq?: unknown[];
}): DocPayload {
  // Flatten Lexical body into text. Lexical AST is { root: { children: [...] }};
  // pSEO articles are paragraph-only so a recursive `text` walker covers them.
  const flatten = (node: unknown): string => {
    if (!node || typeof node !== "object") return "";
    const n = node as { type?: string; text?: string; children?: unknown[] };
    if (n.type === "text" && typeof n.text === "string") return n.text;
    if (Array.isArray(n.children)) {
      return n.children.map(flatten).join(" ");
    }
    return "";
  };

  const tldrText = a.tldr ? flatten(a.tldr) : "";
  const bodyText = a.body ? flatten(a.body) : "";
  const highlights = Array.isArray(a.highlights)
    ? a.highlights
        .map((h) => {
          if (typeof h === "object" && h && "text" in h) {
            return String((h as { text: unknown }).text ?? "");
          }
          return "";
        })
        .filter(Boolean)
        .join("\n- ")
    : "";
  const faq = Array.isArray(a.faq)
    ? a.faq
        .map((item) => {
          if (typeof item === "object" && item && "q" in item && "a" in item) {
            const f = item as { q: unknown; a: unknown };
            return `Q: ${String(f.q)}\nA: ${String(f.a)}`;
          }
          return "";
        })
        .filter(Boolean)
        .join("\n\n")
    : "";

  // Dify document name doubles as our idempotency key.
  const name = `article:${a.slug}`;

  // Plain-text representation Dify can chunk + embed. Title at the top,
  // followed by TLDR, then body, then highlights and FAQ. No markdown
  // formatting — Dify's default chunker handles plain text best.
  const text = [
    `# ${a.title}`,
    tldrText && `\nSummary:\n${tldrText}`,
    bodyText && `\n${bodyText}`,
    highlights && `\nKey takeaways:\n- ${highlights}`,
    faq && `\nFrequently asked:\n${faq}`,
    `\nSource URL: https://sericia.com/articles/${a.slug}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { name, text };
}

function buildDocFromStaticJournal(a: (typeof JOURNAL)[number]): DocPayload {
  const sectionsText = a.sections.map((s) => `## ${s.heading}\n${s.body}`).join("\n\n");
  const faqText = a.faq
    .map((f) => `Q: ${f.q}\nA: ${f.a}`)
    .join("\n\n");
  const text = [
    `# ${a.title}`,
    `\n${a.lede}`,
    a.tldr && `\nSummary:\n${a.tldr}`,
    sectionsText && `\n${sectionsText}`,
    faqText && `\nFrequently asked:\n${faqText}`,
    `\nSource URL: https://sericia.com/journal/${a.slug}`,
  ]
    .filter(Boolean)
    .join("\n");
  return { name: `journal:${a.slug}`, text };
}

async function listExistingDocuments(
  kbId: string,
  apiKey: string,
): Promise<Map<string, string>> {
  // Dify paginates documents at 100/page. Two pages handles 200 docs which
  // covers the next year of pSEO at current pace; if we exceed that the
  // map will be incomplete and we'll re-create instead of update for the
  // overflow — non-fatal but adds duplicate rows. Bump page count when
  // article count > 180.
  const out = new Map<string, string>();
  for (let page = 1; page <= 2; page++) {
    const res = await fetch(
      `${DIFY_API_URL}/datasets/${kbId}/documents?page=${page}&limit=100`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(20_000),
      },
    );
    if (!res.ok) {
      console.error(
        "[dify-kb-sync] failed to list existing documents",
        res.status,
        await res.text().catch(() => ""),
      );
      return out; // Return what we have; upstream will create duplicates
                  // for the missing-list case rather than throw.
    }
    const json = (await res.json()) as { data?: Array<{ id: string; name: string }> };
    for (const d of json.data ?? []) out.set(d.name, d.id);
    if (!json.data || json.data.length < 100) break;
  }
  return out;
}

async function pushDoc(
  kbId: string,
  apiKey: string,
  doc: DocPayload,
  existingId: string | null,
): Promise<"created" | "updated" | "failed"> {
  const url = existingId
    ? `${DIFY_API_URL}/datasets/${kbId}/documents/${existingId}/update-by-text`
    : `${DIFY_API_URL}/datasets/${kbId}/document/create-by-text`;

  const body = {
    name: doc.name,
    text: doc.text,
    indexing_technique: "high_quality",
    // economy = keyword-only; high_quality = embeddings.
    process_rule: { mode: "automatic" },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[dify-kb-sync] push failed", doc.name, res.status, t.slice(0, 300));
      return "failed";
    }
    return existingId ? "updated" : "created";
  } catch (e) {
    console.error("[dify-kb-sync] push exception", doc.name, e);
    return "failed";
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    if (!authorise(req)) {
      return NextResponse.json({ error: "unauthorised" }, { status: 401 });
    }

    const apiKey = process.env.DIFY_KB_API_KEY;
    const kbId = process.env.DIFY_KB_DATASET_ID;
    if (!apiKey || !kbId) {
      return NextResponse.json(
        {
          error: "dify_kb_not_configured",
          hint: "Set DIFY_KB_API_KEY and DIFY_KB_DATASET_ID in Coolify env.",
        },
        { status: 503 },
      );
    }

    let sinceHours = 26;
    let maxDocs = 100;
    let dryRun = false;
    try {
      const raw = await req.text();
      if (raw.trim().length > 0) {
        const parsed = InputSchema.safeParse(JSON.parse(raw));
        if (parsed.success && parsed.data) {
          sinceHours = parsed.data.since_hours ?? sinceHours;
          maxDocs = parsed.data.max_documents ?? maxDocs;
          dryRun = parsed.data.dryRun ?? false;
        }
      }
    } catch {
      // Empty / invalid body → use defaults
    }

    // 1. Pull recent Payload articles. We fetch ALL published — Dify-side
    //    dedup by `name` makes this idempotent. since_hours is a soft hint
    //    that becomes meaningful only if max_documents is hit.
    const payload = await getPayloadClient();
    const cutoff = new Date(Date.now() - sinceHours * 3600_000).toISOString();
    const { docs: payloadArticles } = await payload.find({
      collection: "articles",
      where: {
        and: [
          { _status: { equals: "published" } },
          { updatedAt: { greater_than_equal: cutoff } },
        ],
      },
      depth: 0,
      limit: maxDocs,
      sort: "-updatedAt",
      pagination: false,
    });

    // 2. Static journal — rebuild every run since we don't track edit time.
    //    These are small (~13) and rarely change, but since the names
    //    namespace as `journal:${slug}` they update in place.
    const allDocs: DocPayload[] = [];
    for (const a of payloadArticles ?? []) {
      allDocs.push(buildDocFromArticle(a));
    }
    for (const a of JOURNAL) {
      allDocs.push(buildDocFromStaticJournal(a));
    }

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        candidates: allDocs.length,
        sample: allDocs.slice(0, 3).map((d) => ({ name: d.name, length: d.text.length })),
      });
    }

    // 3. Map existing docs in the KB so we know which to update vs create.
    const existing = await listExistingDocuments(kbId, apiKey);

    let created = 0;
    let updated = 0;
    let failed = 0;
    for (const doc of allDocs) {
      const existingId = existing.get(doc.name) ?? null;
      const r = await pushDoc(kbId, apiKey, doc, existingId);
      if (r === "created") created++;
      else if (r === "updated") updated++;
      else failed++;
      // Small delay between pushes — Dify's free-tier rate limit is gentle
      // but bursts of 100 in <2s sometimes 429.
      await new Promise((res) => setTimeout(res, 250));
    }

    return NextResponse.json({
      ok: true,
      synced: created + updated,
      created,
      updated,
      skipped: 0,
      failed,
      kb_total: existing.size + created,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[dify-kb-sync] unhandled", msg, err);
    return NextResponse.json(
      { error: "unhandled_exception", detail: msg },
      { status: 500 },
    );
  }
}
