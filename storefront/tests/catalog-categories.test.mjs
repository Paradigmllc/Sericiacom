import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inferCategory, CATEGORY_KEYS, categoryLabel } from '../lib/catalog-categories.ts';
test('catalog trusts Medusa classification including nonfood, without guessing from names', () => {
  for (const handle of CATEGORY_KEYS) {
    assert.equal(inferCategory({ categories: [{ handle }] }), handle);
    assert.ok(categoryLabel(handle));
  }
  assert.equal(inferCategory({ categories: [{ handle: 'supplier' }, { handle: 'tableware' }] }), 'tableware');
  assert.equal(inferCategory({ handle: 'teaspoon' }), 'other');
  assert.equal(inferCategory({ categories: [{ handle: 'unknown' }] }), 'other');
});
