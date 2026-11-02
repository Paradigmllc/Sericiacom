import { test, expect } from '@playwright/test';
test('redirect parameters cannot confirm an order; retry verifies without initiating another payment', async ({ page }) => {
  let calls=0;
  await page.route('**/api/commerce/payment',route=>{
    expect(route.request().postDataJSON()).toEqual({action:'complete'});calls++;
    return calls===1 ? route.fulfill({status:409,json:{error:'Your order is still being verified. Do not pay again.'}})
      : route.fulfill({json:{state:'complete',order:{number:'12',currency:'jpy',total:3200}}});
  });
  await page.goto('/checkout?verify=1&payment_intent_client_secret=fixture-secret&paid=true');
  await expect(page.getByRole('alert').filter({hasText:'still being verified'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Order confirmed',exact:true})).toHaveCount(0);
  expect(page.url()).not.toContain('fixture-secret');
  await page.getByRole('button',{name:'Retry order verification'}).click();
  await expect(page.getByRole('heading',{name:'Order confirmed',exact:true})).toBeVisible();
  await expect(page.getByText('Order 12',{exact:true})).toBeVisible();
  expect(calls).toBe(2);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('payment endpoint rejects forged orders, missing origin and oversized bodies',async({request,baseURL})=>{
  expect((await request.get('/api/commerce/payment')).status()).toBe(200);
  expect((await request.post('/api/commerce/payment',{data:{action:'complete'}})).status()).toBe(403);
  expect((await request.post('/api/commerce/payment',{headers:{Origin:baseURL!},data:{action:'complete',paid:true}})).status()).toBe(400);
  expect((await request.post('/api/commerce/payment',{headers:{Origin:baseURL!},data:'x'.repeat(12001)})).status()).toBe(413);
});
