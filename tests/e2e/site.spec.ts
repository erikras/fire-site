import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Store Canary presents the Daily Ops private beta", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Store Canary · WooCommerce Daily Ops/);
  await expect(
    page.getByRole("heading", { name: /quiet morning check for a busy WooCommerce store/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /apply for private beta/i })).toHaveAttribute(
    "href",
    "#apply",
  );
  await expect(page.getByRole("link", { name: /email the beta application/i })).toHaveAttribute(
    "href",
    /^mailto:homer\.agent\.erik@gmail\.com\?subject=/,
  );
});

test("the site does not expose unrelated Fire product pages", async ({ page }) => {
  for (const slug of [
    "margin-monitor",
    "feed-failure-monitor",
    "accessibility-monitor",
    "scheduled-reports",
  ]) {
    const response = await page.goto(`/products/${slug}`);
    expect(response?.status()).toBe(404);
  }
});

test("Store Canary has no horizontal overflow or detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
