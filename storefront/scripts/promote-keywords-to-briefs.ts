// Module marker — keeps tsc from declaring this in shared script namespace.
export {};

/**
 * F47: promote scored keywords (composite ≥ threshold) into the pSEO
 * brief queue.
 *
 * Bridges:
 *   research-pseo-keywords.ts (writes sericia_pseo_keyword_research)
 *      ↓
 *   THIS script (reads research, inserts briefs)
 *      ↓
 *   drain-pseo-queue.ts (generates articles via DeepSeek V4)
 *
 * Idempotent — sets `promoted = true` after writing to briefs so
 * re-runs skip already-promoted rows. The brief queue's own partial
 * unique index on (lower(topic), locale) provides a second safety net.
 *
 * CLI flags:
 *   --threshold=60   composite score gate (default 60)
 *   --limit=100      max number of briefs to insert this run
 *   --axis=guides    only promote one axis (guides|compare|uses)
 *   --locale=en      only promote one locale
 *   --dry-run        print what would be promoted, no inserts
 *
 * Usage:
 *   npx tsx storefront/scripts/promote-keywords-to-briefs.ts --limit=100
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "[promote] missing env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const args = process.argv.slice(2);
const flag = (k: string) => {
  const f = args.find((a) => a.startsWith(`--${k}=`));
  return f ? f.split("=")[1] : undefined;
};
const has = (k: string) => args.includes(`--${k}`);

const THRESHOLD = flag("threshold") ? Number(flag("threshold")) : 60;
const LIMIT = flag("limit") ? Number(flag("limit")) : 100;
const FILTER_AXIS = flag("axis");
const FILTER_LOCALE = flag("locale");
const DRY_RUN = has("dry-run");

async function main() {
  console.log(
    `[promote] threshold=${THRESHOLD} limit=${LIMIT}${FILTER_AXIS ? ` axis=${FILTER_AXIS}` : ""}${FILTER_LOCALE ? ` locale=${FILTER_LOCALE}` : ""}${DRY_RUN ? " [DRY RUN]" : ""}`,
  );

  // Pull top-N un-promoted rows above threshold, ordered by composite desc.
  let q = supabase
    .from("sericia_pseo_keyword_research")
    .select(
      "id, axis, combo_slug, locale, topic, keywords, composite, demand, commercial, difficulty, sericia_fit",
    )
    .eq("promoted", false)
    .gte("composite", THRESHOLD)
    .order("composite", { ascending: false })
    .limit(LIMIT);
  if (FILTER_AXIS) q = q.eq("axis", FILTER_AXIS);
  if (FILTER_LOCALE) q = q.eq("locale", FILTER_LOCALE);

  const { data: candidates, error } = await q;
  if (error) {
    console.error("[promote] query failed:", error.message);
    process.exit(1);
  }
  if (!candidates || candidates.length === 0) {
    console.log("[promote] no candidates above threshold");
    return;
  }

  console.log(`[promote] candidates: ${candidates.length}`);
  for (const c of candidates) {
    console.log(
      `  [${c.composite}] ${c.axis}/${c.combo_slug}/${c.locale} — ${c.topic}`,
    );
  }

  if (DRY_RUN) {
    console.log("\n[promote] DRY RUN — no inserts performed");
    return;
  }

  // Insert into sericia_pseo_briefs. Schema:
  //   topic / locale / keywords / cluster (we use the axis) /
  //   grounding_facts (we pass top-3 score points)
  let okCount = 0;
  let skipCount = 0;
  for (const c of candidates) {
    const groundingFacts = [
      `Demand score: ${c.demand}/100`,
      `Commercial intent: ${c.commercial}/100`,
      `SERP difficulty: ${c.difficulty}/100`,
      `Sericia catalog fit: ${c.sericia_fit}/100`,
    ];
    const { error: insertErr } = await supabase
      .from("sericia_pseo_briefs")
      .insert({
        topic: c.topic,
        locale: c.locale,
        keywords: c.keywords,
        cluster: c.axis,
        grounding_facts: groundingFacts,
        // related_product_handle: derive from combo_slug if axis is uses/compare
        related_product_handle:
          c.axis === "uses" || c.axis === "compare"
            ? c.combo_slug.split(":")[0]
            : null,
      });
    if (insertErr) {
      // Unique index conflict → already in queue, skip.
      if (insertErr.code === "23505") {
        skipCount++;
        continue;
      }
      console.error(
        `  insert fail ${c.combo_slug}/${c.locale}:`,
        insertErr.message,
      );
      continue;
    }
    // Mark as promoted.
    const { error: markErr } = await supabase
      .from("sericia_pseo_keyword_research")
      .update({ promoted: true, promoted_at: new Date().toISOString() })
      .eq("id", c.id);
    if (markErr) {
      console.error(
        `  promote-mark fail ${c.combo_slug}/${c.locale}:`,
        markErr.message,
      );
    }
    okCount++;
  }
  console.log(
    `[promote] ✅ done — promoted ${okCount}, skipped ${skipCount} (already in queue)`,
  );
}

main().catch((err) => {
  console.error("[promote] fatal:", err);
  process.exit(1);
});
