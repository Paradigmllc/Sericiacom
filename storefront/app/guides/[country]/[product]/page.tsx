import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { supabase, type PseoArticle } from "@/lib/supabase";
import { COUNTRIES, PRODUCTS } from "@/lib/pseo-matrix";

export const revalidate = 86400; // 24h ISR
export const dynamicParams = true;

type Params = { country: string; product: string };

export async function generateStaticParams() {
  return COUNTRIES.flatMap((c) =>
    PRODUCTS.map((p) => ({ country: c.code, product: p.slug }))
  );
}

async function getArticle(country: string, product: string): Promise<PseoArticle | null> {
  const { data, error } = await supabase
    .from("sericia_pseo")
    .select("*")
    .eq("country_code", country)
    .eq("product_slug", product)
    .maybeSingle();
  if (error) {
    console.error("[pseo] supabase error", error);
    return null;
  }
  return data as PseoArticle | null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, product } = await params;
  const article = await getArticle(country, product);
  if (!article) return { title: "Not found — Sericia" };
  const canonical = `https://sericia.com/guides/${country}/${product}`;
  return {
    title: article.title,
    description: article.meta_description,
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description: article.meta_description,
      url: canonical,
      type: "article",
    },
  };
}

function mdToHtml(md: string): string {
  // Minimal paragraph splitter — content is plain prose from DeepSeek, no complex MD
  return md
    .split(/\n{2,}/)
    .map((p) => `<p>${p.trim().replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { country, product } = await params;
  const article = await getArticle(country, product);
  if (!article) notFound();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 font-serif text-sericia-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <nav className="mb-8 text-sm text-sericia-ink/60">
        <Link href="/" className="hover:underline">Sericia</Link>
        <span className="mx-2">/</span>
        <Link href="/guides" className="hover:underline">Guides</Link>
        <span className="mx-2">/</span>
        <span>{article.country_name}</span>
        <span className="mx-2">/</span>
        <span>{article.product_name}</span>
      </nav>

      <h1 className="mb-6 text-4xl font-bold leading-tight">{article.title}</h1>
      <p className="mb-10 text-lg text-sericia-ink/80">{article.meta_description}</p>

      <section className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: mdToHtml(article.intro_md) }} />

      <h2 className="mt-12 mb-4 text-2xl font-semibold">Why Japanese {article.product_name}?</h2>
      <section className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: mdToHtml(article.why_japanese_md) }} />

      <h2 className="mt-12 mb-4 text-2xl font-semibold">Shipping to {article.country_name}</h2>
      <section className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: mdToHtml(article.shipping_info_md) }} />

      <h2 className="mt-12 mb-6 text-2xl font-semibold">Frequently Asked Questions</h2>
      <div className="space-y-6">
        {article.faq.map((f, i) => (
          <details key={i} className="rounded-lg border border-sericia-ink/10 bg-sericia-paper p-4">
            <summary className="cursor-pointer font-semibold">{f.q}</summary>
            <p className="mt-3 text-sericia-ink/80">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-16 rounded-lg bg-sericia-accent/10 p-6 text-center">
        <p className="mb-4 text-lg">Next drop arrives every 2 weeks — limited quantities, one-time releases.</p>
        {article.related_drop_handle ? (
          <Link href={`/drops/${article.related_drop_handle}`} className="inline-block rounded bg-sericia-accent px-6 py-3 text-white hover:bg-sericia-accent/90">
            See Current Drop →
          </Link>
        ) : (
          <Link href="/" className="inline-block rounded bg-sericia-accent px-6 py-3 text-white hover:bg-sericia-accent/90">
            See Current Drop →
          </Link>
        )}
      </div>
    </main>
  );
}
