import Link from "next/link";
import { useTranslations } from "next-intl";

// Uses `useTranslations` (works in both server and client boundaries)
// rather than `getTranslations` (server-only). Mirrors SiteHeader so that
// /tools/* client pages can import the footer without SSR crashing.
export default function SiteFooter() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  return (
    <footer className="bg-sericia-paper-deep text-sericia-ink">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div>
            <p className="label mb-5">{t("shop")}</p>
            <ul className="space-y-3 text-[14px] text-sericia-ink-soft">
              <li><Link href="/#drop" className="hover:text-sericia-ink">{tNav("current_drop")}</Link></li>
              <li><Link href="/#waitlist" className="hover:text-sericia-ink">Next-drop waitlist</Link></li>
              <li><Link href="/guides" className="hover:text-sericia-ink">{tNav("guides")}</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-5">Tools</p>
            <ul className="space-y-3 text-[14px] text-sericia-ink-soft">
              <li><Link href="/tools/ems-calculator" className="hover:text-sericia-ink">EMS calculator</Link></li>
              <li><Link href="/tools/matcha-grade" className="hover:text-sericia-ink">Matcha grade finder</Link></li>
              <li><Link href="/tools/miso-finder" className="hover:text-sericia-ink">Miso style finder</Link></li>
              <li><Link href="/tools/shelf-life" className="hover:text-sericia-ink">Shelf-life estimator</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-5">{t("company")}</p>
            <ul className="space-y-3 text-[14px] text-sericia-ink-soft">
              <li><Link href="/#story" className="hover:text-sericia-ink">{tNav("our_story")}</Link></li>
              <li><Link href="/shipping" className="hover:text-sericia-ink">{tNav("shipping")}</Link></li>
              <li><Link href="/refund" className="hover:text-sericia-ink">Refunds</Link></li>
              <li><Link href="/terms" className="hover:text-sericia-ink">Terms of sale</Link></li>
              <li><Link href="/privacy" className="hover:text-sericia-ink">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-5">{t("support")}</p>
            <ul className="space-y-3 text-[14px] text-sericia-ink-soft">
              <li><a href="mailto:contact@sericia.com" className="underline-link">contact@sericia.com</a></li>
              <li className="text-sericia-ink-mute leading-relaxed pt-2">
                Paradigm LLC<br />
                Registered in Delaware, USA<br />
                Ships from Kyoto, Japan
              </li>
            </ul>
          </div>
        </div>
        <div className="rule pt-8 flex flex-wrap items-center justify-between gap-4 text-[12px] text-sericia-ink-mute tracking-wider">
          <p>{t("copyright")}</p>
          <p>{t("tagline")}</p>
        </div>
      </div>
    </footer>
  );
}
