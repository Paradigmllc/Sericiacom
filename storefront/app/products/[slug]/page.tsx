import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, Rule } from "@/components/ui";
import { getProductBySlug, listActiveProducts, categoryLabel } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import FadeIn from "@/components/FadeIn";
import ProductDetailShell from "./ProductDetailShell";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Product not found" };
  return {
    title: `${p.name} — Sericia`,
    description: p.description,
    openGraph: { title: p.name, description: p.description },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const all = await listActiveProducts();

  // Related: same category first (up to 3), then fall back to random siblings if short
  const sameCategory = all.filter((x) => x.id !== p.id && x.category === p.category);
  const others = all.filter((x) => x.id !== p.id && x.category !== p.category);
  const related = [...sameCategory, ...others].slice(0, 3);

  const outOfStock = p.stock <= 0 || p.status === "sold_out";

  return (
    <>
      <SiteHeader />
      <Container size="wide" className="py-16 md:py-24 pb-28 md:pb-24">
        <Link
          href="/products"
          className="text-[12px] tracking-[0.18em] uppercase text-sericia-ink-mute hover:text-sericia-ink transition"
        >
          ← All products
        </Link>

        <ProductDetailShell
          product={{
            id: p.id,
            slug: p.slug,
            name: p.name,
            description: p.description,
            story: p.story,
            price_usd: p.price_usd,
            weight_g: p.weight_g,
            category: p.category,
            images: p.images ?? [],
            origin_region: p.origin_region,
            producer_name: p.producer_name,
            outOfStock,
          }}
          relatedCategoryLabel={categoryLabel(p.category)}
        />

        <Rule className="my-20" />

        <FadeIn>
          <div className="grid md:grid-cols-12 gap-12 md:gap-20">
            <div className="md:col-span-4">
              <p className="label mb-3">The story</p>
              <p className="text-[13px] text-sericia-ink-mute leading-relaxed">
                Every product in our collection is chosen for a reason — meet the people and place behind this one.
              </p>
            </div>
            <div className="md:col-span-8">
              <p className="text-[18px] md:text-[19px] leading-[1.7] text-sericia-ink whitespace-pre-line">
                {p.story}
              </p>
            </div>
          </div>
        </FadeIn>
      </Container>

      {related.length > 0 && (
        <>
          <Rule />
          <Container size="wide" className="py-20 md:py-28">
            <FadeIn>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="label mb-3">Recommended pairings</p>
                  <h2 className="text-[26px] md:text-[32px] font-normal leading-tight">
                    You may also like
                  </h2>
                </div>
                <Link
                  href="/products"
                  className="hidden md:inline text-[12px] tracking-[0.18em] uppercase text-sericia-ink-mute hover:text-sericia-ink transition"
                >
                  Explore all →
                </Link>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 bg-sericia-line gap-px">
              {related.map((r, i) => (
                <FadeIn key={r.id} delay={0.08 * i}>
                  <ProductCard product={r} />
                </FadeIn>
              ))}
            </div>
          </Container>
        </>
      )}

      <SiteFooter />
    </>
  );
}
