# Store Canary Status

## Current phase

Live in production on Cloudflare: one responsive Store Canary landing page for WooCommerce Daily Ops, conservative private-beta claims, a structured email application path, and no browser-side data collection.

## Domain

- Canonical: `https://storecanary.app`
- `www.storecanary.app` redirects to the canonical apex.

## Hosting policy

- Cloudflare is the default hosting and DNS platform.
- Do not deploy to Vercel unless Erik explicitly overrides this policy for a specific project.

## Next task

Configure `storecanary.app` as a secondary domain in the existing Google Workspace, publish authenticated mail DNS through Cloudflare, update the beta CTA to the new address, then recruit the first qualified Daily Ops private-beta participant.

## Deployment evidence

- Cloudflare Worker custom domains: `https://storecanary.app` and `https://www.storecanary.app`
- Cloudflare version: `4f0d74ec-6284-4307-adb4-78897f4f6ef4`
- Public verification: apex HTTPS `200`; HTTP and `www` return canonical `308` redirects.
- Canonical metadata, `robots.txt`, `sitemap.xml`, private-beta CTA, and absence of public ZIP links were verified externally.
- TLS covers the apex and `www` through Google Trust Services.
- The temporary Vercel project was deleted after Cloudflare deployment.

## Guardrails

- Do not publish unrelated Fire products from this domain.
- Do not invent testimonials, users, revenue, compliance, accounting, or release claims.
- Do not add analytics, telemetry, cookies, or a data-collection form without explicit approval and a documented privacy boundary.
