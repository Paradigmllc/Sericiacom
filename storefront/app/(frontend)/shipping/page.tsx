import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, PageHero, Button } from "@/components/ui";

export const metadata: Metadata = { title: "Shipping — Pre-launch review", robots: { index: false, follow: false } };
export default async function Page() {
  const ja = (await getLocale()) === "ja";
  return <>
    <SiteHeader />
    <PageHero eyebrow="SERICIA" title={ja ? "配送について" : "Shipping"} />
    <Container size="narrow" className="py-12 sm:py-16 md:py-20 lg:py-24">
      <div role="status" className="border border-sericia-line bg-sericia-paper-card p-6 sm:p-8">
        <h2 className="text-xl mb-5">{ja ? "販売開始に向けて準備中" : "Preparing for launch"}</h2>
        <p className="leading-relaxed">{ja ? "配送先の国・配送会社・送料・発送までの日数は確認中です。このプレビューでは注文を受け付けていません。販売開始時には、購入前に利用可能な配送条件を表示します。" : "Delivery destinations, carriers, shipping rates and dispatch times are being confirmed. This preview does not accept orders. Available options will be shown before purchase once sales open."}</p>
      </div>
      <div className="mt-8"><Button href="/products" variant="outline">{ja ? "コレクションへ" : "Explore the collection"}</Button></div>
    </Container>
    <SiteFooter />
  </>;
}
