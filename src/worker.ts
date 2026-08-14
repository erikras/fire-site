type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

type Env = {
  ASSETS: AssetsBinding;
};

const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'none'",
    "connect-src 'self'",
    "font-src 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "upgrade-insecure-requests",
  ].join("; "),
  "Permissions-Policy":
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

const cacheControl = {
  immutable: "public, max-age=31536000, immutable",
  noStore: "no-store",
} as const;

const metadataPaths = new Set(["/robots.txt", "/sitemap.xml"]);
const allowedMethods = new Set(["GET", "HEAD"]);

function cachePolicy(url: URL, response: Response): string | undefined {
  if (
    url.pathname.startsWith("/_next/static/") &&
    response.status >= 200 &&
    response.status < 400
  ) {
    return cacheControl.immutable;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase();

  if (
    metadataPaths.has(url.pathname) ||
    contentType?.startsWith("text/html") ||
    response.status >= 400
  ) {
    return cacheControl.noStore;
  }
}

function withResponseHeaders(response: Response, cacheControlValue?: string): Response {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(securityHeaders)) {
    headers.set(name, value);
  }

  if (cacheControlValue) {
    headers.set("Cache-Control", cacheControlValue);
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!allowedMethods.has(request.method)) {
      return withResponseHeaders(
        new Response(null, {
          headers: { Allow: "GET, HEAD" },
          status: 405,
        }),
      );
    }

    const url = new URL(request.url);
    const mustRedirect = url.protocol === "http:" || url.hostname === "www.storecanary.app";

    if (mustRedirect) {
      url.protocol = "https:";
      url.hostname = "storecanary.app";
      return withResponseHeaders(Response.redirect(url.toString(), 308));
    }

    const response = await env.ASSETS.fetch(request);
    return withResponseHeaders(response, cachePolicy(url, response));
  },
};

export default worker;
