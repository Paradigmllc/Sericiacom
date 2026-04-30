import type { MetadataRoute } from "next";

/**
 * F53: explicit allow-list for AI search bots + standard search engines.
 *
 * Why this matters: Cloudflare's "Managed Content → Block AI Bots" feature,
 * if enabled in the dashboard, REWRITES robots.txt at the edge — your origin
 * Allow rules get silently ignored. Visitors of /robots.txt see CF's
 * generated content-signals block list (ClaudeBot/GPTBot/Google-Extended/
 * CCBot/meta-externalagent all `Disallow: /`).
 *
 * For Sericia that toggle is **catastrophic**: the entire GEO playbook
 * (Perplexity / ChatGPT Browse / Gemini citations / Common Crawl-derived
 * training data) depends on those bots being able to read /uses, /compare,
 * and /guides pSEO surface. Blocking them = Drop #1 invisible to AI search.
 *
 * Operator action required: Cloudflare dashboard → Security → Bots →
 * "Block AI Bots" must be **OFF** for sericia.com. This file documents the
 * intended origin contract; the CF setting must match.
 *
 * Verification (after CF toggle off):
 *   curl -sS https://sericia.com/robots.txt | grep -E "^User-agent: (GPTBot|ClaudeBot|CCBot)" -A1
 *   → should show "Allow: /" or no Disallow line for these agents.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: anyone may crawl public surface; private routes blocked
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/cms/",
          "/account/",
          "/checkout",
          "/pay/",
          "/cart",
          "/thank-you",
          "/auth/",
        ],
      },
      // Explicit allow for AI search bots — Sericia GEO depends on these
      // (Perplexity, ChatGPT, Gemini, Claude). Listed individually so origin
      // intent is unambiguous even if Cloudflare Managed Content is toggled.
      ...["GPTBot", "ClaudeBot", "CCBot", "Google-Extended", "PerplexityBot", "anthropic-ai", "Applebot-Extended"].map(
        (userAgent) => ({
          userAgent,
          allow: "/",
          disallow: ["/api/", "/admin/", "/cms/", "/account/", "/checkout", "/cart", "/thank-you", "/auth/"],
        }),
      ),
    ],
    sitemap: "https://sericia.com/sitemap.xml",
    host: "https://sericia.com",
  };
}
