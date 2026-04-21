// PPP (Purchasing Power Parity) multipliers — based on World Bank 2024 PPP conversion factors
// Applied to base USD price so prices feel equivalent locally
// Format: [currency, multiplier from USD, locale]
export type Currency = "USD" | "GBP" | "EUR" | "AUD" | "SGD" | "CAD" | "HKD" | "JPY";

export const PPP: Record<string, { currency: Currency; mult: number; locale: string; symbol: string }> = {
  us: { currency: "USD", mult: 1.0, locale: "en-US", symbol: "$" },
  uk: { currency: "GBP", mult: 0.78, locale: "en-GB", symbol: "£" },
  de: { currency: "EUR", mult: 0.88, locale: "de-DE", symbol: "€" },
  fr: { currency: "EUR", mult: 0.88, locale: "fr-FR", symbol: "€" },
  au: { currency: "AUD", mult: 1.44, locale: "en-AU", symbol: "A$" },
  sg: { currency: "SGD", mult: 1.28, locale: "en-SG", symbol: "S$" },
  ca: { currency: "CAD", mult: 1.31, locale: "en-CA", symbol: "C$" },
  hk: { currency: "HKD", mult: 7.78, locale: "en-HK", symbol: "HK$" },
  jp: { currency: "JPY", mult: 149, locale: "ja-JP", symbol: "¥" },
};

export function formatPricePPP(usdPrice: number, countryCode: string): string {
  const p = PPP[countryCode] ?? PPP.us;
  const local = Math.round(usdPrice * p.mult);
  if (p.currency === "JPY") return `${p.symbol}${local.toLocaleString()}`;
  return `${p.symbol}${local}`;
}

export function detectCountryFromHeaders(headers: Headers): string {
  const cf = headers.get("cf-ipcountry")?.toLowerCase();
  if (cf && PPP[cf]) return cf;
  const al = headers.get("accept-language") ?? "";
  if (al.includes("ja")) return "jp";
  if (al.includes("de")) return "de";
  if (al.includes("fr")) return "fr";
  if (al.includes("zh")) return "hk";
  if (al.includes("en-GB")) return "uk";
  if (al.includes("en-AU")) return "au";
  return "us";
}
