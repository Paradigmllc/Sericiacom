import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, PageHero, Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "About SERICIA",
  description: "A place to discover Japanese tea, pantry, objects and everyday essentials.",
};
export default async function AboutPage() {
  const ja = (await getLocale()) === "ja";
  return <>
    <SiteHeader />
    <PageHero eyebrow="About SERICIA" title={ja ? "日本の発見を、世界の日常へ。" : "Japanese discoveries. Everyday possibilities."} />
    <Container size="narrow" className="py-12 sm:py-16 md:py-20 lg:py-24 space-y-10">
      <p className="text-lg leading-loose">{ja ? "SERICIAは、日本の製品を海外の暮らしへつなぐセレクトストアです。お茶や食品だけでなく、器、生活用品、文具など、日々に取り入れたくなる一品との出会いを目指しています。" : "SERICIA is a store for discovering Japanese products beyond borders. Tea and pantry staples are part of the story, alongside tableware, home objects and stationery for everyday life."}</p>
      <div className="border-t border-sericia-line pt-10">
        <h2 className="text-2xl mb-5">{ja ? "選ぶ時間も、使う時間も。" : "Made for discovery, chosen for your day."}</h2>
        <p className="text-sericia-ink-soft leading-loose">{ja ? "どんな素材で、どう使うのか。商品ごとの情報を確かめながら、自分の暮らしや贈る相手に合うものを見つけられる場所をつくります。" : "What is it made from? How is it used? We are building a place where product details help you find something that fits your life, or a gift that feels personal."}</p>
      </div>
      <p className="border border-sericia-line p-6 leading-relaxed">{ja ? "現在は販売開始に向けた準備中です。取扱商品と配送条件が整ったものから掲載します。" : "We are currently preparing for launch. Products and delivery arrangements are being confirmed before sales open."}</p>
      <Button href="/products">{ja ? "コレクションを見る" : "Explore the collection"}</Button>
    </Container>
    <SiteFooter />
  </>;
}
