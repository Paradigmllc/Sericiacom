import { test, expect } from "@playwright/test";

test("JPY cart quantity changes preserve currency and major units", async ({ page }, testInfo) => {
  page.on("pageerror", error => console.error("Browser error:", error.message));
  page.on("console", message => { if (message.type() === "error") console.error(message.text()); });
  await page.addInitScript(() => {
    if (localStorage.getItem("sericia-cart")) return;
    localStorage.setItem("sericia-cart", JSON.stringify({version: 2, state: {items: [{
      productId: "preview-fixture", slug: "preview-fixture", name: "Preview fixture", price: 1200,
      currency: "jpy", quantity: 1, image: null,
    }]}}));
  });
  await page.goto("/cart");
  await expect(page.getByText("Preview fixture", { exact: true })).toBeVisible();
  await expect(page.getByText(/JPY\s+1,200 each/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Account sign-in temporarily unavailable" })).toBeDisabled();
  await page.getByRole("button", { name: /increase/i }).first().click();
  await expect(page.getByText(/JPY\s+2,400/, { exact: true }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("cart-jpy.png"), fullPage: true });
  await page.reload();
  await expect(page.getByText(/JPY\s+2,400/, { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(page.getByText("Preview fixture", { exact: true })).toHaveCount(0);
});

test("retired crypto HTTP endpoints cannot accept payment events", async ({ request }) => {
  for (const path of ["/api/pay/create", "/api/crossmint-webhook"]) {
    const response = await request.post(path, { data: { type: "order.succeeded" } });
    expect(response.status()).toBe(410);
    expect(await response.json()).toEqual({ error: "crypto_payments_retired" });
  }
});

test("unconfigured preview does not advertise offers or publish personal contact details", async ({ page }) => {
  await page.goto("/tokushoho");
  await expect(page.getByText(/This store is a pre-launch preview/)).toBeVisible();
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Launch promotion" })).toHaveCount(0);
  await expect(page.getByText(/FREE EMS WORLDWIDE/i)).toHaveCount(0);
});
