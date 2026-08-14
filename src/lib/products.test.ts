import { describe, expect, it } from "vitest";
import { supportedDailyOpsExceptions } from "../../tests/marketing-copy-contract";
import { getProduct, products } from "./products";

describe("product catalog", () => {
  it("contains only Daily Ops for the Store Canary site", () => {
    expect(products.map((product) => product.slug)).toEqual(["daily-ops"]);
  });

  it("names every supported Daily Ops exception and no extra capability", () => {
    const dailyOps = getProduct("daily-ops");

    expect(dailyOps.description).toBe(
      "Daily Ops finds operational exceptions—stuck paid orders, failed payments, new stockouts, and broken scheduled actions—and turns them into one concise, actionable digest.",
    );
    expect(dailyOps.features).toEqual([
      "Stuck paid-order detection",
      "Failed-payment monitoring",
      "New stockout alerts",
      "Broken scheduled-action checks",
      "One concise daily digest",
      "Local-first, no customer-data telemetry",
    ]);

    for (const exception of supportedDailyOpsExceptions) {
      expect(dailyOps.description).toContain(exception);
    }
  });

  it("keeps the approved audience, positioning, and evidence claims exact", () => {
    const dailyOps = getProduct("daily-ops");

    expect({
      name: dailyOps.name,
      eyebrow: dailyOps.eyebrow,
      promise: dailyOps.promise,
      audience: dailyOps.audience,
      proof: dailyOps.proof,
    }).toEqual({
      name: "WooCommerce Daily Ops",
      eyebrow: "Know what needs attention before your customers tell you",
      promise: "The quiet morning check for a busy WooCommerce store.",
      audience:
        "Store owners and WooCommerce operators who want fewer surprises and less dashboard patrol.",
      proof: [
        "Production-ready package",
        "HPOS + legacy lifecycle tested",
        "Guided staging-site installation",
      ],
    });
  });

  it("uses established, neutral availability language", () => {
    const dailyOps = getProduct("daily-ops");

    expect(dailyOps.stage).toBe("Available by request");
    expect(dailyOps.cta).toBe("Request access");
    expect(JSON.stringify(dailyOps)).not.toMatch(
      /private beta|beta|early access|waitlist|newly launched|launching soon/i,
    );
  });

  it("keeps the Daily Ops preview consistent with its two checks needing attention", () => {
    const preview = getProduct("daily-ops").preview;

    expect(preview.label).toBe("Today’s checks");
    expect(preview.headline).toBe("Two things need a human");
    expect(preview.rows).toEqual([
      { label: "Paid order stuck in processing", value: "2d 7h", tone: "hot" },
      { label: "Failed payment", value: "$184.00", tone: "warm" },
      { label: "WooCommerce actions", value: "Healthy", tone: "calm" },
    ]);
    expect(preview.rows.filter(({ tone }) => tone !== "calm")).toHaveLength(2);
  });

  it("keeps internal HQ and platform projects out of the customer catalog", () => {
    expect(products.map((product) => product.slug)).not.toContain("hq");
    expect(products.map((product) => product.slug)).not.toContain("platform");
  });

  it("fails for an unknown product slug", () => {
    expect(() => getProduct("made-up-product")).toThrow("Unknown Fire product");
  });
});
