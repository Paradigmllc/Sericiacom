#!/usr/bin/env python3
"""
L3 Scraper: Crawl4AI + LLM extraction for unknown/long-tail Japanese surplus EC sites.
Falls back to AI when no selector rules exist. Uses DeepSeek for cost ($0.014/1M cached).
Run on n8n schedule (weekly, Sunday 04:00 JST) for discovery.
"""
import asyncio
import os
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.extraction_strategy import LLMExtractionStrategy
from pydantic import BaseModel
from supabase import create_client

supabase = create_client(os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])

class Product(BaseModel):
    title: str
    price_jpy: int | None
    expiry_date: str | None
    url: str | None

# Long-tail discovery sites — no selector rules, pure AI extraction
DISCOVERY_URLS = [
    "https://www.47club.jp/category/food/",
    "https://shokuhin-loss.jp/shop/",
    "https://www.rakuten.co.jp/category/503175/",
    "https://furusato-lovers.jp/waketen/",
]

async def main():
    llm_strategy = LLMExtractionStrategy(
        provider="deepseek/deepseek-chat",
        api_token=os.environ["DEEPSEEK_API_KEY"],
        schema=Product.model_json_schema(),
        extraction_type="schema",
        instruction=(
            "Extract all surplus / near-expiry / 訳あり / 食品ロス Japanese craft food products. "
            "Only extract items where price < 3000 JPY and shelf-life info is visible."
        ),
    )
    cfg = CrawlerRunConfig(extraction_strategy=llm_strategy, cache_mode="bypass")

    async with AsyncWebCrawler(verbose=True) as crawler:
        for url in DISCOVERY_URLS:
            result = await crawler.arun(url=url, config=cfg)
            if not result.success:
                print(f"[l3] failed {url}: {result.error_message}")
                continue
            try:
                import json
                items = json.loads(result.extracted_content or "[]")
            except Exception as e:
                print(f"[l3] parse error {url}: {e}")
                continue
            for it in items:
                if not it.get("title") or not it.get("url"):
                    continue
                supabase.table("sericia_candidates").upsert(
                    {
                        "source": f"l3:{url.split('/')[2]}",
                        "external_url": it["url"],
                        "title": it["title"],
                        "price_jpy": it.get("price_jpy"),
                        "expiry_date": it.get("expiry_date"),
                        "scraped_at": "now()",
                    },
                    on_conflict="external_url",
                ).execute()
            print(f"[l3] {url} → {len(items)} items")

if __name__ == "__main__":
    asyncio.run(main())
