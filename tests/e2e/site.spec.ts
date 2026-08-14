import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { prohibitedMarketingClaims, supportedDailyOpsExceptions } from "../marketing-copy-contract";

async function expectKeyboardAccessPathToWork(page: Page) {
  await page.goto("/");

  const main = page.getByRole("main");
  await expect(main).toHaveCount(1);

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect(main).toBeFocused();

  const requestAccess = main.getByRole("link", { name: "Request access" });
  await page.keyboard.press("Tab");
  await expect(requestAccess).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#apply$/);
  await expect(page.locator("#apply")).toBeInViewport();

  const emailAccessRequest = main.getByRole("link", { name: "Email the access request" });
  await page.keyboard.press("Tab");
  await expect(emailAccessRequest).toBeFocused();
  await expect(emailAccessRequest).toBeInViewport();
  await expect(emailAccessRequest).toHaveAttribute(
    "href",
    /^mailto:homer\.agent\.erik@gmail\.com\?subject=/,
  );
}

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
  await expect(page.getByText(/sales calls?/i)).toHaveCount(0);

  const metadataCopy = await page
    .locator('meta[name="description"], meta[property^="og:"]')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute("content") ?? ""));
  const publicCopy = [
    await page.title(),
    await page.locator("body").innerText(),
    ...metadataCopy,
  ].join(" ");

  for (const exception of supportedDailyOpsExceptions) {
    expect(publicCopy.toLowerCase()).toContain(exception);
  }
  for (const { category, pattern } of prohibitedMarketingClaims) {
    expect(publicCopy, category).not.toMatch(pattern);
  }
});

test("keyboard users can skip the navigation and reach the main content", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);

  const main = page.getByRole("main");
  await expect(main).toBeFocused();
  await expect(
    main.getByRole("heading", { name: /quiet morning check for a busy WooCommerce store/i }),
  ).toBeVisible();
});

test("reduced motion keeps the keyboard access path static and usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectKeyboardAccessPathToWork(page);

  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(
    true,
  );

  const requestAccess = page.getByRole("main").getByRole("link", { name: "Request access" });
  await requestAccess.hover();
  expect(
    await requestAccess.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        animationName: style.animationName,
        transform: style.transform,
        transitionDuration: style.transitionDuration,
      };
    }),
  ).toEqual({
    animationName: "none",
    transform: "none",
    transitionDuration: "0s",
  });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    "auto",
  );
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test("forced colors preserves landmarks, focus, CTAs, and textual status cues", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await expectKeyboardAccessPathToWork(page);

  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);

  const emailAccessRequest = page.getByRole("link", { name: "Email the access request" });
  const focusStyle = await emailAccessRequest.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  expect(focusStyle.outlineStyle).toBe("solid");
  expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(3);

  const previewRows = page.locator(".preview-row");
  await expect(previewRows).toHaveCount(3);
  for (const row of await previewRows.all()) {
    await expect(row.locator(".signal")).toHaveAttribute("aria-hidden", "true");
    await expect(row.locator("span")).not.toHaveText("");
    await expect(row.locator("strong")).not.toHaveText("");
  }
  await expect(page.locator(".product-preview")).toHaveCSS("box-shadow", "none");
});

test("the browser privacy boundary permits only the email CTA", async ({
  baseURL,
  context,
  page,
}) => {
  expect(baseURL).toBeTruthy();
  const firstPartyOrigin = new URL(baseURL!).origin;
  const thirdPartyRequests: string[] = [];
  const cookieResponses: string[] = [];
  const responseHeaderChecks: Promise<void>[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.origin !== firstPartyOrigin
    ) {
      thirdPartyRequests.push(request.url());
    }
  });
  page.on("response", (response) => {
    responseHeaderChecks.push(
      response.allHeaders().then((headers) => {
        if (headers["set-cookie"]) {
          cookieResponses.push(response.url());
        }
      }),
    );
  });

  await page.addInitScript(() => {
    const browserDataWrites: string[] = [];
    Object.defineProperty(window, "__storeCanaryBrowserDataWrites", {
      value: browserDataWrites,
    });

    const cookie = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
    if (cookie?.get && cookie.set) {
      Object.defineProperty(Document.prototype, "cookie", {
        ...cookie,
        set(this: Document, value: string) {
          browserDataWrites.push("document.cookie");
          cookie.set!.call(this, value);
        },
      });
    }

    const wrap = (target: object, method: string, label: string) => {
      const original = Reflect.get(target, method) as (...args: unknown[]) => unknown;
      Reflect.set(target, method, function (this: unknown, ...args: unknown[]) {
        browserDataWrites.push(label);
        return Reflect.apply(original, this, args);
      });
    };

    wrap(Storage.prototype, "setItem", "Storage.setItem");
    wrap(Storage.prototype, "removeItem", "Storage.removeItem");
    wrap(Storage.prototype, "clear", "Storage.clear");
    wrap(indexedDB, "open", "indexedDB.open");
    wrap(indexedDB, "deleteDatabase", "indexedDB.deleteDatabase");
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await Promise.all(responseHeaderChecks);

  const scriptSources = await page
    .locator("script[src]")
    .evaluateAll((scripts) => scripts.map((script) => (script as HTMLScriptElement).src));
  const thirdPartyScripts = scriptSources.filter((source) => {
    const url = new URL(source);
    return (
      (url.protocol === "http:" || url.protocol === "https:") && url.origin !== firstPartyOrigin
    );
  });
  const browserData = await page.evaluate(async () => ({
    indexedDB: (await indexedDB.databases()).map(({ name }) => name),
    localStorage: Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ),
    sessionStorage: Array.from({ length: sessionStorage.length }, (_, index) =>
      sessionStorage.key(index),
    ),
    writes: Reflect.get(window, "__storeCanaryBrowserDataWrites") as string[],
  }));

  expect(await page.locator("form").count()).toBe(0);
  await expect(page.getByRole("link", { name: /email the access request/i })).toHaveAttribute(
    "href",
    /^mailto:/,
  );
  expect(thirdPartyScripts).toEqual([]);
  expect(thirdPartyRequests).toEqual([]);
  expect(cookieResponses).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  expect(browserData).toEqual({
    indexedDB: [],
    localStorage: [],
    sessionStorage: [],
    writes: [],
  });
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
