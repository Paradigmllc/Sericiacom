// Module marker — keeps tsc from declaring this in shared script namespace.
export {};

/**
 * F46: pSEO keyword research scorer.
 *
 * Iterates the full matrix (guides / compare / uses × locale) and asks
 * DeepSeek V4 to score each combination on four heuristics:
 *   - demand      (0-100)  monthly search volume estimate
 *   - commercial  (0-100)  buyer intent vs research intent
 *   - difficulty  (0-100)  SERP saturation by big players
 *   - sericia_fit (0-100)  match with Sericia catalog + storytelling angle
 *
 * Persists to `sericia_pseo_keyword_research` for re-rankability without
 * recomputing. Idempotent — partial unique index `(axis, combo_slug, locale)`
 * means a second run skips already-scored rows.
 *
 * Cost projection: 282 base combos (144 guides + 66 compare + 72 uses)
 * × 10 locales = 2,820 calls. With Context Caching on the shared system
 * prompt prefix (90% off effective input), total cost ≈ $0.50 lifetime.
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   DEEPSEEK_API_KEY
 *
 * Usage:
 *   npx tsx storefront/scripts/research-pseo-keywords.ts
 *   npx tsx storefront/scripts/research-pseo-keywords.ts --axis=guides --locale=en
 *   npx tsx storefront/scripts/research-pseo-keywords.ts --limit=50
 */

