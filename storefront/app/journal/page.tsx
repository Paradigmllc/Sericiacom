import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { Container, PageHero } from "../../components/ui";
import { listArticles } from "@/lib/journal";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Journal — Japanese Craft Food Writing | Sericia",
  description:
    "Long-form writing on Japanese craft food: sencha regions, matcha grading, miso aging, dashi technique, kombu and katsuobushi, yuzu, shiitake, and EMS shipping.",
  alternates: { canonical: "https://sericia.com/journal" },
  openGraph: {
    title: "Sericia Journal",
    description: "Long-form writing on Japanese craft food.",
    url: "https://sericia.com/journal",
    type: "website",
  },
};

export default function JournalIndex() {
  const articles = listArticles();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Sericia Journal",
    url: "https://sericia.com/journal",
    publisher: {
      "@type": "Organization",
      name: "Sericia",
      url: "https://sericia.com",
    },
    blogPost: articles.map((a) => ({
      "@type": "BlogPosting",
      headline: a.title,
      url: `https://sericia.com/journal/${a.slug}`,
      datePublished: a.published,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <PageHero
        eyebrow="Journal"
        title="Writing on Japanese craft food."
        lede="The notes we wrote for ourselves before the shop opened. Single-origin sencha, matcha grades, miso aging, dashi technique. Slow reading, worth the time."
      />
      <Container size="wide" className="py-20 md:py-28">
        <ul className="divide-y divide-sericia-line border-y border-sericia-line">
          {articles.map((a, i) => (
            <li key={a.slug}>
              <Link
                href={`/journal/${a.slug}`}
                className="block py-10 md:py-12 hover:bg-sericia-paper-card transition-colors -mx-6 md:-mx-12 px-6 md:px-12 group"
              >
                <div className="flex items-baseline gap-6 md:gap-10 mb-4 text-[12px] tracking-[0.18em] uppercase text-sericia-ink-mute">
                  <span className="tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{a.eyebrow}</span>
                  <span className="ml-auto hidden md:inline tabular-nums">
                    {new Date(a.published).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="text-[26px] md:text-[34px] font-normal leading-tight tracking-tight mb-3 group-hover:text-sericia-accent transition-colors max-w-3xl">
                  {a.title}
                </h2>
                <p className="text-[15px] md:text-[16px] text-sericia-ink-soft leading-relaxed max-w-prose">
                  {a.lede}
                </p>
                <p className="mt-5 text-[12px] tracking-wider uppercase text-sericia-ink-mute">
                  {a.readingMinutes} min read · Read article →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
      <SiteFooter />
    </>
  );
}
