import { medusa, getRegion, DEFAULT_REGION_SLUG } from "./medusa";
import { sameCartItems, type checkoutInput, type CheckoutQuote } from "./checkout-contract";
import type { z } from "zod";
type Cart = {
  id: string; region_id: string; currency_code: string; completed_at?: string | null;
  item_subtotal: number; shipping_total: number; tax_total: number; total: number;
  items?: { id: string; variant_id?: string | null; product_id?: string | null; product_title: string; variant_title: string; quantity: number; total: number }[];
  shipping_methods?: { shipping_option_id: string }[];
};
type ShippingOption = { id: string; name: string; price_type: string; amount?: number };
export class CheckoutError extends Error {
  constructor(public status: number, message: string, public resetSession = false) { super(message); }
}
export async function checkoutCountries() {
  const { regionId } = await getRegion(DEFAULT_REGION_SLUG);
  const { region } = await medusa.store.region.retrieve(regionId);
  return { regionId, countries: ((region.countries ?? []) as { iso_2: string; display_name: string }[]).map(c => ({ code: c.iso_2, name: c.display_name })) };
}
function active(cart: Cart, regionId: string) {
  if (cart.completed_at || cart.region_id !== regionId) throw new CheckoutError(409, "Please start a new checkout from your cart.", true);
}
export async function prepareCheckout(input: z.infer<typeof checkoutInput>, cartId?: string) {
  const { regionId, countries } = await checkoutCountries();
  let cart: Cart | undefined;
  if (cartId) {
    try { cart = (await medusa.store.cart.retrieve(cartId)).cart; }
    catch (error) {
      if (!(error instanceof Error && "status" in error && error.status === 404)) throw error;
      console.warn("[checkout] Previous cart no longer exists");
    }
  }
  if (cart) active(cart, regionId);
  if (input.action === "prepare") {
    if (!countries.some(c => c.code === input.address.country_code)) throw new CheckoutError(422, "Delivery is not available to this country.");
    const details = { email: input.email, shipping_address: input.address, billing_address: input.address };
    if (cart && sameCartItems(cart.items ?? [], input.items)) {
      cart = (await medusa.store.cart.update(cart.id, details)).cart;
    } else {
      cart = (await medusa.store.cart.create({ region_id: regionId, items: input.items, ...details })).cart;
    }
  } else {
    if (!cart || !sameCartItems(cart.items ?? [], input.items)) throw new CheckoutError(409, "Your cart changed. Please confirm your address again.");
    const { shipping_options }: { shipping_options: ShippingOption[] } = await medusa.store.fulfillment.listCartOptions({ cart_id: cart.id });
    if (!shipping_options.some(o => o.id === input.option_id)) throw new CheckoutError(422, "This delivery method is no longer available.");
    cart = (await medusa.store.cart.addShippingMethod(cart.id, { option_id: input.option_id })).cart;
  }
  if (!cart) throw new CheckoutError(409, "Please restart checkout.");
  const ids = [...new Set((cart.items ?? []).map(i => i.product_id).filter((id): id is string => !!id))];
  if (!ids.length) throw new CheckoutError(409, "Please review your cart items.");
  const { products } = await medusa.store.product.list({ id: ids, region_id: regionId,
    fields: "id,variants.id,variants.inventory_quantity", limit: ids.length });
  const stock = new Map<string, number>((products as { variants?: { id: string; inventory_quantity?: number }[] }[])
    .flatMap(p => (p.variants ?? []).map(v => [v.id, v.inventory_quantity ?? 0] as [string, number])));
  if ((cart.items ?? []).some(i => !i.variant_id || (stock.get(i.variant_id) ?? 0) < i.quantity))
    throw new CheckoutError(409, "An option is no longer available in this quantity. Please review your cart.");
  return cart;
}
export async function checkoutQuote(cart: Cart): Promise<CheckoutQuote> {
  const { shipping_options }: { shipping_options: ShippingOption[] } = await medusa.store.fulfillment.listCartOptions({ cart_id: cart.id });
  const options = await Promise.all(shipping_options.map(async option => {
    const priced = option.price_type === "calculated"
      ? (await medusa.store.fulfillment.calculate(option.id, { cart_id: cart.id })).shipping_option : option;
    if (typeof priced.amount !== "number" || !Number.isFinite(priced.amount) || priced.amount < 0) throw new CheckoutError(503, "A delivery quote is unavailable. Please try again.");
    return { id: option.id, name: option.name, amount: priced.amount };
  }));
  if (![cart.item_subtotal, cart.shipping_total, cart.tax_total, cart.total, ...(cart.items ?? []).map(i => i.total)].every(n => typeof n === "number" && Number.isFinite(n) && n >= 0)) throw new CheckoutError(503, "Order totals are unavailable.");
  return { currency: cart.currency_code, subtotal: cart.item_subtotal, shipping: cart.shipping_total,
    tax: cart.tax_total, total: cart.total,
    items: (cart.items ?? []).map(i => ({ id: i.id, name: `${i.product_title} — ${i.variant_title}`, quantity: i.quantity, total: i.total })),
    options, shippingSelected: (cart.shipping_methods ?? []).some(m => options.some(o => o.id === m.shipping_option_id)),
  };
}
