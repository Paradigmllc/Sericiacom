import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { Container, PageHero, Rule } from "../../components/ui";

/**
 * 特定商取引法に基づく表記 — Japanese Commercial Transactions Law notation.
 *
 * Required under 特定商取引法 Section 11 (Act on Specified Commercial
 * Transactions, Article 11) for any business selling goods to consumers in
 * Japan. The 12 fields below are the minimum disclosure mandated by the
 * Consumer Affairs Agency (消費者庁).
 *
 * Privacy pattern — for "所在地 (address)" and "電話番号 (phone)" we use the
 * agency-sanctioned "請求があれば遅滞なく開示します" (disclosed upon request
 * without delay) formulation. This is explicitly permitted for small
 * operators and is the pattern used by note / BASE / STORES. It satisfies
 * the legal requirement while keeping a home/small-office address off a
 * globally-crawled page.
 *
 * Bilingual layout — Japanese primary (regulators + JP customers read this
 * for legal compliance) with English subheadings (international customers
 * landing via SEO).
 */

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | Sericia",
  description:
    "特定商取引法第11条に基づく販売事業者情報・返品・送料・お支払い方法等の表記です。Legal notation required by Japan's Act on Specified Commercial Transactions.",
  alternates: { canonical: "https://sericia.com/tokushoho" },
};

/**
 * Single row of the 特商法 table — label in Japanese, value can be a string
 * or JSX for multi-line / linked content.
 */
function Row({
  label,
  en,
  children,
}: {
  label: string;
  en: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2 md:gap-8 py-6 border-b border-sericia-line last:border-b-0">
      <div>
        <p className="text-[14px] font-normal text-sericia-ink">{label}</p>
        <p className="text-[11px] text-sericia-ink-mute tracking-wider uppercase mt-1">
          {en}
        </p>
      </div>
      <div className="text-[15px] text-sericia-ink-soft leading-[1.75]">
        {children}
      </div>
    </div>
  );
}

