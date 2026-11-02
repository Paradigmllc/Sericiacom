// Only the reviewed Medusa commerce API is reachable through the public ingress.
const PREFIX = '/_sericia-medusa';
const LOCALE = /^\/(?:en|ja|de|fr|es|it|ko|zh-TW|ru|ar)(?=\/|$)/;
const PRIVATE = /^\/(?:admin|cms|auth|account|login|pay)(?:\/|$)/;
const API = new Set(['/api/commerce/checkout', '/api/commerce/payment', '/api/products/search-index']);
const RETIRED = /^\/api\/(?:orders|stripe|crossmint-webhook|hyperswitch|pay|admin)(?:\/|$)/;
function response(message, status) {
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Sericia-Platform': 'medusa' } });
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.sericia.com' || url.protocol !== 'https:') {
      url.protocol = 'https:';
      if (url.hostname === 'www.sericia.com') url.hostname = 'sericia.com';
      return Response.redirect(url.href, 308);
    }
    let path;
    try { path = decodeURIComponent(url.pathname).replace(LOCALE, '') || '/'; }
    catch (error) { console.warn('sericia.invalid_path'); return response('Invalid path', 400); }
    if (/[\\\x00-\x1f]/.test(path) || path.split('/').some(p => p === '.' || p === '..') || path.includes('//')) return response('Invalid path', 400);
    if (PRIVATE.test(path)) return response('This service is not available. Please return to the store.', 503);
    if (path.startsWith('/api') && !API.has(path)) return response('This service is not available.', RETIRED.test(path) ? 410 : 503);
    const webhook = path === '/hooks/payment/stripe_stripe';
    if (webhook && env.PAYMENT_WEBHOOKS_ENABLED !== 'true') return response('Payment webhook is not configured.', 503);
    if (webhook && (request.method !== 'POST' || !request.headers.get('stripe-signature'))) return response('Invalid payment webhook', 400);
    if (!webhook && !['GET', 'HEAD'].includes(request.method)) {
      if (request.method !== 'POST' || !['/api/commerce/checkout', '/api/commerce/payment'].includes(path)) return response('Method not allowed', 405);
      if (request.headers.get('Origin') !== url.origin) return response('Invalid request origin', 403);
    }
    if (path === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' } });
    if (!env.ORIGIN_TOKEN) { console.error('sericia.origin_not_configured'); return response('Store temporarily unavailable', 503); }
    const origin = new URL('https://paradigmjp.com');
    origin.pathname = PREFIX + url.pathname;
    origin.search = url.search;
    const headers = new Headers(request.headers);
    for (const name of ['host', 'authorization', 'x-sericia-origin', 'x-forwarded-host', 'x-forwarded-for', 'forwarded']) headers.delete(name);
    headers.set('x-sericia-origin', env.ORIGIN_TOKEN);
    headers.set('x-forwarded-host', 'sericia.com');
    if (headers.has('origin')) headers.set('origin', origin.origin);
    // Never forward Shopify or Paradigm authentication cookies to the new store.
    headers.set('cookie', (request.headers.get('cookie') ?? '').split(';').map(c => c.trim())
      .filter(c => /^(?:NEXT_LOCALE|country|sericia_medusa_checkout)=/.test(c)).join('; '));
    try {
      const upstream = await fetch(origin, { method: request.method, headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'manual', signal: AbortSignal.timeout(20000) });
      if (upstream.status >= 500) { console.error('sericia.origin_failed', { status: upstream.status }); return response('Store temporarily unavailable. Please try again.', 503); }
      const result = new Response(upstream.body, upstream);
      result.headers.set('X-Sericia-Platform', 'medusa');
      result.headers.set('X-Sericia-Release', env.RELEASE);
      result.headers.set('X-Robots-Tag', 'noindex, nofollow');
      result.headers.set('Cache-Control', 'private, no-store');
      result.headers.delete('x-sericia-origin');
      result.headers.delete('refresh');
      const location = result.headers.get('location');
      if (location) {
        const target = new URL(location, origin);
        if (target.origin !== origin.origin) return response('Unexpected redirect', 502);
        target.host = url.host;
        if (target.pathname.startsWith(PREFIX)) target.pathname = target.pathname.slice(PREFIX.length) || '/';
        result.headers.set('location', target.href);
      }
      return result;
    } catch (error) { console.error('sericia.origin_unavailable'); return response('Store temporarily unavailable. Please try again.', 503); }
  },
};