import { createClient } from "@supabase/supabase-js";
import {
  COUNTRIES,
  PRODUCTS,
  USE_CASES,
  buildComparePairs,
} from "../lib/pseo-matrix";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY || !DEEPSEEK_KEY) {
  console.error(
    "[pseo-research] missing env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / DEEPSEEK_API_KEY",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// Locales (must match payload + lib/pseo.ts).
const LOCALES = [
  "en",
  "ja",
  "de",
  "fr",
  "es",
  "it",
  "ko",
  "zh-TW",
  "ru",
  "ar",
] as const;
type Locale = (typeof LOCALES)[number];

type Axis = "guides" | "compare" | "uses";

// CLI flags — naive parser, sufficient for this internal tool.
const args = process.argv.slice(2);
const flag = (k: string) => {
  const f = args.find((a) => a.startsWith(`--${k}=`));
  return f ? f.split("=")[1] : undefined;
};
const FILTER_AXIS = flag("axis") as Axis | undefined;
const FILTER_LOCALE = flag("locale") as Locale | undefined;
const LIMIT = flag("limit") ? Number(flag("limit")) : undefined;

// ── Shared system prompt ─────────────────────────────────────────────
// IDENTICAL prefix across every call so DeepSeek V4's Context Caching
// (90% off cached input) applies. Do NOT vary system text per locale —
// pass locale in the user message body instead.
const SYSTEM_PROMPT = `You are an SEO analyst for Sericia, a Japanese craft food D2C brand
shipping rescued/irregular artisan goods worldwide. Sericia's catalog
includes sencha, matcha, miso, shiitake, dashi, yuzu, shichimi,
furikake, yuzu-kosho, kombu, wasabi, sansho — all sourced from named
small producers in Japan, all shipped EMS to 23+ countries.

For each keyword you score, respond with JSON only — no commentary,
no markdown fences. Schema:

{
  "demand": 0-100,        // monthly search volume estimate
  "commercial": 0-100,    // buyer intent vs research intent
  "difficulty": 0-100,    // SERP saturation by big players
  "sericia_fit": 0-100,   // match with Sericia catalog + storytelling angle
  "rationale": "1 sentence why these scores"
}

Be honest — flag obvious low-volume queries and obvious commodity
queries dominated by Amazon. Do NOT inflate sericia_fit for products
we cannot fulfil. Demand and commercial scores must be calibrated:
80+ should be reserved for queries with proven monthly search demand
in Ahrefs / SEMrush sense.`;

// ── Build full matrix as scoreable rows ──────────────────────────────
type Row = {
  axis: Axis;
  combo_slug: string;
  locale: Locale;
  topic: string;
  keywords: string[];
};

const TOPIC_BUILDERS: Record<
  Axis,
  Record<Locale, (parts: { p1?: string; p2?: string; case_?: string; country?: string }) => string>
> = {
  guides: {
    en: ({ country, p1 }) =>
      `Buying authentic ${p1} from Japan in ${country}: a guide`,
    ja: ({ country, p1 }) => `${country}から本物の日本産${p1}を購入するガイド`,
    de: ({ country, p1 }) =>
      `Echtes japanisches ${p1} in ${country} kaufen: ein Leitfaden`,
    fr: ({ country, p1 }) =>
      `Acheter ${p1} authentique du Japon en ${country} : un guide`,
    es: ({ country, p1 }) =>
      `Comprar ${p1} auténtico de Japón en ${country}: una guía`,
    it: ({ country, p1 }) =>
      `Acquistare ${p1} autentico dal Giappone in ${country}: una guida`,
    ko: ({ country, p1 }) => `${country}에서 일본산 진짜 ${p1} 구매하기 가이드`,
    "zh-TW": ({ country, p1 }) => `在${country}購買日本正宗${p1}的指南`,
    ru: ({ country, p1 }) =>
      `Покупка настоящего японского ${p1} в ${country}: руководство`,
    ar: ({ country, p1 }) => `شراء ${p1} الياباني الأصلي في ${country}: دليل`,
  },
  compare: {
    en: ({ p1, p2 }) => `${p1} vs ${p2} — comparison guide`,
    ja: ({ p1, p2 }) => `${p1}と${p2}の徹底比較ガイド`,
    de: ({ p1, p2 }) => `${p1} vs. ${p2} — Vergleichsleitfaden`,
    fr: ({ p1, p2 }) => `${p1} vs ${p2} — guide de comparaison`,
    es: ({ p1, p2 }) => `${p1} vs ${p2} — guía de comparación`,
    it: ({ p1, p2 }) => `${p1} vs ${p2} — guida al confronto`,
    ko: ({ p1, p2 }) => `${p1} vs ${p2} 비교 가이드`,
    "zh-TW": ({ p1, p2 }) => `${p1} 與 ${p2} 的比較指南`,
    ru: ({ p1, p2 }) => `${p1} против ${p2} — руководство по сравнению`,
    ar: ({ p1, p2 }) => `${p1} مقابل ${p2} — دليل المقارنة`,
  },
  uses: {
    en: ({ p1, case_ }) => `${p1} for ${case_}`,
    ja: ({ p1, case_ }) => `${p1}による${case_}`,
    de: ({ p1, case_ }) => `${p1} für ${case_}`,
    fr: ({ p1, case_ }) => `${p1} pour ${case_}`,
    es: ({ p1, case_ }) => `${p1} para ${case_}`,
    it: ({ p1, case_ }) => `${p1} per ${case_}`,
    ko: ({ p1, case_ }) => `${case_}을 위한 ${p1}`,
    "zh-TW": ({ p1, case_ }) => `用於${case_}的${p1}`,
    ru: ({ p1, case_ }) => `${p1} для ${case_}`,
    ar: ({ p1, case_ }) => `${p1} لـ ${case_}`,
  },
};

function buildAllRows(): Row[] {
  const rows: Row[] = [];
  for (const locale of LOCALES) {
    if (FILTER_LOCALE && locale !== FILTER_LOCALE) continue;
    // Guides: country × product
    if (!FILTER_AXIS || FILTER_AXIS === "guides") {
      for (const c of COUNTRIES) {
        for (const p of PRODUCTS) {
          rows.push({
            axis: "guides",
            combo_slug: `${c.code}:${p.slug}`,
            locale,
            topic: TOPIC_BUILDERS.guides[locale]({
              country: c.name,
              p1: p.name,
            }),
            keywords: [
              p.slug,
              `japanese ${p.slug}`,
              `${p.slug} ${c.name.toLowerCase()}`,
              `import ${p.slug}`,
              `where to buy ${p.slug}`,
            ],
          });
        }
      }
    }
    // Compare: alphabetical pairs
    if (!FILTER_AXIS || FILTER_AXIS === "compare") {
      for (const [a, b] of buildComparePairs()) {
        const aProduct = PRODUCTS.find((p) => p.slug === a)!;
        const bProduct = PRODUCTS.find((p) => p.slug === b)!;
        rows.push({
          axis: "compare",
          combo_slug: `${a}:${b}`,
          locale,
          topic: TOPIC_BUILDERS.compare[locale]({
            p1: aProduct.name,
            p2: bProduct.name,
          }),
          keywords: [
            `${a} vs ${b}`,
            `${aProduct.name} vs ${bProduct.name}`,
            `difference between ${a} and ${b}`,
          ],
        });
      }
    }
    // Uses: product × use-case
    if (!FILTER_AXIS || FILTER_AXIS === "uses") {
      for (const p of PRODUCTS) {
        for (const u of USE_CASES) {
          rows.push({
            axis: "uses",
            combo_slug: `${p.slug}:${u.slug}`,
            locale,
            topic: TOPIC_BUILDERS.uses[locale]({
              p1: p.name,
              case_: u.name,
            }),
            keywords: [
              `${p.slug} for ${u.slug.replace(/-/g, " ")}`,
              `${p.name} ${u.name.toLowerCase()}`,
              `best ${p.slug} for ${u.slug.replace(/-/g, " ")}`,
            ],
          });
        }
      }
    }
  }
  return rows;
}

// ── Score one keyword via DeepSeek V4 ────────────────────────────────
type Scores = {
  demand: number;
  commercial: number;
  difficulty: number;
  sericia_fit: number;
  rationale: string;
};

async function scoreOne(row: Row): Promise<Scores | null> {
  const userMessage = `Score this keyword for SEO viability:

  Locale:  ${row.locale}
  Axis:    ${row.axis} (${row.axis === "guides" ? "country × product import guide" : row.axis === "compare" ? "product-vs-product comparison" : "product for use-case"})
  Topic:   ${row.topic}
  Combo:   ${row.combo_slug}
  Variant keywords: ${row.keywords.join(", ")}

  Return JSON only.`;
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 200,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      console.error(
        `[pseo-research] HTTP ${res.status} on ${row.combo_slug}/${row.locale}`,
      );
      return null;
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    const parsed = JSON.parse(content) as Scores;
    if (
      typeof parsed.demand !== "number" ||
      typeof parsed.commercial !== "number" ||
      typeof parsed.difficulty !== "number" ||
      typeof parsed.sericia_fit !== "number"
    ) {
      console.error(
        `[pseo-research] malformed JSON on ${row.combo_slug}/${row.locale}:`,
        content.slice(0, 200),
      );
      return null;
    }
    return parsed;
  } catch (err) {
    console.error(
      `[pseo-research] ${row.combo_slug}/${row.locale}:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

function compositeScore(s: Scores): number {
  return Math.round(
    s.demand * 0.35 +
      s.commercial * 0.25 +
      (100 - s.difficulty) * 0.25 +
      s.sericia_fit * 0.15,
  );
}

// ── Main loop ────────────────────────────────────────────────────────
async function main() {
  const allRows = buildAllRows();
  const todo = LIMIT ? allRows.slice(0, LIMIT) : allRows;

  console.log(
    `[pseo-research] matrix size: ${allRows.length} | scoring: ${todo.length}`,
  );
  if (FILTER_AXIS) console.log(`  axis filter:   ${FILTER_AXIS}`);
  if (FILTER_LOCALE) console.log(`  locale filter: ${FILTER_LOCALE}`);

  // Skip rows already scored.
  const { data: existing } = await supabase
    .from("sericia_pseo_keyword_research")
    .select("axis, combo_slug, locale");
  const existingSet = new Set(
    (existing ?? []).map((r) => `${r.axis}|${r.combo_slug}|${r.locale}`),
  );

  const newRows = todo.filter(
    (r) => !existingSet.has(`${r.axis}|${r.combo_slug}|${r.locale}`),
  );
  console.log(
    `  already scored: ${todo.length - newRows.length} | to score: ${newRows.length}`,
  );

  let okCount = 0;
  let failCount = 0;
  for (let i = 0; i < newRows.length; i++) {
    const row = newRows[i];
    const scores = await scoreOne(row);
    if (!scores) {
      failCount++;
      continue;
    }
    const composite = compositeScore(scores);
    const { error } = await supabase
      .from("sericia_pseo_keyword_research")
      .insert({
        axis: row.axis,
        combo_slug: row.combo_slug,
        locale: row.locale,
        topic: row.topic,
        keywords: row.keywords,
        demand: scores.demand,
        commercial: scores.commercial,
        difficulty: scores.difficulty,
        sericia_fit: scores.sericia_fit,
        composite,
        rationale: scores.rationale,
        scored_by: "deepseek-v4-flash",
      });
    if (error) {
      console.error(`[pseo-research] insert failed for ${row.combo_slug}/${row.locale}:`, error.message);
      failCount++;
      continue;
    }
    okCount++;
    if ((i + 1) % 20 === 0 || i === newRows.length - 1) {
      console.log(
        `  progress: ${i + 1}/${newRows.length} | ok ${okCount} | fail ${failCount}`,
      );
    }
    // Politeness: 200ms between calls keeps us under DeepSeek's loose
    // rate limit and lets the cache prefix stay warm without thrashing.
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(
    `[pseo-research] ✅ done — scored ${okCount}, failed ${failCount}`,
  );
  // Top-10 preview
  const { data: top } = await supabase
    .from("sericia_pseo_keyword_research")
    .select("axis, combo_slug, locale, topic, composite, rationale")
    .order("composite", { ascending: false })
    .limit(10);
  console.log("\n[pseo-research] top 10 by composite score:");
  for (const t of top ?? []) {
    console.log(
      `  ${t.composite}  [${t.axis}] ${t.combo_slug}/${t.locale}  — ${t.topic}`,
    );
  }
}

main().catch((err) => {
  console.error("[pseo-research] fatal:", err);
  process.exit(1);
});
