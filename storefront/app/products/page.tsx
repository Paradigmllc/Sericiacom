import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, PageHero } from "@/components/ui";
import { listActiveProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Shop — Rescued Japanese craft",
  description:
    "Small-batch tea, miso, mushrooms and seasonings rescued from Japan's finest producers. Ships EMS worldwide from Kyoto.",
};

export const dynamic = "force-dynamic";

export default async function ProductsIndexPage() {
  const products = await listActiveProducts();

  return (
    <>
      <SiteHeader />
      <PageHero
        eyebrow="The collection"
        title="Rescued Japanese craft, shipped from Kyoto."
        lede="Single-origin tea, barrel-aged miso, sun-dried mushrooms and small-batch seasonings — limited stock, honest stories, EMS worldwide."
      />
      <Container size="wide" className="py-20 md:py-28">
        {products.length === 0 ? (
          <p className="text-sericia-ink-soft">No products available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 bg-sericia-line gap-px">
            {products.map((p, i) => (
              <FadeIn key={p.id} delay={(i % 6) * 0.06}>
                <ProductCard product={p} />
              </FadeIn>
            ))}
          </div>
        )}
      </Container>
      <SiteFooter />
    </>
  );
}
