export function formatMoney(amount: number, currency: string, locale = "en") {
  if (!Number.isFinite(amount) || amount < 0 || !/^[a-z]{3}$/i.test(currency)) {
    throw new Error("Invalid price or currency");
  }
  return new Intl.NumberFormat(locale, {
    style: "currency", currency: currency.toUpperCase(), currencyDisplay: "code",
  }).format(amount);
}

type VariantPrice = {
  calculated_price?: { calculated_amount: number; currency_code: string } | null;
};

// Medusa v2 already supplies major currency units, including JPY and USD.
export function lowestCalculatedPrice(variants: VariantPrice[], currency: string): number {
  const amounts = variants.flatMap(({ calculated_price: price }) =>
    price?.currency_code.toLowerCase() === currency.toLowerCase() &&
    Number.isFinite(price.calculated_amount) && price.calculated_amount >= 0
      ? [price.calculated_amount] : [],
  );
  if (!amounts.length) throw new Error(`No calculated price available in ${currency}`);
  return Math.min(...amounts);
}
