import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Container, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 — 準備中",
  robots: { index: false, follow: false },
};

// Launch disclosure remains pending until verified business terms and a
// functioning disclosure-request process exist. Never publish personal defaults.
export default async function TokushohoPage() {
  const t = await getTranslations("tokushoho");
  return (
    <>
      <SiteHeader />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} lede="販売開始前の確認中 / Pre-launch review" />
      <Container size="narrow" className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div role="status" className="border border-sericia-line bg-sericia-paper-card p-6 sm:p-8">
          <p lang="ja" className="leading-relaxed">
            このストアは販売開始前のプレビューです。事業者情報、送料、返品条件、
            お問い合わせ・情報開示の対応方法は、販売開始前に確認・確定します。
          </p>
          <p lang="en" className="mt-6 leading-relaxed">
            This store is a pre-launch preview. Business disclosures, shipping costs,
            returns and contact procedures will be finalized before sales open.
          </p>
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
