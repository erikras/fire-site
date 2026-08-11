# Store Canary Status

## Current phase

Production launch of the Store Canary marketing site for WooCommerce Daily Ops: one responsive public landing page, conservative private-beta claims, a structured email application path, and no browser-side data collection.

## Domain

- Canonical: `https://storecanary.app`
- `www.storecanary.app` should redirect to the canonical apex.

## Hosting policy

- Cloudflare is the default hosting and DNS platform.
- Do not deploy to Vercel unless Erik explicitly overrides this policy for a specific project.

## Next task

Deploy the verified site from Cloudflare Workers Static Assets, activate `storecanary.app` in Cloudflare DNS, attach the apex and `www` custom domains, confirm HTTPS, public metadata, application CTA, and external accessibility behavior, then recruit the first qualified Daily Ops private-beta participant.

## Deployment evidence

- Cloudflare Worker preview: `https://store-canary.formnerd.workers.dev`
- Cloudflare version: `1280f19c-15ab-4704-92af-48c69cdbcf7b`
- The temporary Vercel project was deleted after Cloudflare deployment.

## Guardrails

- Do not publish unrelated Fire products from this domain.
- Do not invent testimonials, users, revenue, compliance, accounting, or release claims.
- Do not add analytics, telemetry, cookies, or a data-collection form without explicit approval and a documented privacy boundary.
