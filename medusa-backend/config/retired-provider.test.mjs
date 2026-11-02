import test from 'node:test';
import assert from 'node:assert/strict';
import {POST} from '../src/api/webhooks/crossmint/route.ts';
test('retired Crossmint callback never resolves services or creates an order', async()=>{
  const req={get scope(){throw new Error('must not access database or services');}};
  let status, body;
  const res={status(value){status=value;return this;},json(value){body=value;return this;}};
  await POST(req,res);
  assert.equal(status,410);
  assert.deepEqual(body,{error:'payment_provider_retired'});
});
