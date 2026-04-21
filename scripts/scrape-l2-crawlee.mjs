#!/usr/bin/env node
/**
 * L2 Scraper: Crawlee + Playwright for JS-rendered Japanese surplus food marketplaces.
 * Targets: KURADASHI, Otameshi, Rakuten, 47CLUB, JapanCraftList.
 * Run on n8n schedule (daily 06:00 JST).
 */
import { PlaywrightCrawler, Dataset } from "crawlee";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TARGETS = [
  {
    source: "kuradashi",
    startUrl: "https://www.kuradashi.jp/categories/food",
    itemSelector: ".product-card",
    titleSelector: ".product-card__title",
    priceSelector: ".product-card__price",
    linkSelector: "a",
  },
  {
    source: "otameshi",
    startUrl: "https://otameshi.roose.jp/products?category=food",
    itemSelector: "[data-product]",
    titleSelector: "h3",
    priceSelector: ".price",
    linkSelector: "a",
  },
];

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: 200,
  requestHandler: async ({ page, request }) => {
    const cfg = request.userData.cfg;
    await page.waitForSelector(cfg.itemSelector, { timeout: 15000 }).catch(() => {});
    const items = await page.$$eval(
      cfg.itemSelector,
      (els, sel) =>
        els.map((e) => ({
          title: e.querySelector(sel.titleSelector)?.textContent?.trim(),
          priceText: e.querySelector(sel.priceSelector)?.textContent?.trim(),
          url: e.querySelector(sel.linkSelector)?.href,
        })),
      cfg
    );
    for (const it of items) {
      if (!it.title || !it.url) continue;
      const price = Number(it.priceText?.replace(/[^0-9]/g, "")) || null;
      await supabase.from("sericia_candidates").upsert(
        {
          source: cfg.source,
          external_url: it.url,
          title: it.title,
          price_jpy: price,
          scraped_at: new Date().toISOString(),
        },
        { onConflict: "external_url" }
      );
    }
    console.log(`[${cfg.source}] ingested ${items.length} items`);
  },
  launchContext: {
    launchOptions: { headless: true },
  },
});

await crawler.addRequests(
  TARGETS.map((t) => ({ url: t.startUrl, userData: { cfg: t } }))
);
await crawler.run();
