import { beforeEach, describe, expect, it, vi } from "vitest";
import worker from "./worker";

const assets = { fetch: vi.fn(async () => new Response("asset", { status: 200 })) };

describe("Store Canary edge handler", () => {
  beforeEach(() => {
    assets.fetch.mockClear();
  });

  it("redirects HTTP requests to HTTPS", async () => {
    const response = await worker.fetch(
      new Request("http://storecanary.app/private-beta?source=nav"),
      { ASSETS: assets },
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://storecanary.app/private-beta?source=nav",
    );
  });

  it("redirects www to the canonical apex and preserves path and query", async () => {
    const response = await worker.fetch(
      new Request("https://www.storecanary.app/private-beta?source=nav"),
      { ASSETS: assets },
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://storecanary.app/private-beta?source=nav",
    );
    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it("serves apex and workers.dev requests from static assets", async () => {
    for (const url of ["https://storecanary.app/", "https://store-canary.formnerd.workers.dev/"]) {
      const request = new Request(url);
      const response = await worker.fetch(request, { ASSETS: assets });
      expect(response.status).toBe(200);
      expect(assets.fetch).toHaveBeenCalledWith(request);
    }
  });
});
