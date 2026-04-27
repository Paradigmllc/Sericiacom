import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, PageHero, Rule, Button } from "@/components/ui";

/**
 * Root not-found.tsx — Aesop-standard 404.
 *
 * Next.js 15 App Router auto-renders this for:
 *   1. Any unmatched route (catch-all)
 *   2. Explicit `notFound()` calls inside Server Components
 * and sets HTTP status = 404 automatically. No manual header work needed.
 *
 * Design grammar (matches /about and /terms exactly so a 404'd visitor
 * still feels they are inside the brand, not dumped onto an error screen):
 *   • SiteHeader unchanged
 *   • PageHero with eyebrow "404" + editorial headline + lede
 *   • Container with wayfinding grid — six curated destinations
 *   • Hairline rule + apologetic-but-elegant contact slab
 *   • SiteFooter unchanged
 *
 * No playful cartoons, no "Oops!" copy, no emoji. Luxury 404 = "this piece
 * is no longer with us" tone, redirecting attention to what IS available.
 */

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "The page you were looking for is no longer with us. Browse the current drop, read the journal, or return to the storefront.",
  robots: { index: false, follow: true },
};

type Destination = {
  href: string;
  label: string;
  blurb: string;
};

const DESTINATIONS: Destination[] = [
  {
    href: "/",
    label: "Storefront",
    blurb: "The current drop and everything in rotation.",
  },
  {
    href: "/products",
    label: "The collection",
    blurb: "Tea, miso, mushrooms and seasonings in stock now.",
  },
  {
    href: "/journal",
    label: "Journal",
    blurb: "Producer notes, tasting cards and travel diaries.",
  },
  {
    href: "/tools",
    label: "Kitchen tools",
    blurb: "Dashi ratios, matcha grades, shiitake rehydration.",
  },
  {
    href: "/guides",
    label: "Country guides",
    blurb: "Shipping, duties and customs by destination.",
  },
  {
    href: "/about",
    label: "About Sericia",
    blurb: "How a drop comes together, and who is behind it.",
  },
];

export default async function NotFound() {
  const t = await getTranslations("pages.not_found");
  return (
    <>
      <SiteHeader />
      <PageHero
        eyebrow="404"
        title={t("title")}
        lede="Drops are finite by design, and links sometimes outlive the pages behind them. Let us point you somewhere that still is."
      />
      <Container size="wide" className="py-20 md:py-28">
        <div className="max-w-5xl">
          <p className="label mb-8">Try one of these</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-sericia-line border border-sericia-line">
            {DESTINATIONS.map((d) => (
              <li key={d.href} className="bg-sericia-paper">
                <Link
                  href={d.href}
                  className="block p-8 md:p-10 group transition-colors hover:bg-sericia-paper-card"
                >
                  <p className="text-[20px] md:text-[22px] font-normal tracking-tight mb-3 group-hover:text-sericia-accent transition-colors">
                    {d.label}
                  </p>
                  <p className="text-[14px] leading-relaxed text-sericia-ink-soft">
                    {d.blurb}
                  </p>
                  <p className="mt-6 text-[11px] tracking-[0.22em] uppercase text-sericia-ink-soft group-hover:text-sericia-accent transition-colors">
                    Continue →
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <Rule className="my-14 md:my-20" />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="max-w-xl">
              <p className="label mb-4">Still lost?</p>
              <h2 className="text-[26px] md:text-[32px] leading-[1.2] font-normal tracking-tight mb-4">
                Write to us — we read every message.
              </h2>
              <p className="text-[15px] text-sericia-ink-soft leading-relaxed">
                Tell us the link or the product you were looking for. If it
                once existed on Sericia, we can usually tell you where it went
                — and if a new drop is coming that would replace it.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button href="mailto:contact@sericia.com" variant="outline">
                contact@sericia.com
              </Button>
              <Button href="/" variant="solid">
                Return home
              </Button>
            </div>
          </div>
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
