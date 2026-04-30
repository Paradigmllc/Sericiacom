import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { RichText } from "@payloadcms/richtext-lexical/react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContentSidebar from "@/components/ContentSidebar";
import CategoryHero, { Breadcrumb } from "@/components/CategoryHero";
import { Container, Rule } from "@/components/ui";
import { getFaqSections } from "@/lib/faq";

/**
 * /faq — Frequently asked questions.
 *
 * F57 (2026-04-30): migrated from a hardcoded SECTIONS array to the
 * Payload `faqEntries` collection per the project content rule
 * "全コンテンツはハードコードNG、DB化、PayloadCMSで編集可能に".
 *
 * Editor edits at /cms/admin/collections/faqEntries — adds/removes/edits
 * Q+A pairs, picks section, sets displayOrder. Storefront sees changes
 * on the next request (no deploy needed).
 *
 * Hardcoded fallback (SECTIONS originally lived here, ~250 lines) now
 * lives in lib/faq.ts as `FALLBACK_ENTRIES` — only renders when Payload
 * is unreachable (build-time, cold-start, transient outage).
 *
 * JSON-LD FAQPage schema is emitted from the resolved data so editor
 * additions automatically participate in Google rich-result eligibility
 * and AI search engine citations (Perplexity/ChatGPT).
 */

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Straight answers on drops, EMS shipping, payment methods, food storage, refunds, and how Sericia works. Rescued Japanese craft food, shipped worldwide.",
  alternates: { canonical: "https://sericia.com/faq" },
};

export default async function FaqPage() {
  const [t, locale, sections] = await Promise.all([
    getTranslations("pages.faq"),
    getLocale(),
    // Payload returns localised entries for the active next-intl locale,
    // falling back to English when the editor hasn't filled a translation.
    // On Payload outage the function returns the hardcoded English fallback.
    getFaqSections((await getLocale())),
  ]);

  // Flat FAQPage JSON-LD for Google rich results + Perplexity/ChatGPT citation.
  // mainEntity is built from the resolved (Payload OR fallback) data so editor
  // additions show up in search engine markup automatically.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://sericia.com/faq#faqpage",
    url: "https://sericia.com/faq",
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      "@id": "https://sericia.com/#website",
      name: "Sericia",
      url: "https://sericia.com",
    },
    mainEntity: sections.flatMap((s) =>
      s.items.map((qa) => ({
        "@type": "Question",
        name: qa.question,
        acceptedAnswer: { "@type": "Answer", text: qa.plainAnswer },
      }))
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <CategoryHero eyebrow={t("eyebrow")} title={t("title")} tone="paper" />
      <Container size="wide" className="pt-10 md:pt-14 pb-20 md:pb-28">
        <div className="mb-8">
          <Breadcrumb items={[{ label: "Home", url: "/" }, { label: "FAQ" }]} />
        </div>
        <p className="mb-12 text-[16px] text-sericia-ink-soft max-w-prose leading-relaxed">
          Drops, EMS shipping, payment methods, food storage, and refunds — laid out plainly. If your question isn&apos;t here, write to us.
        </p>
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="flex-1 min-w-0 max-w-[760px]">
            {sections.map((section, idx) => (
              <section
                key={section.id}
                className={idx > 0 ? "mt-16 md:mt-20" : ""}
              >
                <p className="label mb-6">{section.label}</p>
                <dl className="divide-y divide-sericia-line border-y border-sericia-line">
                  {section.items.map((qa) => (
                    <div key={qa.id} className="py-8 md:py-10">
                      <dt className="text-[20px] md:text-[22px] font-normal leading-snug tracking-tight mb-4">
                        {qa.question}
                      </dt>
                      <dd className="text-[15px] md:text-[16px] text-sericia-ink-soft leading-relaxed max-w-prose prose prose-sericia">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <RichText data={qa.answer as any} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}

            <Rule className="my-14" />

            <p className="label mb-4">Still stuck?</p>
            <p className="text-[16px] text-sericia-ink-soft leading-relaxed max-w-prose mb-6">
              Write to{" "}
              <a
                href="mailto:contact@sericia.com"
                className="underline-link"
              >
                contact@sericia.com
              </a>
              . One of us will reply personally — usually same day in
              Tokyo business hours.
            </p>

            <p className="label mb-4">Also on Sericia</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[14px]">
              <li>
                <Link
                  href="/shipping"
                  className="text-sericia-ink-soft hover:text-sericia-ink"
                >
                  Shipping information
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-sericia-ink-soft hover:text-sericia-ink"
                >
                  Refund policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sericia-ink-soft hover:text-sericia-ink"
                >
                  Terms of service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sericia-ink-soft hover:text-sericia-ink"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility"
                  className="text-sericia-ink-soft hover:text-sericia-ink"
                >
                  Accessibility
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap"
                  className="text-sericia-ink-soft hover:text-sericia-ink"
                >
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
          <ContentSidebar />
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
