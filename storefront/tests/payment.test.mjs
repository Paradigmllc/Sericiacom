import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV='production'; process.env.MEDUSA_PUBLISHABLE_KEY='pk_fixture'; process.env.MEDUSA_REGION='preview';
const {medusa}=await import('../lib/medusa.ts');
const {processPayment,paymentAvailability,paymentInput}=await import('../lib/checkout-payment.ts');
const input={action:'start',items:[{variant_id:'variant_fixture',quantity:2}],total:3200,currency:'jpy'};
test('payment gates, stock/total/region/provider checks and authoritative order completion',async()=>{
  delete process.env.SERICIA_PAYMENTS_ENABLED;
  assert.deepEqual(await paymentAvailability(),{enabled:false});
  await assert.rejects(processPayment(input,'cart_fixture'),/not available/);
  process.env.SERICIA_PAYMENTS_ENABLED='true';process.env.STRIPE_PUBLISHABLE_KEY='pk_live_fixture';
  await assert.rejects(processPayment(input,'cart_fixture'),/temporarily unavailable/);
  process.env.STRIPE_PUBLISHABLE_KEY='pk_test_fixture';
  let quantity=2,region='reg_fixture',total=3200,available=true,started=0,completed=0,confirmed=false,hasSession=true;
  medusa.store.region.list=async()=>({regions:[{id:'reg_fixture',name:'preview',currency_code:'jpy'}]});
  medusa.store.payment.listPaymentProviders=async()=>({payment_providers:available?[{id:'pp_stripe_stripe'}]:[]});
  medusa.store.cart.retrieve=async()=>({cart:{id:'cart_fixture',region_id:region,currency_code:'jpy',shipping_methods:[{shipping_option_id:'so_fixture'}],
    items:[{id:'item_fixture',variant_id:'variant_fixture',product_id:'prod_fixture',product_title:'Tea',variant_title:'50g',quantity:2,total:2400}],
    total,item_subtotal:2400,shipping_subtotal:800,tax_total:0,discount_subtotal:0,credit_line_total:0,
    payment_collection:{payment_sessions:hasSession?[{provider_id:'pp_stripe_stripe',status:'pending'}]:[]}}});
  medusa.store.product.list=async()=>({products:[{variants:[{id:'variant_fixture',inventory_quantity:quantity}]}]});
  medusa.store.fulfillment.listCartOptions=async()=>({shipping_options:[{id:'so_fixture',name:'Tracked',price_type:'flat',amount:800}]});
  medusa.store.payment.initiatePaymentSession=async(cart,body)=>{started++;assert.deepEqual(body,{provider_id:'pp_stripe_stripe'});assert.equal(cart.total,3200);return {payment_collection:{payment_sessions:[{provider_id:'pp_stripe_stripe',status:'pending',data:{client_secret:'pi_fixture_secret_fixture'}}]}};};
  medusa.store.cart.complete=async()=>{completed++;return confirmed?{type:'order',order:{display_id:12,currency_code:'jpy',total:3200,email:'private@example.invalid'}}:{type:'cart',error:{message:'private provider detail'}};};
  await assert.rejects(processPayment(input),/restart/);
  region='other';await assert.rejects(processPayment(input,'cart_fixture'),/restart/);region='reg_fixture';
  quantity=1;await assert.rejects(processPayment(input,'cart_fixture'),/quantity/);quantity=2;
  total=3300;await assert.rejects(processPayment(input,'cart_fixture'),/total or delivery changed/);total=3200;
  available=false;await assert.rejects(processPayment(input,'cart_fixture'),/destination/);available=true;
  assert.equal(started,0);
  assert.equal((await processPayment(input,'cart_fixture')).state,'payment');assert.equal(started,1);
  hasSession=false;await assert.rejects(processPayment({action:'complete'},'cart_fixture'),/No payment/);assert.equal(completed,0);hasSession=true;
  await assert.rejects(processPayment({action:'complete'},'cart_fixture'),/do not pay again/);
  confirmed=true;
  const receipt=await processPayment({action:'complete'},'cart_fixture');
  assert.deepEqual(receipt,{state:'complete',order:{number:'12',currency:'jpy',total:3200}});
  assert.deepEqual(await processPayment({action:'complete'},'cart_fixture'),receipt);assert.equal(started,1);
  assert.equal(paymentInput.safeParse({...input,cart_id:'cart_other'}).success,false);
  assert.equal(paymentInput.safeParse({action:'complete',paid:true}).success,false);
});
