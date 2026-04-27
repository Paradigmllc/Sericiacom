"use client";

/**
 * ToolPageShell — wraps a /tools/* calculator with Aesop "Library"-grade
 * editorial chrome: cinematic hero, breadcrumb, ArticleBlocks before and
 * after the interactive widget, and a related-links footer.
 *
 * Why a shell instead of a 1:1 refactor: every tool page has a useState
 * calculator, so they're all already client components. Sharing the shell
 * keeps the editorial rhythm consistent across the eight tools without
 * forcing each tool to repeat 200 lines of layout boilerplate.
 *
 * Usage:
 *   <ToolPageShell slug="tea-brewer">
 *     <YourCalculator />
 *   </ToolPageShell>
 */

import Link from "next/link";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { Container } from "./ui";
import CategoryHero, { Breadcrumb } from "./CategoryHero";
import ArticleBlocks from "./ArticleBlocks";
import SamplerBanner from "./SamplerBanner";
import { TOOLS_CONTENT, type ToolSlug } from "@/lib/tools-content";

export default function ToolPageShell({
  slug,
  children,
}: {
  slug: ToolSlug;
  children: React.ReactNode;
}) {
  const content = TOOLS_CONTENT[slug];
  if (!content) {
    // Defensive: keeps the page rendering instead of throwing if a slug ever
    // mismatches the content map. Build-time the union narrows; runtime safety
    // matters when content edits race the tool page.
    return (
      <>
        <SiteHeader />
        <Container size="default" className="py-20 md:py-28">
          <p className="text-sericia-ink-soft">Tool content missing.</p>
        </Container>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <CategoryHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        tone={content.hero.tone}
      />
      <Container size="default" className="pt-10 md:pt-14">
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: "Home", url: "/" },
              { label: "Tools", url: "/tools" },
              { label: content.breadcrumbLabel },
            ]}
          />
        </div>

        {/* Intro context — 2-4 ArticleBlocks setting up the why before the
            calculator surface. */}
        <ArticleBlocks blocks={content.introBlocks} />
      </Container>

      {/* Calculator slot — children are the existing stateful widget. We give
          it its own paper-card section so the editorial blocks above and below
          read as a wrapping library entry. */}
      <section className="border-y border-sericia-line bg-sericia-paper-card">
        <Container size="default" className="py-16 md:py-24">
          {children}
        </Container>
      </section>

      <Container size="default" className="py-16 md:py-24">
        {/* Deeper context — table, callout, technique, CTA card. */}
        <ArticleBlocks blocks={content.afterBlocks} />

        {content.related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-sericia-line">
            <p className="label mb-6">Continue reading</p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.related.map((r, i) => (
                <li key={i}>
                  <Link
                    href={r.url}
                    data-cursor="link"
                    className="block py-4 border-b border-sericia-line text-[14px] text-sericia-ink hover:text-sericia-accent transition-colors"
                  >
                    {r.label}
                    <span aria-hidden className="ml-2 text-sericia-ink-mute">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>

      <SamplerBanner variant="compact" />
      <SiteFooter />
    </>
  );
}
