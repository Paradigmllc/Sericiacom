import test from 'node:test';
import assert from 'node:assert/strict';
const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key),
};
globalThis.window = { localStorage: globalThis.localStorage };
const { useCart } = await import('../lib/cart-store.ts');
const item = (productId, price, currency) => ({productId, variantId: productId, name: productId, slug: productId, price, currency, quantity: 1, image: null});
test('cart keeps currency, updates displayed price and refuses mixed currencies atomically', () => {
  useCart.getState().clear();
  useCart.getState().add(item('tea', 1200, 'jpy'));
  useCart.getState().add(item('tea', 1300, 'jpy'));
  assert.equal(useCart.getState().subtotal(), 2600);
  assert.throws(() => useCart.getState().add(item('cup', 20, 'usd')));
  assert.equal(useCart.getState().items.length, 1);
  assert.equal(useCart.getState().count(), 2);
  assert.equal(useCart.getState().subtotal(), 2600);
});
test('different variants of one product remain distinct and can be edited independently', () => {
  useCart.getState().clear();
  useCart.getState().add({...item('tea',1200,'jpy'),variantId:'variant_small'});
  useCart.getState().add({...item('tea',2000,'jpy'),variantId:'variant_large'});
  assert.equal(useCart.getState().items.length,2);
  useCart.getState().setQty('variant_small',3);
  assert.equal(useCart.getState().subtotal(),5600);
  useCart.getState().remove('variant_small');
  assert.equal(useCart.getState().items[0].variantId,'variant_large');
  assert.throws(()=>useCart.getState().add({...item('tea',100,'jpy'),variantId:''}));
});
