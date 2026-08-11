# Store Canary Architecture

## Boundary

This repository owns the public Store Canary / WooCommerce Daily Ops explanation, owner-approved private-beta call to action, metadata, and static interface preview. It owns no customer identity, billing, entitlement, license, installation credential, plugin artifact, or merchant operational data.

## Runtime

- Next.js App Router
- One statically rendered public product page at `storecanary.app`
- Static export deployed with Cloudflare Workers Static Assets; Cloudflare is the default hosting and DNS platform
- No database, cookies, analytics, telemetry, or third-party browser scripts
- Email application link only; no submitted data passes through this application
- Unrelated Fire products are intentionally not published from this domain

## Product truth

Product copy is derived from `fire-daily-ops/PRODUCT_SPEC.md` and `fire-daily-ops/PROJECT_STATUS.md`. Availability remains explicitly **private beta** until the owner authorizes a broader release.

## Future integration

When Fire Platform exposes an approved, rate-limited public acquisition API, the email CTA may be replaced by a bounded form. That integration must include privacy disclosure, abuse controls, consent, retention, deletion, and delivery/reconciliation evidence before launch.
