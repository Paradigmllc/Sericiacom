export const COUNTRIES = [
  { code: "us", name: "United States", currency: "USD", flag: "🇺🇸" },
  { code: "uk", name: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { code: "de", name: "Germany", currency: "EUR", flag: "🇩🇪" },
  { code: "fr", name: "France", currency: "EUR", flag: "🇫🇷" },
  { code: "au", name: "Australia", currency: "AUD", flag: "🇦🇺" },
  { code: "sg", name: "Singapore", currency: "SGD", flag: "🇸🇬" },
  { code: "ca", name: "Canada", currency: "CAD", flag: "🇨🇦" },
  { code: "hk", name: "Hong Kong", currency: "HKD", flag: "🇭🇰" },
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
