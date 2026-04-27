import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, PageHero, Rule } from "@/components/ui";
import { COUNTRIES, PRODUCTS } from "@/lib/pseo-matrix";
import { listArticles } from "@/lib/journal";
import { listActiveProducts } from "@/lib/products";

/**
 * /sitemap — human-readable HTML sitemap.
 *
 * Paired with /sitemap.xml (app/sitemap.ts) which Google/Bing crawl.
 * This page is for human visitors and GEO-era AI search engines
 * (Perplexity, ChatGPT Browse) which parse linked navigation more
 * reliably than XML for context discovery.
 *
 * Layout: single-column, sectioned by function (Shop / Drops / Stories /
 * Tools / Guides / Company / Legal). Zero marketing gloss — pure wayfinding.
 *
 * Revalidates every 6h so Medusa product changes propagate without manual
 * redeploys.
 */

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Sitemap",
  description:
    "A complete, human-readable index of every page on Sericia — storefront, drops, journal, tools, country guides, company, and legal.",
  alternates: { canonical: "https://sericia.com/sitemap" },
};

type LinkItem = { href: string; label: string; note?: string };

function Section({ title, links }: { title: string; links: LinkItem[] }) {
  return (
    <section className="mb-14 md:mb-20">
      <p className="label mb-5">{title}</p>
      <ul className="divide-y divide-sericia-line border-y border-sericia-line">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex items-baseline justify-between gap-6 py-4 md:py-5 group"
            >
              <span className="text-[16px] md:text-[17px] group-hover:text-sericia-accent transition-colors">
                {l.label}
              </span>
              {l.note && (
                <span className="text-[11px] tracking-[0.22em] uppercase text-sericia-ink-mute shrink-0">
                  {l.note}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function SitemapPage() {
  // Pull Medusa catalog; fall back to empty list on failure
  let products: { slug: string; name: string }[] = [];
  try {
    const catalog = await listActiveProducts();
    products = catalog.map((p) => ({ slug: p.slug, name: p.name }));
  } catch (e) {
    console.error("[sitemap page] listActiveProducts failed:", e);
  }

  const articles = listArticles();

  const shop: LinkItem[] = [
    { href: "/", label: "Storefront", note: "Home" },
    { href: "/products", label: "The collection", note: "All stock" },
    ...products.map((p) => ({
      href: `/products/${p.slug}`,
      label: p.name,
      note: "Product",
    })),
    { href: "/cart", label: "Cart" },
  ];

  const stories: LinkItem[] = [
    { href: "/journal", label: "Journal — index", note: "All articles" },
    ...articles.map((a) => ({
      href: `/journal/${a.slug}`,
      label: a.title,
      note: `${a.readingMinutes} min`,
    })),
  ];

  const tools: LinkItem[] = [
    { href: "/tools", label: "Tools — index" },
    { href: "/tools/ems-calculator", label: "EMS shipping calculator" },
    { href: "/tools/matcha-grade", label: "Matcha grade decoder" },
    { href: "/tools/miso-finder", label: "Miso type finder" },
    { href: "/tools/shelf-life", label: "Shelf-life checker" },
    { href: "/tools/dashi-ratio", label: "Dashi ratio calculator" },
    { href: "/tools/tea-brewer", label: "Japanese tea brewer" },
    { href: "/tools/shiitake-rehydrate", label: "Shiitake rehydration" },
    { href: "/tools/yuzu-substitute", label: "Yuzu substitute finder" },
  ];

  const guides: LinkItem[] = [
    { href: "/guides", label: "Country guides — index" },
    ...COUNTRIES.flatMap((c) =>
      PRODUCTS.map((p) => ({
        href: `/guides/${c.code}/${p.slug}`,
        label: `${c.name} — ${p.name}`,
        note: c.code.toUpperCase(),
      }))
    ),
  ];

  const company: LinkItem[] = [
    { href: "/about", label: "About Sericia" },
    { href: "/faq", label: "Frequently asked questions" },
    { href: "/accessibility", label: "Accessibility statement" },
    { href: "/sitemap", label: "Sitemap — this page" },
  ];

  const account: LinkItem[] = [
    { href: "/login", label: "Sign in" },
    { href: "/signup", label: "Create account" },
    { href: "/account", label: "Account — overview" },
    { href: "/account/orders", label: "Order history" },
    { href: "/account/addresses", label: "Addresses" },
    { href: "/account/wishlist", label: "Wishlist" },
    { href: "/account/settings", label: "Settings" },
  ];

  const legal: LinkItem[] = [
    { href: "/tokushoho", label: "特定商取引法に基づく表記", note: "JP" },
    { href: "/terms", label: "Terms of service" },
    { href: "/privacy", label: "Privacy policy" },
    { href: "/refund", label: "Refund policy" },
    { href: "/shipping", label: "Shipping information" },
  ];

  return (
    <>
      <SiteHeader />
      <PageHero
        eyebrow="Sitemap"
        title="Everything on Sericia, in one quiet index."
        lede="Every page, every drop, every guide — organised by function and linked in plain text. If you prefer XML, that lives at /sitemap.xml."
      />
      <Container size="wide" className="py-20 md:py-28">
        <div className="max-w-4xl">
          <Section title="Shop" links={shop} />
          <Section title="Journal" links={stories} />
          <Section title="Tools" links={tools} />
          <Section title="Country guides" links={guides} />
          <Section title="Company" links={company} />
          <Section title="Account" links={account} />
          <Section title="Legal" links={legal} />

          <Rule className="my-12" />
          <p className="text-[13px] text-sericia-ink-mute">
            XML sitemap for search engines:{" "}
            <a
              href="/sitemap.xml"
              className="underline-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              /sitemap.xml
            </a>
          </p>
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
