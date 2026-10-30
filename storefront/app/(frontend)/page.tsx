import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, Eyebrow, Button, SectionHeading } from "@/components/ui";
import FadeIn from "@/components/FadeIn";
import { listActiveProducts, type Product } from "@/lib/products";
import { CATEGORY_KEYS, categoryLabel } from "@/lib/catalog-categories";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "SERICIA — Japanese everyday discoveries",
  description: "Discover Japanese tea, pantry, tableware, stationery and objects for everyday living.",
};

export default async function Home() {
  const ja = (await getLocale()) === "ja";
  let products: Product[] = [];
  let unavailable = false;
  try { products = await listActiveProducts(); }
  catch (error) {
    console.error("[home] catalog unavailable", error instanceof Error ? error.name : "UnknownError");
    unavailable = true;
  }
  const categories = CATEGORY_KEYS.filter(key => products.some(product => product.category === key));
  return (
    <>
      <SiteHeader />
      <section className="border-b border-sericia-line bg-sericia-paper-deep">
        <Container size="wide" className="py-20 sm:py-24 md:py-32 lg:py-40">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16 items-end">
            <FadeIn className="md:col-span-8">
              <Eyebrow>From Japan, for everyday life</Eyebrow>
              <h1 className="text-[44px] sm:text-[60px] md:text-[80px] lg:text-[96px] leading-[1.04] tracking-tight font-normal max-w-4xl">
                {ja ? "日本のいいものを、日々の暮らしへ。" : "A little Japan. An everyday discovery."}
              </h1>
              <p className="mt-8 text-base sm:text-lg leading-relaxed text-sericia-ink-soft max-w-xl">
                {ja ? "一杯のお茶から、食卓の器、手元の文具まで。日本で出会う品々を、世界の暮らしへ届けるセレクトストア。" : "From a quiet cup of tea to the objects on your table. Discover Japanese flavors, thoughtful tools and small pleasures worth making room for."}
              </p>
              <div className="mt-10"><Button href="/products" size="large">{ja ? "コレクションを見る" : "Explore the collection"}</Button></div>
            </FadeIn>
            <div className="md:col-span-4 border-t border-sericia-ink/20 pt-6">
              <p className="label mb-5">Tea · Pantry · Objects · Everyday</p>
              <p className="text-sm leading-loose text-sericia-ink-soft">{ja ? "お茶だけではない、日本の発見。素材や使い方を知り、自分の暮らしに合う一品を。" : "A place to explore beyond tea. Learn what something is, how to use it, and where it belongs in your day."}</p>
            </div>
          </div>
        </Container>
      </section>
      <section id="collection" className="border-b border-sericia-line">
        <Container size="wide" className="py-16 sm:py-20 md:py-28">
          <SectionHeading eyebrow={ja ? "コレクション" : "The collection"} title={ja ? "気になる一品から。" : "Find your next everyday favorite."} />
          {unavailable ? (
            <div role="alert" className="border border-sericia-line p-8 sm:p-12">
              <p className="mb-5">{ja ? "商品情報を取得できませんでした。時間をおいて再度お試しください。" : "The collection could not be loaded. Please try again shortly."}</p>
              {/* Full navigation retries a failed server fetch instead of reusing the router cache. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="underline underline-offset-4">{ja ? "再読み込み" : "Try again"}</a>
            </div>
          ) : products.length === 0 ? (
            <div className="border border-sericia-line p-8 sm:p-12 max-w-3xl">
              <h2 className="text-2xl mb-4">{ja ? "ただいま、コレクションを準備しています。" : "Our collection is taking shape."}</h2>
              <p className="text-sericia-ink-soft leading-relaxed">{ja ? "商品と配送条件の確認を進めています。販売可能になった商品から、こちらに掲載します。" : "We are preparing product details and delivery arrangements. Products will appear here when they are ready to be offered."}</p>
            </div>
          ) : (
            <>
              <nav aria-label={ja ? "商品カテゴリ" : "Product categories"} className="flex flex-wrap gap-3 mb-10">
                {categories.map(category => <Link key={category} href={`/products?category=${category}`} className="border border-sericia-line px-5 py-3 text-sm hover:border-sericia-ink">{categoryLabel(category)} <span aria-hidden="true">↗</span></Link>)}
              </nav>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-sericia-line">
                {products.slice(0, 6).map(product => <ProductCard key={product.id} product={product} />)}
              </div>
              <div className="mt-10"><Button href="/products" variant="outline">{ja ? "すべての商品" : "View all products"}</Button></div>
            </>
          )}
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
