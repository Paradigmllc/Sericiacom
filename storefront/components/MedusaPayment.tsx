'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { useCart } from '@/lib/cart-store';
import { formatMoney } from '@/lib/money';
import type { CheckoutQuote } from '@/lib/checkout-contract';
type Receipt = { number: string; currency: string; total: number };
type PaymentResponse = { state: 'payment'; clientSecret: string; publishableKey: string } | { state: 'complete'; order: Receipt };
async function paymentRequest(input: unknown): Promise<PaymentResponse> {
  const response = await fetch('/api/commerce/payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal: AbortSignal.timeout(25000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'Order verification is unavailable.');
  return data;
}
export default function MedusaPayment({ quote, returning = false }: { quote?: CheckoutQuote; returning?: boolean }) {
  const items = useCart(s => s.items);
  const clear = useCart(s => s.clear);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [payment, setPayment] = useState<{ secret: string; stripe: Promise<Stripe | null> } | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const report = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Order verification is unavailable.';
    console.error('[payment-ui] Request failed'); setError(message); toast.error(message);
  }, []);
  useEffect(() => {
    let active = true;
    setError(null); setEnabled(null);
    if (returning) {
      // Remove provider secrets from the address bar; only server completion can prove an order.
      window.history.replaceState(null, '', '/checkout?verify=1');
      setBusy(true);
      paymentRequest({ action: 'complete' }).then(data => {
        if (!active) return;
        if (data.state !== 'complete') throw new Error('Your order is still being verified.');
        setReceipt(data.order); clear();
      }).catch(err => { if (active) report(err); }).finally(() => { if (active) setBusy(false); });
    } else {
      setPayment(null);
      fetch('/api/commerce/payment', { cache: 'no-store' }).then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (active) setEnabled(data.enabled === true);
      }).catch(err => { if (active) report(err); });
    }
    return () => { active = false; };
  }, [returning, attempt, clear, report]);
  async function start() {
    if (!quote) return;
    setBusy(true); setError(null);
    try {
      const data = await paymentRequest({ action: 'start', total: quote.total, currency: quote.currency,
        items: items.map(i => ({ variant_id: i.variantId, quantity: i.quantity })) });
      if (data.state !== 'payment') throw new Error('Please verify your existing order.');
      setPayment({ secret: data.clientSecret, stripe: loadStripe(data.publishableKey).catch(() => { report(new Error('The secure payment service could not load. Please retry.')); return null; }) });
    } catch (err) { report(err); }
    finally { setBusy(false); }
  }
  if (receipt) return <section aria-label="Order confirmed" className="space-y-4 border border-sericia-line p-5 sm:p-6 lg:p-8">
    <h2 className="text-2xl">Order confirmed</h2><p>Order {receipt.number}</p><p>{formatMoney(receipt.total, receipt.currency)}</p>
    <p>Your order has been saved. This confirmation does not mean that it has shipped.</p><Link className="underline" href="/products">Continue shopping</Link>
  </section>;
  return <section aria-label="Payment" aria-busy={busy} className="space-y-4 border border-sericia-line p-4 sm:p-5 lg:p-6">
    <h2 className="text-xl">{returning ? 'Verify your order' : 'Payment'}</h2>
    {error && <div role="alert"><p>{error}</p><button type="button" aria-label="Retry order verification" disabled={busy} onClick={() => setAttempt(a => a + 1)} className="mt-3 underline">{returning ? 'Retry order verification — do not pay again' : 'Retry availability'}</button></div>}
    {(busy || (!returning && enabled === null && !error)) && <p role="status">{returning ? 'Verifying payment and order…' : 'Preparing secure payment…'}</p>}
    {enabled === false && <p role="status">Payment is not available yet; no order has been placed.</p>}
    {!returning && enabled && !payment && <button type="button" disabled={busy} aria-label="Continue to secure payment" onClick={() => void start()} className="w-full bg-sericia-ink text-sericia-paper p-4 disabled:opacity-50">Continue to secure payment</button>}
    {payment && quote && <Elements stripe={payment.stripe} options={{ clientSecret: payment.secret }}><PaymentForm quote={quote} report={report} /></Elements>}
  </section>;
}
function PaymentForm({ quote, report }: { quote: CheckoutQuote; report: (error: unknown) => void }) {
  const stripe = useStripe(); const elements = useElements(); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!stripe || !elements || busy) return;
    setBusy(true);
    try {
      const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: new URL('/checkout?verify=1', window.location.origin).href }, redirect: 'if_required' });
      if (error) throw new Error(error.message ?? 'Payment could not be completed.');
      // A separate verification step handles both immediate and redirect-based payment methods.
      window.location.assign('/checkout?verify=1');
    } catch (err) { report(err); setBusy(false); }
  }
  return <form onSubmit={submit} className="space-y-4" aria-busy={busy}>
    <PaymentElement onLoadError={() => report(new Error('The secure payment form could not load. Please try again.'))} />
    <button type="submit" aria-label="Pay and verify order" disabled={!stripe || !elements || busy} className="w-full bg-sericia-ink text-sericia-paper p-4 disabled:opacity-50">{busy ? 'Processing…' : `Pay ${formatMoney(quote.total, quote.currency)}`}</button>
    <p className="text-sm">Your order is confirmed only after payment and stock are verified.</p>
  </form>;
}
