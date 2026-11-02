import test from 'node:test';
import assert from 'node:assert/strict';
import {formatOrderTotal, templates} from '../src/lib/resend.ts';
test('Medusa v2 order totals use major units for yen and dollars',()=>{
  assert.match(formatOrderTotal(1200,'JPY'),/1,200/);
  assert.equal(formatOrderTotal(12.5,'USD'),'$12.50');
  assert.throws(()=>formatOrderTotal(NaN,'JPY'),/Invalid/);
});
test('order email escapes customer and product text without unverified delivery promises',()=>{
  const email=templates.orderConfirmation({name:'<img onerror=bad>',title:'Tea & "cups"',amount:'¥1,200',orderId:'1'});
  assert.ok(!email.html.includes('<img'));
  assert.ok(email.html.includes('&lt;img'));
  assert.ok(email.html.includes('Tea &amp; &quot;cups&quot;'));
  assert.ok(!email.html.includes('48 hours'));
  assert.ok(!email.subject.includes('on its way'));
});
