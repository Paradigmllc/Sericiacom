import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';
const env = { ORIGIN_TOKEN: 'fixture-only', RELEASE: 'test' };
const request = (path, init) => new Request('https://sericia.com' + path, init);
test('legacy APIs, locale aliases, private surfaces and cross-site POST cannot reach origin', async () => {
  for (const path of ['/api/orders/create','/api/stripe/webhook','/ja/api/orders/create']) assert.equal((await worker.fetch(request(path),env)).status,410);
  for (const path of ['/cms/api/graphql','/ja/admin','/account','/api/waitlist','/%63ms/admin']) assert.equal((await worker.fetch(request(path),env)).status,503);
  assert.equal((await worker.fetch(request('/api/commerce/checkout',{method:'POST',headers:{Origin:'https://evil.test'}}),env)).status,403);
  assert.equal((await worker.fetch(request('/products',{method:'POST'}),env)).status,405);
  assert.equal((await worker.fetch(request('/robots.txt'),env)).status,200);
});
test('origin is fixed, credentials filtered, redirects rewritten and failures closed', async (t) => {
  let seen;
  t.mock.method(globalThis,'fetch',async (url,options)=>{seen={url,options};return new Response('ok',{headers:{'set-cookie':'sericia_medusa_checkout=fixture; HttpOnly; Secure'}});});
  const result=await worker.fetch(request('/products?q=tea',{headers:{authorization:'secret',cookie:'_shopify=secret; NEXT_LOCALE=ja; sericia_medusa_checkout=fixture','x-sericia-origin':'attacker'}}),env);
  assert.equal(seen.url.href,'https://paradigmjp.com/_sericia-medusa/products?q=tea');
  assert.equal(seen.options.headers.get('authorization'),null);
  assert.equal(seen.options.headers.get('cookie'),'NEXT_LOCALE=ja; sericia_medusa_checkout=fixture');
  assert.equal(seen.options.headers.get('x-sericia-origin'),'fixture-only');
  assert.equal(result.headers.get('x-sericia-origin'),null);
  assert.equal(result.headers.get('x-sericia-release'),'test');
  assert.match(result.headers.get('set-cookie'),/HttpOnly/);
  assert.equal(result.headers.get('cache-control'),'private, no-store');
  globalThis.fetch.mock.mockImplementation(async()=>new Response(null,{status:307,headers:{location:'https://paradigmjp.com/ja/products'}}));
  assert.equal((await worker.fetch(request('/jp/products'),env)).headers.get('location'),'https://sericia.com/ja/products');
  globalThis.fetch.mock.mockImplementation(async()=>new Response(null,{status:500}));
  assert.equal((await worker.fetch(request('/'),env)).status,503);
  assert.equal((await worker.fetch(request('/'),{})).status,503);
});
test('Stripe webhook is closed by default and forwards the exact signed body only when enabled',async(t)=>{
  const payload='{"id":"evt_fixture"}';
  assert.equal((await worker.fetch(request('/hooks/payment/stripe_stripe',{method:'POST',body:payload}),env)).status,503);
  const enabled={...env,PAYMENT_WEBHOOKS_ENABLED:'true'};
  assert.equal((await worker.fetch(request('/hooks/payment/stripe_stripe',{method:'POST',body:payload}),enabled)).status,400);
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    assert.equal(url.pathname,'/_sericia-medusa/hooks/payment/stripe_stripe');
    assert.equal(options.headers.get('stripe-signature'),'fixture');
    assert.equal(await new Response(options.body).text(),payload);
    return new Response('accepted');
  });
  assert.equal((await worker.fetch(request('/hooks/payment/stripe_stripe',{method:'POST',headers:{'stripe-signature':'fixture'},body:payload}),enabled)).status,200);
});
