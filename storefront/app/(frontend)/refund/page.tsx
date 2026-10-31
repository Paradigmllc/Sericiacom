import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, PageHero, Button } from "@/components/ui";

export const metadata: Metadata = { title: "Returns & refunds — Pre-launch review", robots: { index: false, follow: false } };
export default async function Page() {
  const ja = (await getLocale()) === "ja";
  return <>
    <SiteHeader />
    <PageHero eyebrow="SERICIA" title={ja ? "返品・返金について" : "Returns & refunds"} />
    <Container size="narrow" className="py-12 sm:py-16 md:py-20 lg:py-24">
      <div role="status" className="border border-sericia-line bg-sericia-paper-card p-6 sm:p-8">
        <h2 className="text-xl mb-5">{ja ? "販売開始に向けて準備中" : "Preparing for launch"}</h2>
        <p className="leading-relaxed">{ja ? "取扱商品の返品対象・申請方法・返金条件は確認中です。このプレビューでは注文を受け付けていません。販売開始前に、適用される条件を掲載します。" : "Return eligibility, request procedures and refund terms are being confirmed for the products we will offer. This preview does not accept orders. The applicable terms will be published before sales open."}</p>
      </div>
      <div className="mt-8"><Button href="/products" variant="outline">{ja ? "コレクションへ" : "Explore the collection"}</Button></div>
    </Container>
    <SiteFooter />
  </>;
}
