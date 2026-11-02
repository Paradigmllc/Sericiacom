import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sameOrigin } from '@/lib/checkout-contract';
import { CheckoutError } from '@/lib/checkout-medusa';
import { paymentAvailability, paymentInput, processPayment } from '@/lib/checkout-payment';
export const dynamic = 'force-dynamic';
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } });
function failure(error: unknown) {
  console.error('[payment] Request failed', { type: error instanceof Error ? error.name : 'unknown' });
  return json({ error: error instanceof CheckoutError ? error.message : 'Payment or order verification is temporarily unavailable. Please try again.' }, error instanceof CheckoutError ? error.status : 503);
}
export async function GET() {
  try { return json(await paymentAvailability()); }
  catch (error) { return failure(error); }
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request.headers.get('origin'), request.headers.get('host'))) return json({ error: 'Invalid request origin' }, 403);
  let raw = ''; let size = 0;
  try {
    const reader = request.body?.getReader(); const decoder = new TextDecoder();
    if (reader) while (true) {
      const chunk = await reader.read(); if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 12000) { await reader.cancel(); return json({ error: 'Request too large' }, 413); }
      raw += decoder.decode(chunk.value, { stream: true });
    }
    raw += decoder.decode();
    const input = paymentInput.safeParse(JSON.parse(raw));
    if (!input.success) return json({ error: 'Invalid payment request' }, 400);
    return json(await processPayment(input.data, (await cookies()).get('sericia_medusa_checkout')?.value));
  } catch (error) {
    if (error instanceof SyntaxError) { console.warn('[payment] Invalid JSON'); return json({ error: 'Invalid payment request' }, 400); }
    return failure(error);
  }
}