export default function TokushohoPage() {
  return (
    <>
      <SiteHeader />
      <PageHero
        eyebrow="Legal · 法令表記"
        title="特定商取引法に基づく表記"
        lede="Notation based on Japan's Act on Specified Commercial Transactions (特定商取引法 第11条). Last updated April 2026."
      />
      <Container size="narrow" className="py-20 md:py-28">
        <div className="not-prose">
          <Row label="販売事業者" en="Seller">
            Paradigm LLC
            <br />
            <span className="text-[13px] text-sericia-ink-mute">
              Registered in the State of Delaware, USA
              <br />
              Operating brand: Sericia (sericia.com)
            </span>
          </Row>

          <Row label="運営統括責任者" en="Operations manager">
            Sato
          </Row>

          <Row label="所在地" en="Address">
            東京都港区南青山
            <br />
            <span className="text-[13px] text-sericia-ink-mute">
              番地・ビル名は請求があれば遅滞なく開示いたします。
              <br />
              Full address (building and room number) disclosed upon request
              without delay, as permitted by the Consumer Affairs Agency
              guideline for small operators.
            </span>
          </Row>

          <Row label="電話番号" en="Telephone">
            050-3120-3706
            <br />
            <span className="text-[13px] text-sericia-ink-mute">
              受付時間 / Hours: 平日 10:00–18:00 JST (Mon–Fri)
              <br />
              お問い合わせは原則メールにて承っております。
              <br />
              Email contact preferred — see below.
            </span>
          </Row>

          <Row label="メールアドレス" en="Email">
            <a
              href="mailto:contact@sericia.com"
              className="underline-link"
            >
              contact@sericia.com
            </a>
          </Row>

          <Row label="販売URL" en="Sales URL">
            <a
              href="https://sericia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-link"
            >
              https://sericia.com
            </a>
          </Row>

          <Row label="販売価格" en="Sale price">
            各商品ページに表示された金額(税込・USD建て)。
            <br />
            <span className="text-[13px] text-sericia-ink-mute">
              Prices are displayed per product in US dollars, inclusive of
              Japanese consumption tax where applicable.
            </span>
          </Row>

          <Row
            label="商品代金以外の必要料金"
            en="Charges besides product price"
          >
            <ul className="list-none space-y-1">
              <li>・ 送料(EMS・配送先地域により変動 — 注文確定時に表示)</li>
              <li>・ 輸入関税・消費税(到着国で発生した場合はお客様負担)</li>
              <li>・ 代金支払いに係る決済手数料(該当する場合)</li>
            </ul>
            <p className="text-[13px] text-sericia-ink-mute mt-2">
              Shipping fee (EMS, varies by destination, shown at checkout),
              import duties and destination-country taxes (paid by customer on
              arrival), payment processing fees where applicable.
            </p>
          </Row>

          <Row label="お支払い方法" en="Payment methods">
            クレジットカード(Visa / Mastercard / American Express / JCB)、
            および米ドルステーブルコイン(USDC)。
            <br />
            <span className="text-[13px] text-sericia-ink-mute">
              Decentralised payment processing by Crossmint. Credit card and
              USDC stablecoin accepted. All transactions are settled in USD.
            </span>
          </Row>

          <Row label="お支払い時期" en="Payment timing">
            ご注文確定時に即時決済。
            <br />
            <span className="text-[13px] text-sericia-ink-mute">
              Payment is captured at the time the order is placed.
            </span>
          </Row>

          <Row label="商品の引渡時期" en="Delivery timing">
            ご注文確定後48時間以内に京都より発送。
            お届けまでの所要日数は配送先により2〜7営業日。
            <br />
            <span className="text-[13px] text-sericia-ink-mute">
              Dispatched from Kyoto within 48 hours of order confirmation.
              Transit 2–7 business days depending on destination. Tracking
              number provided by email.
            </span>
          </Row>

          <Row label="返品・交換について" en="Returns and exchanges">
            商品に不備(破損・品違い・賞味期限切れ等)があった場合のみ、
            商品到着後7日以内にメールにてご連絡ください。
            送料当社負担にて交換もしくは返金いたします。
            <br />
            <span className="text-[13px] text-sericia-ink-mute">
              Returns accepted only where goods are defective (damaged,
              incorrect, or past best-before). Contact us by email within 7
              days of delivery — we will refund or replace at our cost.
            </span>
            <p className="mt-3">
              食品の特性上、お客様のご都合による返品はお受けしておりません。
            </p>
            <p className="text-[13px] text-sericia-ink-mute">
              Non-defective returns are not accepted due to the nature of
              perishable food goods.
            </p>
          </Row>

          <Row label="不良品の場合" en="Defective goods">
            商品到着時に不備が確認された場合、
            <a
              href="mailto:contact@sericia.com"
              className="underline-link"
            >
              contact@sericia.com
            </a>
            までご連絡ください。
            写真添付のうえ状況をご共有いただけますと迅速に対応いたします。
          </Row>
        </div>

        <Rule className="my-14" />

        <p className="label mb-4">関連ページ / Also on Sericia</p>
        <ul className="not-prose grid grid-cols-1 md:grid-cols-2 gap-3 text-[14px]">
          <li>
            <Link
              href="/shipping"
              className="text-sericia-ink-soft hover:text-sericia-ink"
            >
              配送について / Shipping
            </Link>
          </li>
          <li>
            <Link
              href="/refund"
              className="text-sericia-ink-soft hover:text-sericia-ink"
            >
              返品規定 / Refund policy
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="text-sericia-ink-soft hover:text-sericia-ink"
            >
              利用規約 / Terms of sale
            </Link>
          </li>
          <li>
            <Link
              href="/privacy"
              className="text-sericia-ink-soft hover:text-sericia-ink"
            >
              プライバシーポリシー / Privacy
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="text-sericia-ink-soft hover:text-sericia-ink"
            >
              会社情報 / About
            </Link>
          </li>
        </ul>
      </Container>
      <SiteFooter />
    </>
  );
}
