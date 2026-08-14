import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Store Canary presents Daily Ops as an established product", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Store Canary · WooCommerce Daily Ops/);
  await expect(
    page.getByRole("heading", { name: /quiet morning check for a busy WooCommerce store/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /request access/i }).first()).toHaveAttribute(
    "href",
    "#apply",
  );
  await expect(page.getByRole("link", { name: /email the access request/i })).toHaveAttribute(
    "href",
    /^mailto:homer\.agent\.erik@gmail\.com\?subject=/,
  );
  await expect(page.getByText("Store URL")).toBeVisible();
  await expect(page.getByText("Your role")).toBeVisible();
  await expect(page.getByText(/WooCommerce version, if known/i)).toBeVisible();
  await expect(page.getByText("homer.agent.erik@gmail.com")).toBeVisible();
  await expect(page.getByText(/beta|early access|waitlist/i)).toHaveCount(0);
  await expect(page.getByText(/sales calls?/i)).toHaveCount(0);
});

test("the landing page emits canonical Store Canary metadata", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Store Canary · WooCommerce Daily Ops");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://storecanary.app",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Catch stuck paid orders, failed payments, new stockouts, and broken scheduled actions in one concise WooCommerce daily digest.",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://storecanary.app",
  );
});

test("robots.txt allows all crawlers and names the canonical sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  const body = await response.text();

  expect(response.ok()).toBe(true);
  expect(body).toMatch(/^User-Agent: \*$/m);
  expect(body).toMatch(/^Allow: \/$/m);
  expect(body).not.toMatch(/^Disallow:/m);
  expect(body).toMatch(/^Sitemap: https:\/\/storecanary\.app\/sitemap\.xml$/m);
});

test("sitemap.xml lists only the canonical landing page", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  const body = await response.text();

  expect(response.ok()).toBe(true);
  expect(body.match(/<url>/g) ?? []).toHaveLength(1);
  expect(body.match(/<loc>/g) ?? []).toHaveLength(1);
  expect(body).toContain("<loc>https://storecanary.app</loc>");
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
