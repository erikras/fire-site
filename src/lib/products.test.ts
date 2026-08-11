import { describe, expect, it } from "vitest";
import { getProduct, products } from "./products";

describe("product catalog", () => {
  it("contains only Daily Ops for the Store Canary site", () => {
    expect(products.map((product) => product.slug)).toEqual(["daily-ops"]);
  });

  it("uses established, neutral availability language", () => {
    const dailyOps = getProduct("daily-ops");

    expect(dailyOps.stage).toBe("Available by request");
    expect(dailyOps.cta).toBe("Request access");
    expect(JSON.stringify(dailyOps)).not.toMatch(/beta|early access|waitlist|newly launched/i);
  });

  it("keeps internal HQ and platform projects out of the customer catalog", () => {
    expect(products.map((product) => product.slug)).not.toContain("hq");
    expect(products.map((product) => product.slug)).not.toContain("platform");
  });

  it("fails for an unknown product slug", () => {
    expect(() => getProduct("made-up-product")).toThrow("Unknown Fire product");
  });
});
