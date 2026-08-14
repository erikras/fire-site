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
const immutableCacheControl = "public, max-age=31536000, immutable";
const noStoreCacheControl = "no-store";

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

  it("caches successful _next/static assets as immutable for one year", async () => {
    for (const path of [
      "/_next/static/chunks/app.2f6c7a91.js",
      "/_next/static/media/font.4e8b1c20.woff2",
    ]) {
      assets.fetch.mockResolvedValueOnce(
        new Response("immutable asset", {
          headers: { "cache-control": "public, max-age=60" },
        }),
      );

      const response = await worker.fetch(new Request(`https://storecanary.app${path}`), {
        ASSETS: assets,
      });

      expect(response.headers.get("cache-control")).toBe(immutableCacheControl);
      expectSecurityHeaders(response);
    }
  });

  it("prevents HTML responses from being stored", async () => {
    assets.fetch.mockResolvedValueOnce(
      new Response("<!doctype html><title>Store Canary</title>", {
        headers: {
          "cache-control": "public, max-age=3600",
          "content-type": "text/html; charset=utf-8",
        },
      }),
    );

    const response = await worker.fetch(new Request("https://storecanary.app/"), {
      ASSETS: assets,
    });

    expect(response.headers.get("cache-control")).toBe(noStoreCacheControl);
  });

  it("prevents robots and sitemap metadata from being stored", async () => {
    for (const [path, contentType] of [
      ["/robots.txt", "text/plain"],
      ["/sitemap.xml", "application/xml"],
    ]) {
      assets.fetch.mockResolvedValueOnce(
        new Response("metadata", {
          headers: {
            "cache-control": "public, max-age=86400",
            "content-type": contentType,
          },
        }),
      );

      const response = await worker.fetch(new Request(`https://storecanary.app${path}`), {
        ASSETS: assets,
      });

      expect(response.headers.get("cache-control")).toBe(noStoreCacheControl);
    }
  });

  it("does not cache missing _next/static assets as immutable", async () => {
    assets.fetch.mockResolvedValueOnce(
      new Response("not found", {
        status: 404,
        headers: {
          "cache-control": immutableCacheControl,
          "content-type": "application/javascript",
        },
      }),
    );

    const response = await worker.fetch(
      new Request("https://storecanary.app/_next/static/chunks/missing.js"),
      { ASSETS: assets },
    );

    expect(response.headers.get("cache-control")).toBe(noStoreCacheControl);
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

  it("preserves the asset response while replacing its response policies", async () => {
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
    expect(response.headers.get("cache-control")).toBe(noStoreCacheControl);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expectSecurityHeaders(response);
  });
});
