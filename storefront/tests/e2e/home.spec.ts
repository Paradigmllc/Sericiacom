import { test, expect } from "@playwright/test";
test("home reflects Japanese everyday products without fictional offers", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("everyday discovery");
  await expect(page.getByRole("link", { name: "Explore the collection" })).toHaveAttribute("href", "/products");
  await expect(page.locator('a[href*="drop="]')).toHaveCount(0);
  await expect(page.locator('a[href="/#drop"]')).toHaveCount(0);
  await expect(page.getByText(/48h|Drop No\. 01|50 units/)).toHaveCount(0);
  expect(await page.locator('script[type="application/ld+json"]').allTextContents()).not.toContainEqual(expect.stringContaining('"@type":"Offer"'));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("home.png"), fullPage: true });
});

test("linked brand and policy pages do not invent an operating warehouse", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Japanese discoveries");
  for (const route of ["shipping", "refund"]) {
    await page.goto(`/${route}`);
    await expect(page.getByRole("heading", { name: "Preparing for launch" })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("does not accept orders");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.getByText(/forty-eight|Ninety-five|23\+ countries|USD/)).toHaveCount(0);
  }
});
