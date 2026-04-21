#!/usr/bin/env node
// Generates 64 pSEO articles via DeepSeek V3, upserts to Supabase
// Usage: DEEPSEEK_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/generate-pseo.mjs

import { createClient } from "@supabase/supabase-js";

const COUNTRIES = [
  { code: "us", name: "United States", currency: "USD" },
  { code: "uk", name: "United Kingdom", currency: "GBP" },
  { code: "de", name: "Germany", currency: "EUR" },
  { code: "fr", name: "France", currency: "EUR" },
  { code: "au", name: "Australia", currency: "AUD" },
  { code: "sg", name: "Singapore", currency: "SGD" },
  { code: "ca", name: "Canada", currency: "CAD" },
  { code: "hk", name: "Hong Kong", currency: "HKD" },
];

const PRODUCTS = [
  { slug: "sencha", name: "Sencha (Japanese Green Tea)" },
  { slug: "matcha", name: "Matcha" },
  { slug: "miso", name: "Miso Paste" },
  { slug: "shiitake", name: "Dried Shiitake Mushrooms" },
  { slug: "dashi", name: "Dashi Stock" },
  { slug: "yuzu", name: "Yuzu Citrus Products" },
  { slug: "shichimi", name: "Shichimi Togarashi" },
  { slug: "furikake", name: "Furikake Rice Seasoning" },
];

const SYSTEM_PROMPT = `You are Sericia's SEO content writer. Sericia (sericia.com) sells rescued Japanese craft food
— near-expiry, surplus-inventory, or discontinued-edition sencha, miso, shiitake and more — as limited-edition
worldwide drops shipped EMS from Japan. We rescue surplus from Japanese makers and ship it before it's disposed.

Write SEO-optimized buyer guides. Output STRICT JSON only, no markdown wrapper, matching this schema:
{
  "title": "60-char page title including product+country+year (e.g. 'Buy Authentic Sencha in the US (2026 Guide) | Sericia')",
  "meta_description": "155-char meta description with value prop + CTA",
  "intro_md": "300-400 word intro explaining what the product is, who it's for, why buying direct from Japan matters. Plain prose, no markdown headings.",
  "why_japanese_md": "300-400 word section on why authentic Japanese origin matters for THIS product, regional specialties (Uji/Shizuoka/etc), craft traditions. Plain prose.",
  "shipping_info_md": "200-word section on EMS shipping from Japan to the target country. Include realistic transit time, customs notes, EMS price tiers (¥1,350 <100g / ¥1,750 <250g / ¥2,150 <500g / ¥3,100 <1kg).",
  "faq": [
    {"q": "...", "a": "..."},
    ... 5 total FAQ items specific to the product/country pair
  ]
}

Tone: warm, concise, premium Japanese-craft aesthetic. English only. Never fabricate specific brand names —
refer to Sericia drops generically. Mention that drops are limited and sell out.`;

async function generateOne(country, product) {
  const userQuery = `Write the buyer guide for: ${product.name} → ${country.name}. Year: 2026.`;
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery },
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return JSON.parse(json.choices[0].message.content);
}

async function main() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  let ok = 0;
  let fail = 0;
  for (const c of COUNTRIES) {
    for (const p of PRODUCTS) {
      const slug = `${c.code}-${p.slug}`;
      try {
        console.log(`→ ${slug}`);
        const article = await generateOne(c, p);
        const { error } = await supabase.from("sericia_pseo").upsert({
          slug,
          country_code: c.code,
          country_name: c.name,
          product_slug: p.slug,
          product_name: p.name,
          title: article.title,
          meta_description: article.meta_description,
          intro_md: article.intro_md,
          why_japanese_md: article.why_japanese_md,
          shipping_info_md: article.shipping_info_md,
          faq: article.faq,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
        ok++;
      } catch (e) {
        console.error(`  ✗ ${slug}: ${e.message}`);
        fail++;
      }
    }
  }
  console.log(`\nDone. ok=${ok} fail=${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
