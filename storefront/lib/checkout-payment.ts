import { z } from 'zod';
import { medusa, getRegion, DEFAULT_REGION_SLUG } from './medusa';
import { checkoutItems, sameCartItems } from './checkout-contract';
import { CheckoutError, checkoutQuote, verifyCheckoutStock } from './checkout-medusa';

export const paymentInput = z.discriminatedUnion('action', [
  z.object({ action: z.literal('start'), items: checkoutItems, total: z.number().finite().positive(), currency: z.string().regex(/^[a-z]{3}$/) }).strict(),
  z.object({ action: z.literal('complete') }).strict(),
]);
const provider = 'pp_stripe_stripe';
function publishableKey() {
  if (process.env.SERICIA_PAYMENTS_ENABLED !== 'true') throw new CheckoutError(503, 'Payment is not available yet; no order has been placed.');
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key || !/^pk_(test|live)_[A-Za-z0-9]+$/.test(key) || (key.startsWith('pk_live_') && process.env.SERICIA_LIVE_PAYMENTS !== 'true')) {
    console.error('[payment] Stripe public key configuration is invalid');
    throw new CheckoutError(503, 'Payment is temporarily unavailable.');
  }
  return key;
}
export async function paymentAvailability() {
  if (process.env.SERICIA_PAYMENTS_ENABLED !== 'true') return { enabled: false };
  publishableKey();
  const { regionId } = await getRegion(DEFAULT_REGION_SLUG);
  const { payment_providers } = await medusa.store.payment.listPaymentProviders({ region_id: regionId });
  return { enabled: payment_providers.some((p: { id: string }) => p.id === provider) };
}
export async function processPayment(input: z.infer<typeof paymentInput>, cartId?: string) {
  const key = publishableKey();
  if (!cartId || !/^cart_[A-Za-z0-9_-]+$/.test(cartId)) throw new CheckoutError(409, 'Please restart checkout from your cart.');
  const { regionId } = await getRegion(DEFAULT_REGION_SLUG);
  const { cart } = await medusa.store.cart.retrieve(cartId, { fields: '+items.total,*payment_collection.payment_sessions' });
  if (cart.region_id !== regionId) throw new CheckoutError(409, 'Please restart checkout from your cart.');
  if (input.action === 'complete') {
    if (!cart.payment_collection?.payment_sessions?.some((p: { provider_id: string }) => p.provider_id === provider)) throw new CheckoutError(409, 'No payment has been verified for this checkout.');
    // Medusa validates authorization and serializes completion; repeated calls return the same order.
    const result = await medusa.store.cart.complete(cart.id);
    if (result.type !== 'order') throw new CheckoutError(409, 'Your payment or order is still being verified. Retry order verification; do not pay again.');
    return { state: 'complete' as const, order: { number: String(result.order.display_id), currency: result.order.currency_code, total: result.order.total } };
  }
  if (cart.completed_at || !sameCartItems(cart.items ?? [], input.items)) throw new CheckoutError(409, 'Your cart changed. Please confirm delivery again.');
  await verifyCheckoutStock(cart);
  const quote = await checkoutQuote(cart);
  if (!quote.shippingSelected || quote.total !== input.total || quote.currency !== input.currency) throw new CheckoutError(409, 'Your total or delivery changed. Please review your checkout again.');
  if (!(await paymentAvailability()).enabled) throw new CheckoutError(503, 'Payment is not available for this destination.');
  const { payment_collection } = await medusa.store.payment.initiatePaymentSession(cart, { provider_id: provider });
  const session = payment_collection.payment_sessions?.find((p: { provider_id: string; status: string; data?: Record<string, unknown> }) => p.provider_id === provider && p.status === 'pending');
  const clientSecret = session?.data?.client_secret;
  if (typeof clientSecret !== 'string' || !clientSecret.startsWith('pi_') || !clientSecret.includes('_secret_')) throw new CheckoutError(503, 'Payment could not be prepared. Please try again.');
  return { state: 'payment' as const, clientSecret, publishableKey: key };
}
