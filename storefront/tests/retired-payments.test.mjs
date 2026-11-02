import test from 'node:test';
import assert from 'node:assert/strict';
import { POST as createPayment } from '../app/(frontend)/api/pay/create/route.ts';
import { POST as webhook } from '../app/(frontend)/api/crossmint-webhook/route.ts';

test('retired crypto routes return 410 without parsing input or initializing services', async () => {
  for (const handler of [createPayment, webhook]) {
    const response = await handler();
    assert.equal(response.status, 410);
    assert.deepEqual(await response.json(), {error: 'crypto_payments_retired'});
  }
});
