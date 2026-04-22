/**
 * Seed pSEO briefs into `sericia_pseo_briefs`.
 *
 * Purpose: give the pSEO pipeline a warm queue on first boot so the n8n
 * workflow has something to generate during the first cron run. Topics
 * here are deliberately product-anchored (sencha / miso / shiitake) —
 * they're the drop #01 catalog and cross-link to the static country ×
 * product guides in /pseo/[country]/[product] for interlinking.
 *
 * Idempotent: the partial unique index on (lower(topic), locale) covering
 * status in ('pending','processing','done') means a second run skips any
 * brief already in one of those states. Failed briefs are re-insertable
 * (explicitly — a previous failure shouldn't block a manual retry).
 *
 * Usage:
 *   npm run seed:pseo-briefs
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (seed runs under service role — bypasses RLS)
 */

import { createClient } from "@supabase/supabase-js";

// Locales MUST match Payload's localization.locales. See lib/pseo.ts for
// the canonical PseoLocale union.
type SeedBrief = {
  topic: string;
  locale:
    | "en"
    | "ja"
    | "de"
    | "fr"
    | "es"
    | "it"
    | "ko"
    | "zh-TW"
    | "ru"
    | "ar";
  keywords: string[];
  related_product_handle?: string;
  cluster?: string;
  grounding_facts?: string[];
};

// Three warm-up briefs: EN (baseline), DE (second-biggest target market),
// JA (anchor home audience). Cache-warming bonus: same system prompt
// across all three means the first run populates the cache for the rest.
const SEEDS: SeedBrief[] = [
  {
    topic: "Uji first-flush sencha: why the harvest window matters",
    locale: "en",
    keywords: [
      "uji sencha",
      "first flush",
      "ichibancha",
      "single origin green tea",
      "japanese tea",
    ],
    related_product_handle: "uji-sencha",
    cluster: "drop-01",
    grounding_facts: [
      "Yamane-en is a fourth-generation grower on the Uji district edge, forty minutes south of Kyoto Station.",
      "The tea in Drop No. 01 is first-flush 2025 ichibancha, picked first week of May.",
      "Single cultivar: Yabukita. Steamed and rolled the same afternoon the leaf was picked.",
      "Sericia buys at full retail price — not as discounted surplus — before the Tokyo wholesaler would have taken it.",
      "Brewing guide: 70°C water, 2g leaf per 80ml, 45 seconds first infusion.",
    ],
  },
  {
    topic: "Zwei Jahre im Zedernfass: Aichi Mame-Miso verstehen",
    locale: "de",
    keywords: [
      "aichi miso",
      "mame miso",
      "zedernfass",
      "barrel aged miso",
      "japanische fermentation",
    ],
    related_product_handle: "aichi-aka-miso",
    cluster: "drop-01",
    grounding_facts: [
      "Kurashige Jozoten ferments in cedar barrels in use since 1904.",
      "The miso in Drop No. 01 is a two-year aged aka (red) mame-miso from barrel seventeen, lifted February 2025.",
      "Aichi mame-miso is made from soybeans and koji only — no rice, no barley.",
      "The label on the jar names the specific barrel the paste came from.",
      "Pairing suggestions: dashi-based soup, glazed eggplant (nasu dengaku), marinade for oily fish.",
    ],
  },
  {
    topic: "山形の五日干し椎茸：小ぶりな笠を選ぶ理由",
    locale: "ja",
    keywords: [
      "干し椎茸",
      "山形",
      "冷水戻し",
      "椎茸の戻し汁",
      "出汁",
    ],
    related_product_handle: "yamagata-shiitake",
    cluster: "drop-01",
    grounding_facts: [
      "山形森は宮城寄りの山辺町外にあり、600本のナラ原木で育てている。",
      "Drop No. 01の椎茸は2025年9月末に5日間竹簾で天日干し、さらに48時間常湿の蔵で乾燥。",
      "スーパーは6cm以上の笠を好むため、それ以下のサイズが業務上の余剰になる。",
      "Sericiaは小笠のみを買い取り、発色と香りが凝縮されていると明示する。",
      "推奨戻し方：冷水に一晩、戻し汁は出汁として必ず使う。",
    ],
  },
];

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "[seed-pseo-briefs] NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
    process.exit(1);
  }

  const sb = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const seed of SEEDS) {
    const { error } = await sb.from("sericia_pseo_briefs").insert({
      topic: seed.topic,
      locale: seed.locale,
      keywords: seed.keywords,
      related_product_handle: seed.related_product_handle ?? null,
      cluster: seed.cluster ?? null,
      grounding_facts: seed.grounding_facts ?? [],
      status: "pending",
    });

    if (!error) {
      inserted++;
      console.log(`[seed-pseo-briefs] inserted — [${seed.locale}] ${seed.topic}`);
      continue;
    }

    // 23505 = unique_violation on (lower(topic), locale) partial index.
    // That means an equivalent brief is already pending/processing/done — skip.
    if (error.code === "23505") {
      skipped++;
      console.log(
        `[seed-pseo-briefs] skipped — [${seed.locale}] ${seed.topic} (already queued)`,
      );
      continue;
    }

    failed++;
    console.error(
      `[seed-pseo-briefs] failed — [${seed.locale}] ${seed.topic}: ${error.message}`,
    );
  }

  console.log(
    `[seed-pseo-briefs] done. inserted=${inserted}, skipped=${skipped}, failed=${failed}, total=${SEEDS.length}.`,
  );
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[seed-pseo-briefs] unhandled", err);
  process.exit(1);
});
