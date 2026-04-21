import { useTranslations } from "next-intl";
import HeaderClient from "./HeaderClient";
import HeaderShell from "./HeaderShell";
import Logo from "./Logo";
import AnnouncementBar from "./AnnouncementBar";
import Link from "next/link";

// Uses `useTranslations` (works in both server and client boundaries)
// rather than `getTranslations` (server-only). This lets client-component
// pages like /tools/* import SiteHeader without triggering the
// "`getTranslations` is not supported in Client Components" runtime error.
export default function SiteHeader() {
  const t = useTranslations("nav");
  return (
    <>
      <AnnouncementBar />
      <HeaderShell>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between gap-6">
          <Logo href="/" />
          <nav className="hidden md:flex items-center gap-9 text-[13px] text-sericia-ink-soft tracking-wider">
            <Link href="/products" className="hover:text-sericia-ink transition" data-cursor="link">
              {t("shop")}
            </Link>
            <Link href="/#drop" className="hover:text-sericia-ink transition" data-cursor="link">
              {t("current_drop")}
            </Link>
            <Link href="/guides" className="hover:text-sericia-ink transition" data-cursor="link">
              {t("guides")}
            </Link>
            <Link href="/about" className="hover:text-sericia-ink transition" data-cursor="link">
              {t("our_story")}
            </Link>
            <Link href="/shipping" className="hover:text-sericia-ink transition" data-cursor="link">
              {t("shipping")}
            </Link>
          </nav>
          <HeaderClient />
        </div>
      </HeaderShell>
    </>
  );
}
