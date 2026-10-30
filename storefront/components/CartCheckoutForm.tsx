"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import { checkoutInput, type CheckoutQuote } from "@/lib/checkout-contract";
import { formatMoney } from "@/lib/money";

type Country = { code: string; name: string };
const fields = [
  ["email", "Email", "email"], ["first_name", "First name", "given-name"], ["last_name", "Last name", "family-name"],
  ["address_1", "Street address", "address-line1"], ["address_2", "Apartment / suite (optional)", "address-line2"],
  ["city", "City", "address-level2"], ["province", "State / province (optional)", "address-level1"],
  ["postal_code", "Postal code", "postal-code"], ["phone", "Phone (optional)", "tel"],
] as const;
export default function CartCheckoutForm() {
  const items = useCart(s => s.items);
  const [mounted, setMounted] = useState(false);
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", address_1: "", address_2: "", city: "", province: "", postal_code: "", phone: "", country_code: "" });
  const [quotedItems, setQuotedItems] = useState("");
  const selection = JSON.stringify(items.map(i => ({ variant_id: i.variantId, quantity: i.quantity })));
  const currentQuote = quotedItems === selection ? quote : null;
  function report(err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout unavailable. Please try again.";
    console.error("[checkout]", message); setError(message); toast.error(message);
  }
  async function loadCountries() {
    setError(null);
    try {
      const response = await fetch("/api/commerce/checkout", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCountries(data.countries);
    } catch (err) { report(err); }
  }
  useEffect(() => { setMounted(true); void loadCountries(); }, []);
  async function submit(action: "prepare" | "shipping", option_id?: string) {
    setError(null);
    const { email, ...address } = form;
    const input = checkoutInput.safeParse(action === "prepare"
      ? { action, email, address, items: JSON.parse(selection) }
      : { action, option_id, items: JSON.parse(selection) });
    if (!input.success) { report(new Error("Please check your address and product options.")); return; }
    setBusy(true); setQuote(null);
    try {
      const response = await fetch("/api/commerce/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input.data) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setQuote(data.quote); setQuotedItems(selection);
      toast.success(action === "prepare" ? "Prices and delivery options updated" : "Delivery method saved");
    } catch (err) { report(err); }
    finally { setBusy(false); }
  }
  if (!mounted) return <p role="status">Loading your cart…</p>;
  if (!items.length) return <div className="space-y-4"><p>Your cart is empty.</p><Link href="/products" className="underline">Browse products</Link></div>;
  return <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 lg:gap-16" aria-busy={busy}>
    <section aria-label="Delivery details" className="space-y-5">
      <h2 className="text-2xl">Delivery details</h2>
      <p className="text-sm">We verify current prices, stock and delivery availability before payment. Items are not reserved yet.</p>
      {error && <div role="alert" className="border border-red-700 p-4 text-red-800">{error}<button type="button" onClick={() => void loadCountries()} className="block underline mt-2" aria-label="Retry checkout availability">Retry availability</button></div>}
      {countries === null && !error && <p role="status">Checking available destinations…</p>}
      {countries?.length === 0 && <p role="status" className="border border-sericia-line p-4">Delivery destinations are not available yet. Checkout is currently closed.</p>}
      {!!countries?.length && <form onSubmit={e => { e.preventDefault(); void submit("prepare"); }} className="space-y-4">
        <fieldset disabled={busy} className="space-y-4">
          {fields.map(([key, label, autoComplete]) => <label key={key} className="block text-sm">{label}<input
            aria-label={label} type={key === "email" ? "email" : key === "phone" ? "tel" : "text"} autoComplete={autoComplete}
            required={!["address_2", "province", "phone"].includes(key)} maxLength={key === "email" ? 254 : 200}
            value={form[key]} onChange={e => { setForm({ ...form, [key]: e.target.value }); setQuote(null); }}
            className="mt-1 w-full border border-sericia-line bg-transparent p-3 text-base" /></label>)}
          <label className="block text-sm">Country<select aria-label="Country" required value={form.country_code}
            onChange={e => { setForm({ ...form, country_code: e.target.value }); setQuote(null); }} className="mt-1 w-full border border-sericia-line bg-transparent p-3 text-base">
            <option value="">Choose a delivery country</option>{countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select></label>
          <button aria-label="Check prices and delivery" className="w-full bg-sericia-ink p-4 text-sericia-paper disabled:opacity-50" type="submit">{busy ? "Checking…" : "Check prices and delivery"}</button>
        </fieldset>
      </form>}
      {busy && <p role="status" aria-live="polite">Updating your checkout…</p>}
      {currentQuote && <section aria-label="Delivery methods" className="space-y-3">
        <h2 className="text-xl">Delivery methods</h2>
        {!currentQuote.options.length && <p role="status">No delivery method is available for this address and cart. Change your address or review your items.</p>}
        {currentQuote.options.map(o => <button key={o.id} disabled={busy} aria-label={`Select ${o.name}`} type="button" onClick={() => void submit("shipping", o.id)} className="w-full border border-sericia-line p-4 text-left">{o.name} — {formatMoney(o.amount, currentQuote.currency)}</button>)}
        {currentQuote.shippingSelected && <p role="status">Delivery saved. Payment is not available yet; no order has been placed.</p>}
      </section>}
    </section>
    <aside aria-label="Order summary" className="border border-sericia-line p-5 sm:p-6 lg:p-8 self-start space-y-4">
      <h2 className="text-xl">Order summary</h2>
      {(currentQuote?.items ?? items.map(i => ({ id: i.variantId, name: i.name, quantity: i.quantity, total: i.price * i.quantity }))).map(i =>
        <div key={i.id} className="flex justify-between gap-3 text-sm"><span>{i.name} × {i.quantity}</span><span className="whitespace-nowrap">{formatMoney(i.total, currentQuote?.currency ?? items[0].currency)}</span></div>)}
      {currentQuote ? <dl className="space-y-3 border-t border-sericia-line pt-4">
        {([['Items', currentQuote.subtotal], ['Shipping', currentQuote.shipping], ['Tax', currentQuote.tax], ['Discount', currentQuote.discount], ['Credit', currentQuote.credit], ['Total', currentQuote.total]] as const).map(([label, amount]) =>
          <div key={label} className="flex justify-between"><dt>{label}</dt><dd>{['Shipping', 'Total'].includes(label) && !currentQuote.shippingSelected ? "Choose delivery" : `${["Discount", "Credit"].includes(label) && amount > 0 ? "−" : ""}${formatMoney(amount, currentQuote.currency)}`}</dd></div>)}
      </dl> : <p className="text-sm">Displayed item prices are estimates until verified. Shipping and tax are calculated after entering your address.</p>}
      <Link href="/cart" className="inline-block underline">Edit cart</Link>
    </aside>
  </div>;
}
