import { beforeEach, describe, expect, it, vi } from "vitest";
import worker from "./worker";

const assets = { fetch: vi.fn(async () => new Response("asset", { status: 200 })) };
const expectedSecurityHeaders = {
  "content-security-policy":
    "default-src 'self'; base-uri 'none'; connect-src 'self'; font-src 'self'; form-action 'none'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests",
  "permissions-policy":
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
};

function expectSecurityHeaders(response: Response) {
  for (const [name, value] of Object.entries(expectedSecurityHeaders)) {
    expect(response.headers.get(name)).toBe(value);
  }
}

describe("Store Canary edge handler", () => {
  beforeEach(() => {
    assets.fetch.mockClear();
  });

  it("redirects HTTP requests to HTTPS", async () => {
    const response = await worker.fetch(
      new Request("http://storecanary.app/example-path?source=redirect-test"),
      { ASSETS: assets },
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://storecanary.app/example-path?source=redirect-test",
    );
    expectSecurityHeaders(response);
  });

  it("redirects www to the canonical apex and preserves path and query", async () => {
    const response = await worker.fetch(
      new Request("https://www.storecanary.app/example-path?source=redirect-test"),
      { ASSETS: assets },
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://storecanary.app/example-path?source=redirect-test",
    );
    expectSecurityHeaders(response);
    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it("serves GET and HEAD requests from static assets", async () => {
    for (const method of ["GET", "HEAD"]) {
      for (const url of [
        "https://storecanary.app/",
        "https://store-canary.formnerd.workers.dev/",
      ]) {
        const request = new Request(url, { method });
        const response = await worker.fetch(request, { ASSETS: assets });
        expect(response.status).toBe(200);
        expect(assets.fetch).toHaveBeenCalledWith(request);
        expectSecurityHeaders(response);
      }
    }
  });

  it("rejects methods outside GET and HEAD with a deterministic 405", async () => {
    for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
      const response = await worker.fetch(
        new Request("http://www.storecanary.app/mutating-path", { method }),
        { ASSETS: assets },
      );

      expect(response.status).toBe(405);
      expect(response.headers.get("allow")).toBe("GET, HEAD");
      expect(response.headers.get("location")).toBeNull();
      expect(await response.text()).toBe("");
      expectSecurityHeaders(response);
    }

    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it("preserves the asset response while replacing its security policy", async () => {
    assets.fetch.mockResolvedValueOnce(
      new Response("not found", {
        status: 404,
        headers: {
          "cache-control": "public, max-age=60",
          "content-type": "text/html; charset=utf-8",
          "x-frame-options": "SAMEORIGIN",
        },
      }),
    );

    const response = await worker.fetch(new Request("https://storecanary.app/missing"), {
      ASSETS: assets,
    });

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("not found");
    expect(response.headers.get("cache-control")).toBe("public, max-age=60");
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expectSecurityHeaders(response);
  });
});
