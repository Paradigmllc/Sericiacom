export const COUNTRIES = [
  { code: "us", name: "United States", currency: "USD", flag: "🇺🇸", locale: "en-US" },
  { code: "uk", name: "United Kingdom", currency: "GBP", flag: "🇬🇧", locale: "en-GB" },
  { code: "de", name: "Germany", currency: "EUR", flag: "🇩🇪", locale: "de-DE" },
  { code: "fr", name: "France", currency: "EUR", flag: "🇫🇷", locale: "fr-FR" },
  { code: "au", name: "Australia", currency: "AUD", flag: "🇦🇺", locale: "en-AU" },
  { code: "sg", name: "Singapore", currency: "SGD", flag: "🇸🇬", locale: "en-SG" },
  { code: "ca", name: "Canada", currency: "CAD", flag: "🇨🇦", locale: "en-CA" },
  { code: "hk", name: "Hong Kong", currency: "HKD", flag: "🇭🇰", locale: "en-HK" },
] as const;

export const PRODUCTS = [
  { slug: "sencha", name: "Sencha (Japanese Green Tea)" },
  { slug: "matcha", name: "Matcha" },
  { slug: "miso", name: "Miso Paste" },
  { slug: "shiitake", name: "Dried Shiitake Mushrooms" },
  { slug: "dashi", name: "Dashi Stock" },
  { slug: "yuzu", name: "Yuzu Citrus Products" },
  { slug: "shichimi", name: "Shichimi Togarashi" },
  { slug: "furikake", name: "Furikake Rice Seasoning" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];
export type ProductSlug = (typeof PRODUCTS)[number]["slug"];
