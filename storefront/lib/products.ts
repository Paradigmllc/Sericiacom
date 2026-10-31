import type { CategoryKey } from "./catalog-categories";
export { categoryLabel } from "./catalog-categories";
/**
 * Product API — facade over Medusa v2 Store API.
 *
 * This file defines the canonical `Product` type + `categoryLabel` helper,
 * and re-exports the Medusa-backed fetcher implementations from
 * `./products-medusa`.
 *
 * Consumers (app/products/*, app/page.tsx, /api/products/search-index) import
 * from "@/lib/products" — the indirection keeps them source-agnostic.
 *
 * Prior implementation (Supabase `sericia_products` table) was replaced when
 * Medusa v2 came online (M3 / 2026-04-21). History preserved in git.
 */

export type ProductVariant = { id: string; title: string; price: number; currency: string; stock: number };

export type Product = {
  variants: ProductVariant[];
  id: string;
  slug: string;
  name: string;
  description: string;
  story: string;
  price: number;
  currency: string;
  weight_g: number;
  stock: number;
  category: CategoryKey;
  images: string[];
  status: "active" | "draft" | "sold_out";
  origin_region: string | null;
  producer_name: string | null;
  created_at: string;
  updated_at: string;
  // ── F12 enrichment fields (read from Medusa product.metadata) ──────────
  // All optional. Editors fill these via Medusa Admin UI to enrich the PDP
  // accordion (Ingredients, Tasting notes & pairing). Empty / null means
  // the PDP falls back to its branded default copy — no broken sections.
  ingredients: string | null;
  tasting_notes: string | null;
  preparation: string | null;
  allergens: string | null;
  shelf_life: string | null;
};

export {
  listActiveProducts,
  getProductBySlug,
  getProductsByIds,
} from "./products-medusa";
