# Store Canary

Public marketing site for **WooCommerce Daily Ops**, deployed at [storecanary.app](https://storecanary.app).

Store Canary catches stuck paid orders, failed payments, new stockouts, and broken scheduled actions, then turns them into one concise daily digest. The site presents an established product that is available by request without claiming public availability.

## Development

```bash
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
yarn format:check
yarn audit --level high
```

## Product claims

[`docs/MARKETING.md`](docs/MARKETING.md) is the source of truth for public marketing claims. Keep it aligned with `PROJECT_STATUS.md`, `ARCHITECTURE.md`, and supported product evidence. Do not claim public availability, pricing, customers, compliance, or production evidence that the product repository does not support.

The access request opens a structured email to Fire's asynchronous operator inbox. The site itself collects no form data.
