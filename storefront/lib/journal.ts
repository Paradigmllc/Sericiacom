/**
 * Editorial journal articles (pUtility / pSEO).
 * Each article is a first-class data record so we can ship many without
 * duplicating boilerplate per page. Rendered by /journal/[slug]/page.tsx.
 */

export type JournalFaq = { q: string; a: string };

export type JournalArticle = {
  slug: string;
  title: string;
  lede: string;
  eyebrow: string;
  tldr: string;
  stats: { value: string; label: string }[];
  sections: { id: string; heading: string; body: string }[];
  faq: JournalFaq[];
  relatedTools?: { href: string; label: string }[];
  relatedArticles?: { href: string; label: string }[];
  published: string; // ISO date
  readingMinutes: number;
};

export const JOURNAL: JournalArticle[] = [
  {
    slug: "sencha-regions",
    title: "Single-origin sencha: the six regions that matter.",
    lede: "Shizuoka, Kagoshima, Uji, Yame, Fukuoka, Kumamoto — why a single-origin sencha tastes different from a blend, and what to expect from each.",
    eyebrow: "Journal · Tea",
    tldr: "Shizuoka produces 40% of Japan's tea — bright, grassy, the classic sencha profile. Kagoshima (south) is bolder and richer, harvested earlier. Uji (Kyoto) is the reference standard, priced accordingly. Yame and Fukuoka specialise in gyokuro. Sericia sources single-origin from small farms in all six.",
    stats: [
      { value: "40%", label: "Shizuoka share of Japan's tea output" },
      { value: "1738", label: "Year Uji's sencha method was codified" },
      { value: "6", label: "Regions Sericia sources from" },
    ],
    sections: [
      {
        id: "shizuoka",
        heading: "Shizuoka — the benchmark.",
        body: "Cooled by ocean breeze and shaded by Mt Fuji, Shizuoka is the industry benchmark for bright, grassy sencha. Any sencha you drink outside Japan is likely Shizuoka-derived if unlabelled. Look for first-flush (ichibancha) harvested late April through mid-May; subsequent flushes are cheaper but flatter.",
      },
      {
        id: "kagoshima",
        heading: "Kagoshima — the bold south.",
        body: "Southernmost tea prefecture, volcanic soil, warm climate. Harvested up to three weeks earlier than Shizuoka. Richer umami, lower astringency, darker liquor. Preferred in high-end restaurants for its depth. Cultivars like Yutakamidori and Asatsuyu are Kagoshima specialities.",
      },
      {
        id: "uji",
        heading: "Uji — the reference.",
        body: "The tea-producing district of Kyoto since the 12th century. Home to the shading techniques that produce gyokuro and tencha (the matcha raw material). True Uji sencha is expensive — often 3–5× Shizuoka. If you want to know what sencha is supposed to taste like at its peak, this is the benchmark.",
      },
      {
        id: "yame-fukuoka",
        heading: "Yame and Fukuoka — the shaded greens.",
        body: "Yame in Fukuoka prefecture is Japan's gyokuro capital. Heavy shading (20 days or more under reed screens) produces the sweetest, most umami-laden greens. Yame sencha is a different style — mellower, with less astringency and more body than Shizuoka.",
      },
      {
        id: "kumamoto",
        heading: "Kumamoto and the emerging producers.",
        body: "Kumamoto, Miyazaki, Saga — smaller regions that account for niche high-quality output. Often organic, often single-cultivar, often direct-from-farmer. The wild cards. Sericia's quarterly drops frequently feature these smaller producers — supply is limited, which is why our drops sell out in hours.",
      },
    ],
    faq: [
      { q: "What is single-origin sencha?", a: "Tea from a single farm, single harvest, and ideally a single cultivar — as opposed to commodity sencha which blends leaves from dozens of farms to hit a consistent industrial flavour. Single-origin expresses terroir the way wine does." },
      { q: "Is Kagoshima sencha better than Shizuoka?", a: "It's different, not better. Kagoshima is richer and darker; Shizuoka is brighter and grassier. A well-stocked tea drawer has both." },
      { q: "How much does authentic Uji sencha cost?", a: "Expect £40–90 per 100g for single-origin Uji sencha. Anything under £20 labelled 'Uji' is likely a blend or mislabelled." },
      { q: "What is ichibancha?", a: "The first-flush harvest, picked in late April through mid-May. The sweetest, most prized harvest of the year. Second-flush (nibancha) is cheaper and more astringent; third is bulk commodity." },
    ],
    relatedTools: [
      { href: "/tools/tea-brewer", label: "Tea brewing calculator" },
      { href: "/tools/matcha-grade", label: "Matcha grade decoder" },
    ],
    relatedArticles: [
      { href: "/journal/matcha-grading", label: "Matcha: ceremonial vs. culinary" },
      { href: "/journal/water-temperature", label: "Why water temperature ruins most tea" },
    ],
    published: "2025-03-12",
    readingMinutes: 7,
  },
  {
    slug: "matcha-grading",
    title: "Matcha grading: ceremonial, premium, culinary.",
    lede: "The three grades that matter, and why 90% of the 'ceremonial' matcha sold abroad isn't.",
    eyebrow: "Journal · Tea",
    tldr: "Ceremonial matcha is made from first-flush, shaded, stone-ground tencha leaves — bright jade, umami-sweet, for whisking. Premium is second flush — still whisk-grade but less nuanced. Culinary grade is for baking and lattes. The word 'ceremonial' has no legal protection outside Japan — so any brand can use it. Check the colour (jade, not olive), the price (£40+/30g for real ceremonial), and the origin (Uji, Nishio, or Yame).",
    stats: [
      { value: "20+", label: "Days of shading before harvest" },
      { value: "1h", label: "Stone-milling time per 40g" },
      { value: "£40+", label: "Ceremonial grade floor price per 30g" },
    ],
    sections: [
      {
        id: "ceremonial",
        heading: "Ceremonial grade — what it actually means.",
        body: "Made exclusively from first-flush tencha leaves (the shaded, de-stemmed, de-veined raw material for matcha), stone-ground on granite mills at 30 rotations per minute. A single mill produces 40g per hour — so ceremonial grade is expensive by nature. The colour is bright jade, the flavour is sweet-umami with no bitterness. Whisk with 75°C water at 2g per 70ml for thin usucha, or 4g per 30ml for thick koicha.",
      },
      {
        id: "premium",
        heading: "Premium grade — the daily driver.",
        body: "Second-flush tencha, still stone-ground, still whisk-grade but with more astringency and slightly less sweetness. Often what 'ceremonial' matcha sold abroad actually is. Honest if labelled premium; misleading if labelled ceremonial. £20–40 per 30g is the realistic range.",
      },
      {
        id: "culinary",
        heading: "Culinary grade — for baking and lattes.",
        body: "Later-harvest leaves, often machine-ground rather than stone-ground, olive-toned rather than jade. Works perfectly for lattes, ice cream, mochi, and baked goods where milk, sugar, or other ingredients mask astringency. Wrong tool for whisking. Expect £8–15 per 30g.",
      },
      {
        id: "how-to-tell",
        heading: "How to tell which grade you actually bought.",
        body: "Colour first — real ceremonial is bright jade, almost fluorescent. Olive-green or yellow-green is culinary. Second, grind — run a pinch between your fingers. Silky and dissolving = stone-ground. Gritty = machine-ground. Third, aroma — sweet, fresh, almost like new-cut grass. Stale, hay-like, or mushroom = old or poorly stored. Fourth, price. If ceremonial-grade matcha costs under £25 per 30g, it probably isn't.",
      },
    ],
    faq: [
      { q: "Is there a legal definition of ceremonial matcha?", a: "No — not outside Japan. Any brand can use the word. In Japan, the implicit definition is first-flush, shaded tencha, stone-ground on granite at low rpm, bright jade colour, sweet-umami with no bitterness." },
      { q: "What's the difference between usucha and koicha?", a: "Usucha is thin matcha — 2g whisked with 70ml water into a foamy everyday drink. Koicha is thick matcha — 4g kneaded with 30ml water into a concentrated, syrupy brew reserved for ceremonial use and ceremonial-grade matcha only." },
      { q: "Can I use ceremonial matcha for cooking?", a: "You can but it's wasteful — the heat and mix-ins mask everything that makes ceremonial special. Use culinary grade for baking and lattes; save the ceremonial for whisking." },
      { q: "Why is real matcha so expensive?", a: "Twenty-plus days of shading reduces yield by roughly half. De-stemming and de-veining is manual. Stone milling produces 40g per hour per mill. The labour alone justifies a £50+ per 30g price before margin." },
    ],
    relatedTools: [
      { href: "/tools/matcha-grade", label: "Matcha grade decoder tool" },
      { href: "/tools/tea-brewer", label: "Tea brewing calculator" },
    ],
    relatedArticles: [
      { href: "/journal/sencha-regions", label: "Single-origin sencha regions" },
      { href: "/journal/water-temperature", label: "Why water temperature ruins most tea" },
    ],
    published: "2025-03-15",
    readingMinutes: 8,
  },
  {
    slug: "water-temperature",
    title: "Why water temperature ruins most Japanese tea.",
    lede: "Boiling water is not neutral — it actively damages sencha, gyokuro, and matcha. Here's what the right temperature actually does.",
    eyebrow: "Journal · Tea",
    tldr: "Boiling water (100°C) extracts catechins and caffeine in the wrong order, producing a bitter, astringent cup from any Japanese green. Sencha wants 75°C. Gyokuro wants 55°C. Hojicha tolerates 95°C. Matcha needs 75°C to whisk without clumping but not scorch. The Western habit of boiling water for all tea is a hangover from black tea culture where boiling is correct — for green tea it's destructive.",
    stats: [
      { value: "75°C", label: "Ideal sencha temperature" },
      { value: "55°C", label: "Ideal gyokuro temperature" },
      { value: "~45%", label: "Catechin over-extraction at 100°C vs 75°C" },
    ],
    sections: [
      {
        id: "science",
        heading: "The science in one paragraph.",
        body: "Japanese green teas contain theanine (amino acid — sweet, umami), caffeine (bitter), and catechins (astringent). Theanine dissolves readily at low temperatures. Caffeine and catechins require higher temperatures and longer steeps. Boiling water extracts all three at once — so the sweetness is overwhelmed by bitterness and astringency. Lower temperatures extract theanine first, catechins more slowly, caffeine the slowest. The result is a cup where sweetness leads, bitterness supports.",
      },
      {
        id: "how-to-cool",
        heading: "How to cool water without a thermometer.",
        body: "Pour boiling water from the kettle into an empty teapot. Pour from that teapot into your cups. Pour from your cups back into the teapot, then onto the tea. Each transfer drops the temperature roughly 10°C. Two transfers land you at ~80°C. Three transfers, ~70°C. Traditional Japanese tea preparation uses this exact pouring method as a ritualised cooling protocol.",
      },
      {
        id: "cold-brew",
        heading: "Cold-brewed sencha.",
        body: "Refrigerate 3g sencha in 200ml cold water for 2 hours. The result is extraordinarily sweet — almost vegetal-honey — because no catechins extract at cold temperatures. A revelation in summer. Cold-brewed gyokuro (4h, refrigerated) is the ultimate luxury: all theanine, zero bitterness.",
      },
    ],
    faq: [
      { q: "Why does boiling water work for English breakfast but not sencha?", a: "Black tea is fully oxidised — its catechins are already polymerised into theaflavins and thearubigins. Boiling water extracts those flavour compounds without producing raw bitterness. Green tea is unoxidised, so its raw catechins remain available to be over-extracted at high temperatures." },
      { q: "Can I use a kitchen thermometer?", a: "Yes, and it's the most reliable method. Digital instant-read thermometers are sufficient. Target 75°C for sencha, 55°C for gyokuro, 95°C for hojicha." },
      { q: "What about just waiting for the kettle to cool?", a: "Works, but slow and imprecise. A boiled kettle drops about 5°C per minute in a ceramic pot, less in an insulated kettle. Pour-and-transfer is faster and more repeatable." },
    ],
    relatedTools: [
      { href: "/tools/tea-brewer", label: "Tea brewing calculator" },
    ],
    relatedArticles: [
      { href: "/journal/sencha-regions", label: "Single-origin sencha regions" },
      { href: "/journal/matcha-grading", label: "Matcha grading explained" },
    ],
    published: "2025-03-18",
    readingMinutes: 6,
  },
  {
    slug: "miso-aging",
    title: "Miso aging: why the label age matters more than the colour.",
    lede: "Two-year aged barrel miso tastes nothing like two-week quick-fermented miso — even if both are labelled 'red'.",
    eyebrow: "Journal · Fermentation",
    tldr: "Miso's colour comes from both the koji ratio and the aging time. Long-aged miso (1–3 years) develops deep umami through Maillard reactions and slow enzymatic breakdown of proteins into free amino acids. Quick-fermented miso (2–8 weeks) skips all of that. The industry is not required to disclose age, but the best producers do. Sericia's drops always include the barrel number and exact aging months.",
    stats: [
      { value: "3 yrs", label: "Age of premium hatcho miso" },
      { value: "2 wks", label: "Quick-fermented shiro miso minimum" },
      { value: "120+", label: "Free amino acids in long-aged miso" },
    ],
    sections: [
      {
        id: "what-ages",
        heading: "What actually happens during aging.",
        body: "Koji mould (Aspergillus oryzae) secretes enzymes that cleave soy proteins into amino acids — primarily glutamate (the source of umami) and smaller quantities of aspartate, glycine, and others. Simultaneously, sugars from koji rice or barley undergo slow Maillard browning with the amino acids, darkening the paste and generating hundreds of aromatic compounds. Long aging means complete enzymatic breakdown plus extensive Maillard development. Short aging means neither.",
      },
      {
        id: "age-categories",
        heading: "Aging categories explained.",
        body: "Quick-fermented (2 weeks – 2 months): light shiro miso made commercially. Fresh, mild, sweet, low complexity. Medium (3–12 months): awase and many aka miso. Balanced, everyday. Long (1–3 years): hatcho, premium aka. Deep, meaty, complex, almost chocolate-like. Extended (3+ years): specialist barrel miso. Rare and expensive. Sericia's 2024 drop included a 3-year hatcho barrel from Okazaki with a documented provenance chain.",
      },
      {
        id: "storage",
        heading: "Storage and post-opening aging.",
        body: "Refrigerated miso continues to age slowly — flavour deepens over months after opening. Some producers actively recommend a 2-week rest after opening premium miso before using, because the pasteurisation step (if any) slightly flattens the flavour at packaging time. Miso does not spoil in the food-safety sense — high salt, low water activity, and lactic fermentation all protect it — but aroma volatiles do fade eventually. Finish within 6–12 months of opening.",
      },
    ],
    faq: [
      { q: "How can I tell if miso has been aged long?", a: "Look at the label — serious producers disclose the aging period. Colour is a proxy but unreliable (quick-fermented miso can be made darker through caramel). Smell is the best test: long-aged miso smells deep, slightly chocolatey, with clear umami; quick-fermented smells fresh, simple, one-note." },
      { q: "Is long-aged miso 'better' than quick-fermented?", a: "It's more complex, not strictly better. Light shiro miso is perfect for breakfast soup where you want sweetness and clarity. Hatcho is perfect for winter stews where you want depth. Own both." },
      { q: "Does miso go bad?", a: "Not in a dangerous sense. The high salt and active lactic fermentation make it inhospitable to pathogens. But aromatics fade over time. A 5-year-old forgotten miso is safe to eat but flat." },
    ],
    relatedTools: [
      { href: "/tools/miso-finder", label: "Miso type finder" },
      { href: "/tools/shelf-life", label: "Shelf-life checker" },
    ],
    relatedArticles: [
      { href: "/journal/dashi-fundamentals", label: "Dashi fundamentals" },
    ],
    published: "2025-03-22",
    readingMinutes: 7,
  },
  {
    slug: "dashi-fundamentals",
    title: "Dashi fundamentals: kombu, katsuobushi, and why the order matters.",
    lede: "Japanese stock is the foundation of Japanese cooking. Get this right and half your kitchen improves.",
    eyebrow: "Journal · Technique",
    tldr: "Ichiban dashi — the first extraction — uses 10g kombu and 20g katsuobushi per litre of water. Cold-soak kombu 30–60 min, bring to 60–65°C, remove kombu, add katsuobushi off-heat, strain after 60 seconds. The temperature control is critical: boiling kombu turns it slimy; leaving katsuobushi in too long turns the stock bitter.",
    stats: [
      { value: "10g/L", label: "Kombu ratio for ichiban dashi" },
      { value: "60-65°C", label: "Target temperature before kombu removal" },
      { value: "60s", label: "Max katsuobushi steep time" },
    ],
    sections: [
      {
        id: "ingredients",
        heading: "Ingredients — what to buy.",
        body: "Kombu: look for Rausu (Hokkaido) or Ma-kombu for ichiban. Rishiri is excellent but more assertive. Avoid pre-chopped 'dashi kombu' strips — they are lower-grade trimmings. Katsuobushi: honkarebushi (fully mould-cultured, aged 2+ years) is the premium grade; arabushi (unmoulded) is common and fine for daily use. Buy whole blocks and shave, or pre-shaved in nitrogen-flushed packs.",
      },
      {
        id: "method",
        heading: "The method, step by step.",
        body: "1) Wipe kombu lightly with a damp cloth (never wash under running water — the white bloom is umami). 2) Soak kombu in cold water 30–60 minutes. 3) Bring slowly to 60–65°C over 10 minutes. 4) Just before boiling, remove kombu. 5) Add katsuobushi all at once, off heat. 6) Wait 60 seconds — no more. 7) Strain through muslin or fine mesh without pressing (pressing releases bitterness).",
      },
      {
        id: "second-extract",
        heading: "Niban dashi — the second extraction.",
        body: "Don't throw away the used kombu and katsuobushi. Simmer them again in 800ml fresh water for 10 minutes, add a small top-up of fresh katsuobushi (10g), strain. The result is niban dashi — deeper, slightly smoky, perfect for miso soup and simmered dishes where ichiban's delicacy would be wasted.",
      },
    ],
    faq: [
      { q: "Can I use instant dashi granules?", a: "Yes, and most Japanese home cooks do on weekdays. Look for packs with minimal MSG and additives. For weekend cooking and special occasions, make fresh — the difference is obvious." },
      { q: "How long does fresh dashi keep?", a: "Refrigerated, 3 days maximum. Frozen in ice-cube trays, 2 months. Freshness matters — dashi is mostly about volatile aromatics that fade fast." },
      { q: "Vegan dashi — how close to the original?", a: "Kombu-shiitake dashi is legitimate Japanese cuisine in its own right (shojin ryori, Buddhist cooking). It's not a substitute for fish-based dashi — it's a different thing. Cold-brew 10g kombu and 15g dried shiitake in 1 litre water overnight. Deep, complex, no fish." },
    ],
    relatedTools: [
      { href: "/tools/dashi-ratio", label: "Dashi ratio calculator" },
      { href: "/tools/shiitake-rehydrate", label: "Shiitake rehydration guide" },
    ],
    relatedArticles: [
      { href: "/journal/katsuobushi-aging", label: "Katsuobushi: why 2-year aging matters" },
      { href: "/journal/kombu-regions", label: "Kombu regions of Hokkaido" },
    ],
    published: "2025-03-25",
    readingMinutes: 8,
  },
  {
    slug: "kombu-regions",
    title: "Kombu regions of Hokkaido: Rausu, Ma, Rishiri, Hidaka.",
    lede: "Four kelp varieties from four Hokkaido regions — each with a distinct role in Japanese cooking.",
    eyebrow: "Journal · Ingredient",
    tldr: "Rausu kombu: premium, clear-gold dashi, delicate. Ma-kombu: richest umami, classical ichiban dashi ingredient. Rishiri kombu: assertive, fragrant, professional kitchens prefer it for clear soups. Hidaka kombu: tender, edible, everyday use in simmered dishes and pickles. Four different tools, not four grades of the same thing.",
    stats: [
      { value: "4", label: "Classical kombu regions" },
      { value: "3-5 yrs", label: "Minimum aging before premium kombu is sold" },
      { value: "Hokkaido", label: "90%+ of Japan's kombu production" },
    ],
    sections: [
      {
        id: "rausu",
        heading: "Rausu — the premium clear dashi.",
        body: "Harvested off the Shiretoko peninsula in eastern Hokkaido. Yields a clear, amber-gold dashi with exceptionally clean umami. The standard choice for high-end kaiseki restaurants. More expensive than Ma-kombu but the flavour is purer, better suited to light seasonal dishes.",
      },
      {
        id: "ma",
        heading: "Ma-kombu — the classical benchmark.",
        body: "Grown around Hakodate in southern Hokkaido. The original and most classical kombu for Kyoto-style ichiban dashi. Rich, sweet, deeply umami. If you only buy one kombu, Ma-kombu is the one. Aged in humidity-controlled warehouses for 2–3 years before sale; the flavour deepens during this period.",
      },
      {
        id: "rishiri",
        heading: "Rishiri — the professional's choice.",
        body: "From Rishiri Island off Hokkaido's north coast. Assertive, fragrant, slightly salty. Preferred in Kyoto's professional kitchens — its distinct aroma holds up in delicate clear soups (suimono) where Ma-kombu might disappear. For home cooking, it's a stronger flavour than beginners expect.",
      },
      {
        id: "hidaka",
        heading: "Hidaka — the everyday workhorse.",
        body: "From Hidaka on Hokkaido's southern coast. Softer, tender, and actually edible after cooking — good for simmered dishes, pickles, and nishime. Less prized for dashi but the most versatile overall. The kombu you cook and eat, rather than extract and discard.",
      },
    ],
    faq: [
      { q: "Which kombu should I buy first?", a: "Ma-kombu for dashi, Hidaka kombu for cooking and eating. These two cover 90% of home-cooking needs." },
      { q: "Does kombu quality matter more than quantity?", a: "Yes. Doubling the amount of cheap kombu does not produce the flavour of the right amount of good kombu. Quality drives flavour; quantity drives salt." },
      { q: "Why is aged kombu better?", a: "Glutamate concentration increases during aging as enzymes continue to break down proteins. 3-year-aged Ma-kombu has visibly more of the white bloom (monosodium glutamate crystals) on its surface than 1-year." },
    ],
    relatedTools: [
      { href: "/tools/dashi-ratio", label: "Dashi ratio calculator" },
    ],
    relatedArticles: [
      { href: "/journal/dashi-fundamentals", label: "Dashi fundamentals" },
      { href: "/journal/katsuobushi-aging", label: "Katsuobushi aging" },
    ],
    published: "2025-03-28",
    readingMinutes: 6,
  },
  {
    slug: "katsuobushi-aging",
    title: "Katsuobushi: why 2-year aging matters.",
    lede: "The difference between arabushi and honkarebushi is two years of mould culture — and it shows in every sip of dashi.",
    eyebrow: "Journal · Ingredient",
    tldr: "Katsuobushi is dried, smoked, fermented skipjack tuna. Arabushi is the smoked-dried base. Honkarebushi adds 4–6 rounds of mould inoculation and sun-drying over 2+ years — the mould digests residual fats, concentrates umami, and removes fishy oiliness. Arabushi costs a quarter as much and works fine for everyday dashi. Honkarebushi is the special-occasion upgrade.",
    stats: [
      { value: "2+ yrs", label: "Honkarebushi aging minimum" },
      { value: "4-6", label: "Rounds of mould inoculation" },
      { value: "4x", label: "Price multiplier vs. arabushi" },
    ],
    sections: [
      {
        id: "process",
        heading: "How it's made.",
        body: "Skipjack tuna fillets are simmered, deboned, and smoked over oak or cherry wood for 2–3 weeks (arabushi stage). Honkarebushi continues: the hardened blocks are inoculated with Aspergillus glaucus mould, sun-dried, brushed clean, re-inoculated, sun-dried again, repeated 4–6 times over 6–24 months. The end product is rock-hard, nearly black, glassy when shaved.",
      },
      {
        id: "taste",
        heading: "What the aging does to the flavour.",
        body: "Mould consumes residual fats that would otherwise go rancid and contribute fishy notes. Proteins break down further into free amino acids — primarily histidine, which is the precursor to skipjack's characteristic umami. The finished block is leaner, drier, and cleaner-tasting. Dashi made from honkarebushi is markedly less fishy and has a longer, more refined umami tail.",
      },
      {
        id: "shaving",
        heading: "Whole block vs. pre-shaved.",
        body: "Ideally you shave katsuobushi fresh over the pot using a kezuriki (shaving box). The volatile aromatics degrade within hours. Pre-shaved katsuobushi in nitrogen-flushed packs is a practical compromise — still good for 6 months sealed, a week opened. The gap between fresh-shaved and week-old is audible in taste.",
      },
    ],
    faq: [
      { q: "Is the mould safe?", a: "Yes — Aspergillus glaucus used in katsuobushi is a food-safe culture, the same genus family as the koji used in miso and soy sauce. It's regulated by the Japanese government and only specific strains are approved." },
      { q: "Can I make dashi with arabushi?", a: "Absolutely. Most Japanese home cooks do. Arabushi-based dashi is what miso soup is made with on weekdays. Reserve honkarebushi for clear soups, chawanmushi, and ichiban dashi for special meals." },
      { q: "Vegan alternative?", a: "Kombu-shiitake dashi, with double the kombu and a higher proportion of dried shiitake. Not the same thing, but legitimately excellent in its own right." },
    ],
    relatedTools: [
      { href: "/tools/dashi-ratio", label: "Dashi ratio calculator" },
    ],
    relatedArticles: [
      { href: "/journal/dashi-fundamentals", label: "Dashi fundamentals" },
      { href: "/journal/kombu-regions", label: "Kombu regions of Hokkaido" },
    ],
    published: "2025-04-01",
    readingMinutes: 6,
  },
  {
    slug: "shiitake-grades",
    title: "Donko, koshin, and everything between: dried shiitake grades.",
    lede: "Donko dried shiitake costs five times what everyday shiitake costs — here's why, and when it matters.",
    eyebrow: "Journal · Ingredient",
    tldr: "Donko is the top grade — thick-capped, cracked-pattern, slow-grown shiitake harvested in cold weather before the caps open. Koshin is the everyday grade — thin-capped, faster-grown, fully opened. Donko is worth the premium for dashi and featured dishes; koshin is the right choice for soups, stir-fries, and everything where the mushroom is supporting cast.",
    stats: [
      { value: "5x", label: "Price multiplier for top donko" },
      { value: "4°C", label: "Ideal winter growth temperature" },
      { value: "Oita", label: "Prefecture producing 40% of Japan's shiitake" },
    ],
    sections: [
      {
        id: "donko",
        heading: "Donko — the premium grade.",
        body: "Harvested mid-winter when growth is slowest. The cap stays thick, dense, and closed. The surface cracks in a distinctive turtleshell pattern (kōshin donko) or a lighter cracking (chahana donko). Thick caps mean more flesh, more flavour, and more chewy texture after rehydration. Used whole in nimono (simmered dishes) or shaved thin for dashi.",
      },
      {
        id: "koshin",
        heading: "Koshin — the everyday grade.",
        body: "Harvested spring or autumn, faster-grown, thin-capped, fully opened gills. Rehydrates faster, good for soups, stir-fries, and anywhere the mushroom gets diced. Costs a third of donko. Most home cooking uses koshin and the results are excellent — reserve donko for occasions where the mushroom is the point.",
      },
      {
        id: "sourcing",
        heading: "Where the best shiitake comes from.",
        body: "Oita prefecture on Kyushu is Japan's shiitake capital — 40% of national production, with a climate ideal for winter growing on oak logs. Miyazaki, Fukuoka, and Kumamoto also produce significant quantities. Sericia's drops have featured Oita donko from a third-generation producer who hand-inoculates 600 oak logs per season.",
      },
    ],
    faq: [
      { q: "Is donko always better than koshin?", a: "It depends on the dish. For a featured mushroom in nimono or ichiban dashi, donko is worth the premium. For diced mushroom in stir-fry or miso soup, koshin is the right tool." },
      { q: "Fresh or dried — which is better?", a: "Dried, for most Japanese cooking. The drying process concentrates guanylate (the umami compound that synergises with glutamate) by roughly 10×. Fresh shiitake is a different ingredient." },
      { q: "How to store dried shiitake.", a: "Cool, dark, dry, airtight. Vacuum-sealed packs last 3+ years unopened. Once opened, transfer to an airtight jar with a silica pack. Refrigeration is fine but not required." },
    ],
    relatedTools: [
      { href: "/tools/shiitake-rehydrate", label: "Shiitake rehydration guide" },
      { href: "/tools/shelf-life", label: "Shelf-life checker" },
    ],
    relatedArticles: [
      { href: "/journal/vegan-dashi", label: "Vegan dashi that actually tastes like dashi" },
    ],
    published: "2025-04-03",
    readingMinutes: 6,
  },
  {
    slug: "vegan-dashi",
    title: "Vegan dashi that actually tastes like dashi.",
    lede: "Kombu-shiitake dashi is not a fish-dashi substitute — it's a different classical tradition with its own depth.",
    eyebrow: "Journal · Technique",
    tldr: "Shojin ryori (Buddhist temple cuisine) has made vegan dashi for 800 years. The formula: 10g kombu + 15g dried shiitake + 1 litre water, cold-brewed overnight. The result is deep, complex, and legitimately excellent — not an approximation of fish dashi. Two changes vs. the fish version: more shiitake, more kombu, longer extraction. Keep the rehydrated shiitake for simmered dishes.",
    stats: [
      { value: "800 yrs", label: "Shojin ryori tradition of vegan dashi" },
      { value: "8-12h", label: "Cold brew time for full extraction" },
      { value: "10x", label: "Guanylate concentration in dried shiitake vs. fresh" },
    ],
    sections: [
      {
        id: "formula",
        heading: "The formula.",
        body: "Per 1 litre water: 10g Ma-kombu or Rausu kombu, 15g dried shiitake (donko if possible, koshin acceptable). Combine in a glass jar with cold water. Refrigerate 8–12 hours. Strain. Keep the rehydrated shiitake — they go in your next simmered dish.",
      },
      {
        id: "why-it-works",
        heading: "Why this works without fish.",
        body: "Umami is synergistic — glutamate (from kombu) plus guanylate (from dried shiitake) produces roughly 8× the savoury impact of either alone, which is why fish-based dashi uses katsuobushi (high in inosinate, a similar synergising nucleotide). Kombu-shiitake dashi replicates the glutamate-nucleotide synergy with different nucleotide source.",
      },
      {
        id: "variations",
        heading: "Variations for different dishes.",
        body: "For miso soup, use the basic formula. For clear soups, reduce shiitake to 10g so the colour stays lighter. For ramen broth, double everything and add 3 large scallion whites and a piece of ginger. For nimono (simmered dishes), include 5g dried soy-skin (yuba) for extra body.",
      },
    ],
    faq: [
      { q: "Can I use hot water instead of cold?", a: "You can but it's inferior. Cold extraction preserves the enzymes that synergise glutamate with guanylate. Hot water breaks them down and produces a flatter stock." },
      { q: "How does this compare to fish dashi?", a: "Different, not inferior. Less fishiness and smokiness, more sweetness and mushroom depth. Some dishes (miso soup, simmered vegetables) are arguably better with vegan dashi; others (clear fish soup, chawanmushi) benefit from the fish version." },
      { q: "How long does it keep?", a: "Refrigerated, 3 days. Frozen in ice cube trays, 2 months. Use within a week for best flavour." },
    ],
    relatedTools: [
      { href: "/tools/dashi-ratio", label: "Dashi ratio calculator" },
      { href: "/tools/shiitake-rehydrate", label: "Shiitake rehydration guide" },
    ],
    relatedArticles: [
      { href: "/journal/dashi-fundamentals", label: "Dashi fundamentals" },
      { href: "/journal/shiitake-grades", label: "Donko and koshin grades" },
    ],
    published: "2025-04-05",
    readingMinutes: 5,
  },
  {
    slug: "yuzu-kosho-varieties",
    title: "Yuzu kosho: green, red, and the white outlier.",
    lede: "Three colours, three chillies, three finishing techniques. The wrong one ruins the dish.",
    eyebrow: "Journal · Condiment",
    tldr: "Green yuzu kosho uses unripe yuzu peel and green chilli — sharp, bright, floral. Red uses ripe yuzu and red chilli — rounder, deeper, slightly sweet. White uses yuzu pulp with green chilli — milder, creamier, a Kyushu specialist variant. Green is the default for most dishes; red for heavy meats and stews; white for sashimi and delicate fish.",
    stats: [
      { value: "3", label: "Classical colour varieties" },
      { value: "6-12 months", label: "Traditional fermentation time" },
      { value: "Kyushu", label: "Origin region (Oita, Miyazaki, Fukuoka)" },
    ],
    sections: [
      {
        id: "green",
        heading: "Green — the default.",
        body: "Made from unripe yuzu peel and young green chilli, salted and fermented 6 months minimum. Sharp, bright, floral. The most common variety and the one most foreigners meet first. Perfect with chicken, fried tofu, udon, and grilled fish. A small dab transforms.",
      },
      {
        id: "red",
        heading: "Red — the winter variant.",
        body: "Ripe yuzu peel and red chilli. Rounder, deeper, slightly sweet, more complex. Better with fatty meats (pork belly, duck), rich stews, and winter dishes. Less common outside Japan — worth seeking out.",
      },
      {
        id: "white",
        heading: "White — the Kyushu outlier.",
        body: "Yuzu pulp rather than peel, combined with green chilli. Creamier, milder, slightly tart. A specialist Kyushu variant. Pairs with sashimi, delicate fish, and raw oysters where green yuzu kosho would be too assertive.",
      },
    ],
    faq: [
      { q: "How long does yuzu kosho keep?", a: "Refrigerated, 12 months sealed. Once opened, 3 months for peak flavour, 6 months acceptable. Oil separation is normal — stir before use." },
      { q: "Can I make it at home?", a: "Yes. Green version: zest 4 yuzu (or substitute with lemon+lime), mince 2 green chillies, combine with 2 tsp sea salt, refrigerate 24 hours minimum, 1 week for proper flavour." },
      { q: "Which colour should I buy first?", a: "Green. It's the most versatile and what most recipes assume. Add red and white as your collection grows." },
    ],
    relatedTools: [
      { href: "/tools/yuzu-substitute", label: "Yuzu substitute finder" },
      { href: "/tools/shelf-life", label: "Shelf-life checker" },
    ],
    relatedArticles: [
      { href: "/journal/kochi-citrus", label: "The citrus prefectures of Japan" },
    ],
    published: "2025-04-08",
    readingMinutes: 5,
  },
  {
    slug: "kochi-citrus",
    title: "The citrus prefectures of Japan: Kochi, Ehime, Oita.",
    lede: "Yuzu, sudachi, kabosu, dekopon — four unique citrus fruits from three southern prefectures.",
    eyebrow: "Journal · Region",
    tldr: "Kochi (Shikoku) produces 50% of Japan's yuzu and is synonymous with the fruit. Ehime grows mandarin varieties including the acclaimed Dekopon. Oita specialises in kabosu, yuzu's larger, greener cousin. Sudachi, the tiny sour-lime relative, comes from Tokushima. Each citrus has a narrow season and peak window — a month or two per year.",
    stats: [
      { value: "50%", label: "Kochi share of Japan's yuzu output" },
      { value: "4", label: "Distinct citrus species" },
      { value: "Oct-Dec", label: "Yuzu peak season" },
    ],
    sections: [
      {
        id: "yuzu",
        heading: "Yuzu — Kochi's gift.",
        body: "Kochi prefecture on Shikoku island produces half of Japan's yuzu. The fruit is hardy, cold-tolerant, and ripens in late autumn. Peak season is October through December. The tree takes 10 years to produce meaningful fruit, which is part of why yuzu stayed rare outside Japan for so long.",
      },
      {
        id: "sudachi",
        heading: "Sudachi — Tokushima's thumb-sized punch.",
        body: "Sudachi is a smaller, greener, sharper relative of yuzu grown almost exclusively in Tokushima prefecture. Used whole-pressed over grilled fish, matsutake mushrooms, and soba dipping sauce. The season is August–October; the fruit is rarely exported fresh but dried peel and bottled juice are available.",
      },
      {
        id: "kabosu",
        heading: "Kabosu — Oita's counterpart.",
        body: "Kabosu looks like a green lime but has a more floral aroma and sharper acidity. Oita prefecture in Kyushu produces 95%. Used over grilled fish, in ponzu, and as a substitute for yuzu in dishes where yuzu is scarce. Season: September–December.",
      },
      {
        id: "mandarins",
        heading: "Mandarins — Ehime's specialty.",
        body: "Ehime prefecture specialises in mikan (satsuma mandarin) and premium mandarin cultivars including Dekopon — the large, sweet, cold-tolerant hybrid that now grows globally under the Sumo Citrus brand. Dekopon is in season January–March.",
      },
    ],
    faq: [
      { q: "Can I find fresh yuzu outside Japan?", a: "Increasingly yes — California and Spain grow commercial yuzu now. But the Japanese peak-season fruit (Kochi, October–December) remains the reference standard. Expect £80–120 per kilo at a premium grocer when available." },
      { q: "Which citrus substitutes for which?", a: "Sudachi ≈ lime. Kabosu ≈ yuzu (close but less floral). Dekopon ≈ premium mandarin. Yuzu has no direct substitute — the closest is a lemon-lime-grapefruit blend." },
      { q: "Are the bottled juices worth buying?", a: "The best ones yes — look for single-origin, cold-pressed, no preservatives. Treat them as a fresh fruit substitute when the fresh is out of season. Avoid the cheap blended versions." },
    ],
    relatedTools: [
      { href: "/tools/yuzu-substitute", label: "Yuzu substitute finder" },
    ],
    relatedArticles: [
      { href: "/journal/yuzu-kosho-varieties", label: "Yuzu kosho varieties" },
    ],
    published: "2025-04-10",
    readingMinutes: 6,
  },
  {
    slug: "ems-worldwide",
    title: "EMS from Japan: the realistic guide for 23 countries.",
    lede: "Delivery times, customs quirks, declared values, prohibited items — what the Japan Post website doesn't tell you.",
    eyebrow: "Journal · Logistics",
    tldr: "Japan Post EMS reaches 23+ countries with published transit times of 3–6 business days. Real-world averages are longer, especially to the US and EU where customs backlogs add 1–3 days. Declared value over roughly $200 triggers customs duty in most destinations. Food products require HS codes and, in some destinations, ingredient lists in the local language. Sericia handles all of this — this article is for anyone shipping on their own.",
    stats: [
      { value: "23+", label: "EMS destination countries from Japan" },
      { value: "3-6 days", label: "Published transit time" },
      { value: "$200", label: "Approx. de minimis threshold (US)" },
    ],
    sections: [
      {
        id: "transit",
        heading: "Published transit vs. reality.",
        body: "Japan Post publishes transit times of 3–6 business days for most destinations. Reality: add 1–3 days for customs in the US, EU, and Australia. Within Asia (Korea, Taiwan, Hong Kong, Singapore), published times are accurate — 2–4 days door to door. Worst-case outliers: Brazil, India, some Middle East — occasionally 2+ weeks due to customs processing.",
      },
      {
        id: "customs",
        heading: "Customs and duty by destination.",
        body: "US: de minimis of $800 means most personal orders clear duty-free. UK: £135 VAT threshold — items above are charged 20% VAT plus handling. EU: €150 customs threshold, ~20% VAT plus duties. Australia: AUD 1,000 GST threshold. Canada: CAD 20 threshold (lowest in the G7). Asian destinations: varies widely. Singapore duty-free up to SGD 400; Hong Kong generally duty-free on food.",
      },
      {
        id: "food-specific",
        heading: "Food-specific rules.",
        body: "Most destinations accept commercial packaged food with labels and HS codes. US requires FDA prior notice for commercial imports (not personal). EU requires organic certification documentation for organic-labelled products. Australia is the strictest — biosecurity declarations required, some ingredients (e.g., raw meat, some dairy) banned outright. South Korea and Taiwan require Chinese or Korean ingredient lists on retail-packaged food.",
      },
    ],
    faq: [
      { q: "Does Sericia handle customs?", a: "Yes. We ship DDU (duties deliverable unpaid) — you pay customs on receipt if applicable, but we handle declarations, HS codes, and ingredient translations. Most orders under $200 clear without duty." },
      { q: "Can I ship alcohol or fresh food?", a: "Some destinations allow alcohol (e.g., sake) with declarations; many don't, or cap per-shipment volume. Fresh food (unpasteurised, unpacked, raw meat, fresh dairy) is prohibited almost everywhere. Sericia's drops are shelf-stable packaged food only." },
      { q: "What happens if my shipment is held?", a: "Japan Post tracking updates show the hold. Sericia support intervenes on your behalf with translation and documentation. 95% of holds resolve within 48 hours." },
    ],
    relatedTools: [
      { href: "/tools/ems-calculator", label: "EMS shipping calculator" },
    ],
    relatedArticles: [],
    published: "2025-04-12",
    readingMinutes: 7,
  },
];

export function getArticle(slug: string): JournalArticle | null {
  return JOURNAL.find((a) => a.slug === slug) ?? null;
}

export function listArticles(): JournalArticle[] {
  return [...JOURNAL].sort((a, b) => (a.published < b.published ? 1 : -1));
}
