import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney, lowestCalculatedPrice } from '../lib/money.ts';
const variant = (amount, currency) => ({calculated_price: {calculated_amount: amount, currency_code: currency}});
test('Medusa JPY and decimal USD remain major units, formatted with actual currency', () => {
  assert.equal(lowestCalculatedPrice([variant(1200, 'jpy')], 'jpy'), 1200);
  assert.equal(lowestCalculatedPrice([variant(12.75, 'usd')], 'usd'), 12.75);
  assert.match(formatMoney(1200, 'jpy'), /JPY\s*1,200$/);
  assert.match(formatMoney(12.75, 'usd'), /USD\s*12\.75$/);
});
test('uses region-calculated price, excludes other currencies and missing prices', () => {
  assert.equal(lowestCalculatedPrice([variant(8, 'usd'), variant(1000, 'jpy'), variant(900, 'jpy')], 'JPY'), 900);
  assert.equal(lowestCalculatedPrice([variant(0, 'usd')], 'usd'), 0);
  for (const values of [[], [{}], [variant(8, 'usd')], [variant(-1, 'jpy')], [variant(NaN, 'jpy')]]) {
    assert.throws(() => lowestCalculatedPrice(values, 'jpy'));
  }
  assert.throws(() => formatMoney(NaN, 'usd'));
  assert.throws(() => formatMoney(10, 'invalid'));
});
