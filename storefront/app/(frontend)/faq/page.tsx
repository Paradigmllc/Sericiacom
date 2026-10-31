import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, PageHero, Button } from "@/components/ui";
export const metadata: Metadata = { title: "Frequently asked questions — Pre-launch", robots: { index: false, follow: false } };
export default async function FaqPage() {
  const ja = (await getLocale()) === "ja";
  return <><SiteHeader /><PageHero eyebrow="SERICIA" title={ja ? "よくある質問" : "Frequently asked questions"} />
    <Container size="narrow" className="space-y-8 py-12 sm:py-16 md:py-20 lg:py-24">
      <section><h2 className="mb-3 text-xl">{ja ? "どのような商品を扱いますか？" : "What is the collection about?"}</h2><p className="leading-relaxed">{ja ? "日本茶、器、文具、布製品など、日本の暮らしとものづくりに関わる商品を海外向けに紹介します。販売状況は各商品ページで確認してください。" : "SERICIA introduces Japanese tea, tableware, stationery, textiles and other products connected to everyday life and craftsmanship in Japan. Check each listing for availability."}</p></section>
      <section><h2 className="mb-3 text-xl">{ja ? "今すぐ注文できますか？" : "Can I order now?"}</h2><p role="status" className="leading-relaxed">{ja ? "このプレビューでは注文・決済を受け付けていません。決済、商品情報、配送・返品条件の確認後に販売開始を案内します。" : "This preview does not accept orders or payments. Sales will open after payment, product information, delivery and return arrangements have been confirmed."}</p></section>
      <section><h2 className="mb-3 text-xl">{ja ? "送料と配送日数は？" : "What are the shipping costs and delivery times?"}</h2><p className="leading-relaxed">{ja ? "配送先、配送会社、送料、発送までの日数は確認中です。無料配送や一定日数での発送は現時点では保証していません。" : "Destinations, carriers, rates and dispatch times are being confirmed. Free shipping and a fixed dispatch window are not currently promised."}</p></section>
      <section><h2 className="mb-3 text-xl">{ja ? "食品や返品の条件は？" : "Where can I check product and return information?"}</h2><p className="leading-relaxed">{ja ? "原材料、アレルゲン、賞味期限、素材などは商品ごとに確認してください。返品・キャンセル条件は販売開始前に提示します。未掲載の情報についてはお問い合わせください。" : "Ingredients, allergens, shelf life and materials vary by product. Return and cancellation conditions will be provided before sales open. Contact us about information that is not yet listed."}</p></section>
      <div className="flex flex-wrap gap-4"><Button href="/shipping" variant="outline">{ja ? "配送について" : "Shipping"}</Button><Button href="/contact" variant="outline">{ja ? "問い合わせ" : "Contact"}</Button></div>
    </Container><SiteFooter /></>;
}
