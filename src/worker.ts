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

const allowedMethods = new Set(["GET", "HEAD"]);

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(securityHeaders)) {
    headers.set(name, value);
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
      return withSecurityHeaders(
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
      return withSecurityHeaders(Response.redirect(url.toString(), 308));
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },
};

export default worker;
