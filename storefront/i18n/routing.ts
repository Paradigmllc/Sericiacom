import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ja", "de", "fr", "es", "it", "ko", "zh-TW", "ru"] as const,
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

// Native-name labels — avoid country-biased abbreviations (e.g. "EN" paired
// with 🇬🇧 implied UK-only and excluded US shoppers). Single `en` locale
// serves both US and UK via hreflang country-specific guide pages.
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  ko: "한국어",
  "zh-TW": "繁體中文",
  ru: "Русский",
};
