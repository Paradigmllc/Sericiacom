import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, PageHero, Button } from "@/components/ui";
export const metadata: Metadata = { title: "Order verification", robots: { index: false, follow: false } };
export default async function ThankYouPage() {
  const ja = (await getLocale()) === "ja";
  return <><SiteHeader /><PageHero eyebrow="SERICIA" title={ja ? "注文は確認されていません" : "No order has been verified"} />
    <Container size="narrow" className="py-12 sm:py-16 md:py-20 lg:py-24">
      <p role="status" className="border border-sericia-line bg-sericia-paper-card p-6 leading-relaxed sm:p-8">{ja ? "このページを開くだけでは、注文・支払い・発送は確定しません。このプレビューでは決済を受け付けていません。既存の注文については、注文時の確認メールをご用意のうえお問い合わせください。" : "Opening this page does not confirm an order, payment or shipment. This preview does not accept payments. For an existing order, contact us with the confirmation you received when ordering."}</p>
      <div className="mt-8 flex flex-wrap gap-4"><Button href="/products" variant="outline">{ja ? "コレクションへ" : "Explore the collection"}</Button><Button href="/contact" variant="outline">{ja ? "問い合わせ" : "Contact"}</Button></div>
    </Container><SiteFooter /></>;
}
