import { describe, expect, it } from "vitest";
import { getProduct, products } from "./products";

describe("product catalog", () => {
  it("contains exactly the five customer-facing Fire products", () => {
    expect(products.map((product) => product.slug)).toEqual([
      "daily-ops",
      "margin-monitor",
      "feed-failure-monitor",
      "accessibility-monitor",
      "scheduled-reports",
    ]);
  });

  it("marks Daily Ops as the approved private-beta product", () => {
    const dailyOps = getProduct("daily-ops");

    expect(dailyOps.stage).toBe("Private beta");
    expect(dailyOps.cta).toBe("Apply for private beta");
    expect(dailyOps.betaApproved).toBe(true);
  });

  it("keeps internal HQ and platform projects out of the customer catalog", () => {
    expect(products.map((product) => product.slug)).not.toContain("hq");
    expect(products.map((product) => product.slug)).not.toContain("platform");
  });

  it("fails for an unknown product slug", () => {
    expect(() => getProduct("made-up-product")).toThrow("Unknown Fire product");
  });
});
