import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, PageHero, Button } from "@/components/ui";
export const metadata: Metadata = { title: "Terms — Preparing for launch", robots: { index: false, follow: false } };
export default async function TermsPage() {
  const ja = (await getLocale()) === "ja";
  return <><SiteHeader /><PageHero eyebrow="SERICIA" title={ja ? "利用・購入条件" : "Terms and purchase conditions"} />
    <Container size="narrow" className="py-12 sm:py-16 md:py-20 lg:py-24">
      <div role="status" className="border border-sericia-line bg-sericia-paper-card p-6 sm:p-8">
        <h2 className="mb-5 text-xl">{ja ? "購入条件は確認中です" : "Purchase conditions are being confirmed"}</h2>
        <p className="leading-relaxed">{ja ? "このプレビューでは注文・決済を受け付けていません。販売開始前に、販売者情報、販売対象国、価格・通貨、税・送料、発送時期、返品・キャンセル条件を提示します。" : "This preview does not accept orders or payments. Seller information, eligible destinations, prices and currencies, taxes and shipping charges, dispatch times, and return and cancellation conditions will be provided before sales open."}</p>
        <p className="mt-5 leading-relaxed">{ja ? "商品は日本茶に限らず、器・文具・布製品なども対象です。各商品の仕様、素材、食品の原材料・アレルゲン等は商品ごとに確認してください。" : "The collection includes Japanese tea and other products such as tableware, stationery and textiles. Review each listing for its specifications, materials and, for food, ingredients and allergens."}</p>
        <p className="mt-5 leading-relaxed">{ja ? "現在の表示は販売契約の最終条件ではありません。配送・返品の詳細が未確定の間は、購入可能な状態として案内しません。" : "This notice is not a final set of sales terms. Products will not be offered for purchase while delivery and return conditions remain unconfirmed."}</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-4"><Button href="/shipping" variant="outline">{ja ? "配送について" : "Shipping"}</Button><Button href="/refund" variant="outline">{ja ? "返品について" : "Returns"}</Button></div>
    </Container><SiteFooter /></>;
}
