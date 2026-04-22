# Sericia product placeholder SVGs

Brand-consistent fallbacks shown on product cards until real photography lands.
All four follow the same visual grammar so a product grid without photos still
reads as one curated collection rather than four grey boxes.

> **⚠️ Project rule — no kanji (CJK Unified Ideographs) in any brand asset.**
> This applies to logos, favicons, OG cards, product placeholders, and every
> SVG / PNG under `/public`. Use letterspaced Latin caps + italic serif in the
> Aesop / Le Labo / Lafco tradition instead. Enforcement: a grep for
> `[\u4e00-\u9fff]` under `storefront/public/` must return zero matches.

## Visual grammar

- **Canvas**: 1200×1200 (square — matches PDP card aspect)
- **Background**: `#faf6ee` (sericia-paper-card token); `#ebe4d4` for the
  Drop-001 bundle card so it reads one tier above single-product cards
- **Silk-fibre strokes**: same motif used in `LuxuryLoader.tsx`, ties together
  the page-open animation and the product card visually
- **Double hairline frame**: `#21231d` at 60 / 72 inset — luxury "stamp" feel
- **Top wordmark**: `SERICIA` letter-spaced 14, 300 weight
- **Eyebrow**: `QUIETLY, FROM JAPAN` (or `DROP NO. 01` on the bundle card)
- **Dominant center motif**: italic serif `Sericia` at 220pt
  (Cormorant Garamond / Didot stack). Pure typography — zero kanji, zero
  glyph-based Japanese ornament. The Japanese-ness is carried by the paper
  tone and silk-fibre strokes, not by letterforms.
- **Italic tagline**: `Craft food, rescued.` (or `Curated bundle · 303 units`
  on the bundle card)
- **Footer**: `RESCUED JAPANESE CRAFT FOOD` in letter-spaced caps

## Files

| File | Handle | Variant |
|------|--------|---------|
| `sencha.svg` | `product-sencha` | Common placeholder |
| `miso.svg` | `product-miso` | Common placeholder |
| `shiitake.svg` | `product-shiitake` | Common placeholder |
| `drop-001.svg` | `drop-001-tea-miso-shiitake` | Bundle variant (deeper paper, DROP NO. 01 eyebrow) |

`sencha.svg` / `miso.svg` / `shiitake.svg` intentionally serve **byte-identical
content** — the grid reads as one confident brand card across products. Only
the bundle card differentiates, because a bundle needs visual hierarchy to
justify its higher price point.

## Replacement workflow

When real brand photography arrives, edit `scripts/product-thumbnails.json`
to point each handle at the new URL and re-run
`npm run products:upload-thumbnails`. The SVGs stay on `/public` as fallback
for any product added in future that ships before photography.
