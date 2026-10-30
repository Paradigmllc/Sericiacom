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
