# Store Canary

Public marketing site for **WooCommerce Daily Ops**, deployed at [storecanary.app](https://storecanary.app).

Store Canary catches stuck paid orders, failed payments, new stockouts, and broken scheduled actions, then turns them into one concise daily digest. The site presents an established product that is available by request without claiming public availability.

## Development

Use Node 22 and enable Corepack so the `package.json` Yarn 1.22.22 pin is honored:

```bash
corepack enable
yarn
yarn dev
```

## Hosting

Cloudflare is the default hosting and DNS platform. Production is a static Next.js export deployed with Cloudflare Workers Static Assets:

```bash
yarn deploy:cloudflare
```

Do not deploy this project to Vercel unless Erik explicitly overrides the hosting policy.

## Quality gate

```bash
yarn lint
yarn typecheck
yarn test
yarn test:e2e
yarn build
yarn test:export
yarn test:wrangler
yarn format:check
yarn audit --level high
```

`test:wrangler` starts local HTTP and HTTPS `wrangler dev --local` servers against the
built `out/` directory. It disables Wrangler telemetry and needs neither Cloudflare
credentials nor a deployment.

## Product claims

[`docs/MARKETING.md`](docs/MARKETING.md) is the source of truth for public marketing claims. Keep it aligned with `PROJECT_STATUS.md`, `ARCHITECTURE.md`, and supported product evidence. Do not claim public availability, pricing, customers, compliance, or production evidence that the product repository does not support.

The access request opens a structured email to Fire's asynchronous operator inbox. The site itself collects no form data.
