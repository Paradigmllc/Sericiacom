import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("sericia-cart", JSON.stringify({ version: 3, state: { items: [{
    productId: "prod_fixture", variantId: "variant_fixture", name: "Tea — 50g", slug: "fixture", price: 1, currency: "jpy", quantity: 2, image: null,
  }] } })));
});
test("checkout uses server quotes and resets shipping after address changes", async ({ page }) => {
  let prepares = 0; let shipping = 0;
  await page.route("**/api/commerce/checkout", async route => {
    if (route.request().method() === "GET") return route.fulfill({ json: { countries: [{code:"us",name:"United States"}] } });
    const input = route.request().postDataJSON();
    expect(input.items).toEqual([{variant_id:"variant_fixture",quantity:2}]);
    expect(input).not.toHaveProperty("price");
    if (input.action === "prepare") prepares++; else shipping++;
    return route.fulfill({ json: { quote: { currency:"jpy",subtotal:2400,shipping:800,tax:0,discount:0,credit:0,total:3200,
      items:[{id:"item_fixture",name:"Tea — 50g",quantity:2,total:2400}],
      options:[{id:"so_fixture",name:"Tracked delivery",amount:800}], shippingSelected:input.action === "shipping" } } });
  });
  await page.goto("/checkout");
  for (const [name,value] of [["Email","test@example.invalid"],["First name","Test"],["Last name","Fixture"],["Street address","Test address"],["City","Test"],["Postal code","00000"]]) {
    await page.getByRole("textbox", {name,exact:true}).fill(value);
  }
  await page.getByRole("combobox", {name:"Country"}).selectOption("us");
  await page.getByRole("button", {name:"Check prices and delivery"}).click();
  await expect(page.getByRole("complementary", {name:"Order summary"}).getByText(/JPY\s+2,400/).first()).toBeVisible();
  await page.getByRole("button", {name:"Select Tracked delivery"}).click();
  await expect(page.getByText(/no order has been placed/)).toBeVisible();
  await expect(page.getByText(/JPY\s+3,200/)).toBeVisible();
  await page.getByRole("textbox", {name:"Street address",exact:true}).fill("Changed address");
  await expect(page.getByText(/no order has been placed/)).toHaveCount(0);
  await expect(page.getByRole("region", {name:"Delivery methods"})).toHaveCount(0);
  expect(prepares).toBe(1); expect(shipping).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
test("unconfigured destinations close checkout without asking for personal details", async ({ page }) => {
  await page.route("**/api/commerce/checkout", route => route.fulfill({json:{countries:[]}}));
  await page.goto("/checkout");
  await expect(page.getByText(/Checkout is currently closed/)).toBeVisible();
  await expect(page.getByRole("textbox",{name:"Email"})).toHaveCount(0);
});
test("checkout API rejects cross-site writes and tampered fields before backend access", async ({ request, baseURL }) => {
  const badOrigin = await request.post("/api/commerce/checkout", {headers:{Origin:"https://other.example"},data:{action:"prepare"}});
  expect(badOrigin.status()).toBe(403);
  const invalid = await request.post("/api/commerce/checkout", {headers:{Origin:baseURL!},data:{action:"shipping",option_id:"so_fixture",items:[{variant_id:"variant_fixture",quantity:1,price:1}]}});
  expect(invalid.status()).toBe(400);
  const oversized = await request.post("/api/commerce/checkout", {headers:{Origin:baseURL!},data:{text:"x".repeat(21000)}});
  expect(oversized.status()).toBe(413);
});
