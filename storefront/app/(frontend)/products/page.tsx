import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container } from "@/components/ui";
import { listActiveProducts, categoryLabel, type Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import FadeIn from "@/components/FadeIn";
import ProductsFilterBar, {
  type CategoryKey,
  type SortKey,
} from "@/components/ProductsFilterBar";
import CategoryHero, { Breadcrumb } from "@/components/CategoryHero";
import { CATEGORY_KEYS } from "@/lib/catalog-categories";
import { RecentlyViewedSection } from "@/components/RecentlyViewed";

/**
 * /products — collection index with URL-synced category filter + sort.
 *
 * Why Server Component as source of truth (T2-I):
 *   • The filter/sort is read from `searchParams` on the server, so the grid
 *     that renders is already correctly filtered before any client JS runs.
 *     That's the shareable, indexable, crawlable contract — a user pasting
 *     /products?category=miso into a tab sees miso-only even with JS disabled.
 *   • The Client Component (ProductsFilterBar) only owns the INPUT surface
 *     (pills + sort select); the server owns the OUTPUT (grid).
 *
 * SEO nuance:
 *   • Canonical always points at /products (no params) — filter variants are
 *     conceptually the same page, ranking signal shouldn't be split across
 *     four category URLs.
 *   • Filter variants still get a distinct <title>, so shared links in Slack /
 *     email preview correctly ("Tea — Rescued Japanese craft").
 *   • noindex on filter/sort combos at-scale is overkill for a 4-category
 *     storefront; default indexability is fine.
 */

const SORT_KEYS: ReadonlyArray<SortKey> = ["featured", "price-asc", "price-desc", "name"];

function parseCategory(raw: string | undefined): CategoryKey | null {
  if (!raw) return null;
  return (CATEGORY_KEYS as ReadonlyArray<string>).includes(raw) ? (raw as CategoryKey) : null;
}

function parseSort(raw: string | undefined): SortKey {
  if (!raw) return "featured";
  return (SORT_KEYS as ReadonlyArray<string>).includes(raw) ? (raw as SortKey) : "featured";
}

function sortProducts(products: Product[], sort: SortKey): Product[] {
  // Returns a new array — never mutates the source. `featured` leaves the
  // upstream (Medusa) ordering intact, which is the curator's intent.
  switch (sort) {
    case "price-asc":
      return [...products].sort((a, b) => a.price - b.price);
    case "price-desc":
      return [...products].sort((a, b) => b.price - a.price);
    case "name":
      return [...products].sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      return products;
  }
}

// ISR: 60-second cache window for the listing. Medusa data is refetched on
// the first request after expiry; subsequent visitors within the window get
// the static-rendered HTML in <50ms instead of triggering a 6s Medusa fetch.
// Removing force-dynamic was the fix for the 502 storms during deploy
// transitions — now the listing is HTML at the edge, not React-rendered.
export const revalidate = 60;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(
  { searchParams }: { searchParams: SearchParams },
): Promise<Metadata> {
  const sp = await searchParams;
  const category = parseCategory(typeof sp.category === "string" ? sp.category : undefined);

  const baseTitle = "Shop — Japanese everyday discoveries";
  const baseDesc =
    "Explore Japanese tea, pantry, tableware, stationery and everyday essentials.";

  if (category) {
    const label = categoryLabel(category);
    return {
      title: `${label} — Japanese everyday discoveries`,
      description: `Explore ${label.toLowerCase()} in the SERICIA collection.`,
      alternates: { canonical: "/products" },
    };
  }

  return {
    title: baseTitle,
    description: baseDesc,
    alternates: { canonical: "/products" },
  };
}

export default async function ProductsIndexPage(
  { searchParams }: { searchParams: SearchParams },
) {
  const sp = await searchParams;
  const category = parseCategory(typeof sp.category === "string" ? sp.category : undefined);
  const sort = parseSort(typeof sp.sort === "string" ? sp.sort : undefined);

  const [all, tListing] = await Promise.all([
    listActiveProducts(),
    getTranslations("products.listing_extras"),
  ]);

  // Build counts off the unfiltered list so pills always show "(N)" of what's
  // actually available, not "(0)" in a category the user just filtered away from.
  const counts = Object.fromEntries(CATEGORY_KEYS.map(key => [key, 0])) as Record<CategoryKey, number>;
  for (const p of all) {
    if (p.category in counts) counts[p.category as CategoryKey]++;
  }

  const filtered = category === null ? all : all.filter((p) => p.category === category);
  const sorted = sortProducts(filtered, sort);

  const withBadges = sorted;
  const heroEyebrow = category ? "Collection" : "The collection";
  const heroTitle = category ? categoryLabel(category) : "Japanese everyday discoveries.";

  const heroTone = category === "tea"
    ? "tea"
    : category === "miso"
      ? "miso"
      : category === "mushroom"
        ? "mushroom"
        : category === "seasoning"
          ? "seasoning"
          : "ink";

  const breadcrumb: Array<{ label: string; url?: string }> = category
    ? [
        { label: "Home", url: "/" },
        { label: "Shop", url: "/products" },
        { label: categoryLabel(category) },
      ]
    : [
        { label: "Home", url: "/" },
        { label: "Shop" },
      ];

  // ItemList JSON-LD — Google rich-result eligibility for collection pages.
  // We list up to 30 visible products so the snippet stays under the
  // recommended ~10KB. Each gets position, name, image, URL.
  const SITE = "https://sericia.com";
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: heroTitle,
    description:
      "Japanese tea, pantry, tableware, stationery and everyday essentials.",
    url: `${SITE}/products${category ? `?category=${category}` : ""}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: withBadges.length,
      itemListElement: withBadges.slice(0, 30).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}/products/${p.slug}`,
        name: p.name,
      })),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumb.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.label,
        item: b.url ? `${SITE}${b.url}` : undefined,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <CategoryHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        tone={heroTone}
      />
      {/* Aesop-style "complimentary sample with order" strip — sits just below
          the hero, just above the breadcrumb. Hairline border, no decoration. */}
      <Container size="wide" className="pt-10 md:pt-14 pb-20 md:pb-28">
        <div className="mb-8 md:mb-12">
          <Breadcrumb items={breadcrumb} />
        </div>
        <ProductsFilterBar
          currentCategory={category}
          currentSort={sort}
          counts={counts}
          totalCount={all.length}
        />

        <div className="mt-10 md:mt-14">
          {withBadges.length === 0 ? (
            <div className="py-16 text-center">
              <p className="label mb-3">{tListing("no_matches")}</p>
              <p className="text-[15px] text-sericia-ink-soft max-w-md mx-auto">
                {tListing("no_matches_hint")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 bg-sericia-line gap-px">
              {withBadges.map((p, i) => (
                <FadeIn key={p.id} delay={(i % 6) * 0.06}>
                  <ProductCard product={p} />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </Container>
      {/* Recently-viewed continue-browsing strip — silent when the visitor has
          no history; populates after their second PDP view. */}
      <RecentlyViewedSection />
      <SiteFooter />
    </>
  );
}
