import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, PageHero, Button } from "@/components/ui";
export const metadata: Metadata = { title: "Privacy — Pre-launch information", robots: { index: false, follow: false } };
export default async function PrivacyPage() {
  const ja = (await getLocale()) === "ja";
  return <><SiteHeader /><PageHero eyebrow="SERICIA" title={ja ? "個人情報について" : "Privacy information"} />
    <Container size="narrow" className="py-12 sm:py-16 md:py-20 lg:py-24">
      <div role="status" className="border border-sericia-line bg-sericia-paper-card p-6 sm:p-8">
        <h2 className="mb-5 text-xl">{ja ? "販売開始前の確認事項" : "Pre-launch information"}</h2>
        <p className="leading-relaxed">{ja ? "このプレビューでは注文・決済を受け付けていません。決済情報や本人確認書類を問い合わせフォームへ送信しないでください。" : "This preview does not accept orders or payments. Do not send payment details or identity documents through the contact form."}</p>
        <p className="mt-5 leading-relaxed">{ja ? "カートや言語設定などを保持するため、ブラウザのCookie・ローカルストレージを使用します。問い合わせフォームに入力した情報は、問い合わせ対応のために送信されます。" : "Cookies and local browser storage support features such as your cart and language settings. Information you enter in the contact form is submitted to handle your enquiry."}</p>
        <p className="mt-5 leading-relaxed">{ja ? "販売時のデータ取扱いについては、利用目的、委託先、保存期間、国外での処理、開示・訂正・削除等の問い合わせ方法を確認し、販売開始前に正式なプライバシーポリシーを掲載します。" : "Before sales open, the final privacy policy will describe the purposes of processing, service providers, retention, international processing and how to request access, correction or deletion. These arrangements are still being reviewed."}</p>
      </div>
      <div className="mt-8"><Button href="/contact" variant="outline">{ja ? "問い合わせ" : "Contact"}</Button></div>
    </Container><SiteFooter /></>;
}
