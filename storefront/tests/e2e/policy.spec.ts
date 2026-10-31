import { test, expect } from "@playwright/test";
test("pre-launch policies do not claim retired payments or unverified delivery terms", async ({ page }) => {
  for (const path of ["/terms", "/privacy", "/faq"]) {
    await page.goto(path);
    await expect(page.getByRole("status").first()).toContainText(/preview does not accept orders/i);
    await expect(page.locator("body")).not.toContainText(/Crossmint|USDC|Delaware|forty-eight hours/i);
  }
});
test("a caller-provided order query never proves payment or shipment", async ({ page }) => {
  await page.goto("/thank-you?order=unverified-order");
  await expect(page.getByRole("heading", { name: "No order has been verified" })).toBeVisible();
  await expect(page.getByRole("status").first()).toContainText("does not confirm an order");
  await expect(page.locator("body")).not.toContainText("Order confirmed");
});
