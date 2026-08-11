export type ProductStage = "Private beta" | "Beta preparation" | "In development";

export type Product = {
  slug: string;
  name: string;
  shortName: string;
  eyebrow: string;
  promise: string;
  description: string;
  stage: ProductStage;
  cta: string;
  betaApproved: boolean;
  audience: string;
  features: string[];
  proof: string[];
  preview: {
    label: string;
    headline: string;
    rows: Array<{ label: string; value: string; tone: "hot" | "warm" | "calm" }>;
  };
};

export const products: Product[] = [
  {
    slug: "daily-ops",
    name: "WooCommerce Daily Ops",
    shortName: "Daily Ops",
    eyebrow: "Know what needs attention before your customers tell you",
    promise: "The quiet morning check for a busy WooCommerce store.",
    description:
      "Daily Ops finds operational exceptions—stuck paid orders, failed payments, new stockouts, and broken scheduled actions—and turns them into one concise, actionable digest.",
    stage: "Private beta",
    cta: "Apply for private beta",
    betaApproved: true,
    audience:
      "Store owners and WooCommerce operators who want fewer surprises and less dashboard patrol.",
    features: [
      "Stuck paid-order detection",
      "Failed-payment monitoring",
      "New stockout alerts",
      "Broken scheduled-action checks",
      "One concise daily digest",
      "Local-first, no customer-data telemetry",
    ],
    proof: [
      "Packaged beta",
      "HPOS + legacy lifecycle tested",
      "Owner-approved private distribution",
    ],
    preview: {
      label: "Today’s exceptions",
      headline: "Three things need a human",
      rows: [
        { label: "Paid order stuck in processing", value: "2d 7h", tone: "hot" },
        { label: "Failed payment", value: "$184.00", tone: "warm" },
        { label: "WooCommerce actions", value: "Healthy", tone: "calm" },
      ],
    },
  },
  {
    slug: "margin-monitor",
    name: "WooCommerce Margin Monitor",
    shortName: "Margin Monitor",
    eyebrow: "Revenue is vanity. Contribution margin pays the bills.",
    promise: "See which sales make money—and which quietly burn it.",
    description:
      "Margin Monitor combines product costs, discounts, shipping, refunds, and gateway-fee assumptions into a transparent contribution-margin view with deterministic alerts.",
    stage: "Beta preparation",
    cta: "Join the beta waitlist",
    betaApproved: false,
    audience:
      "WooCommerce merchants who need operational profit visibility without pretending a plugin is an accounting firm.",
    features: [
      "Product and variation costs",
      "Order-level margin breakdowns",
      "Negative-margin alerts",
      "Discount and shipping leakage",
      "Refund-adjusted contribution",
      "Clear calculation diagnostics",
    ],
    proof: ["MVP workflow complete", "Deterministic beta package", "Real-environment QA underway"],
    preview: {
      label: "Contribution margin",
      headline: "Order #4812 crossed your floor",
      rows: [
        { label: "Net sales", value: "$212.00", tone: "calm" },
        { label: "Product + fulfilment costs", value: "$196.40", tone: "warm" },
        { label: "Contribution margin", value: "7.4%", tone: "hot" },
      ],
    },
  },
  {
    slug: "feed-failure-monitor",
    name: "WooCommerce Feed Failure Monitor",
    shortName: "Feed Monitor",
    eyebrow: "Catch catalog regressions before shopping channels do",
    promise: "Your product feed should not fail silently.",
    description:
      "Feed Monitor validates local catalog data, tracks feed-run changes, groups failures by cause, and prioritizes the problems most likely to hurt revenue.",
    stage: "Beta preparation",
    cta: "Join the beta waitlist",
    betaApproved: false,
    audience:
      "Merchants and agencies responsible for keeping WooCommerce catalogs healthy across shopping channels.",
    features: [
      "Required-attribute validation",
      "Price and availability checks",
      "Feed-run history and diffs",
      "Product-count regression alerts",
      "Cause-based error grouping",
      "Revenue-weighted prioritization",
    ],
    proof: ["Closed-beta package", "Installed HPOS QA passed", "Legacy-store QA next"],
    preview: {
      label: "Catalog readiness",
      headline: "A feed regression began after yesterday’s edit",
      rows: [
        { label: "Products ready", value: "1,842", tone: "calm" },
        { label: "Missing identifiers", value: "17", tone: "hot" },
        { label: "Estimated revenue affected", value: "$2,410", tone: "warm" },
      ],
    },
  },
  {
    slug: "accessibility-monitor",
    name: "WordPress Accessibility Monitor",
    shortName: "Accessibility Monitor",
    eyebrow: "Know when a routine site change creates a new barrier",
    promise: "Monitor accessibility regressions, not just one-off audit scores.",
    description:
      "Accessibility Monitor establishes a baseline, detects newly introduced issues after content or code changes, and produces defensible monitoring reports for agencies.",
    stage: "Beta preparation",
    cta: "Join the beta waitlist",
    betaApproved: false,
    audience:
      "WordPress agencies that need repeatable monitoring evidence across ongoing client work.",
    features: [
      "Baseline and scheduled scans",
      "Regression diffing",
      "Severity and page grouping",
      "Accepted-risk workflow",
      "White-label monitoring reports",
      "Explicit non-compliance disclaimer",
    ],
    proof: [
      "MVP backlog complete",
      "Packaged artifact verified",
      "Representative staging evaluation next",
    ],
    preview: {
      label: "Regression report",
      headline: "Two new barriers appeared after deployment",
      rows: [
        { label: "New critical issues", value: "2", tone: "hot" },
        { label: "Existing accepted risks", value: "6", tone: "warm" },
        { label: "Pages unchanged", value: "94%", tone: "calm" },
      ],
    },
  },
  {
    slug: "scheduled-reports",
    name: "WooCommerce Scheduled Reports",
    shortName: "Scheduled Reports",
    eyebrow: "Stop rebuilding the same spreadsheet every Monday",
    promise: "The right WooCommerce report, delivered to the right person.",
    description:
      "Scheduled Reports turns saved operational views into deterministic CSV deliveries with history, failure visibility, and retry controls.",
    stage: "In development",
    cta: "Join the product waitlist",
    betaApproved: false,
    audience:
      "Stores that repeatedly export fulfilment, supplier, accounting, or renewal data by hand.",
    features: [
      "Fulfilment reports by warehouse",
      "Supplier sales by SKU",
      "Monthly accountant exports",
      "Renewal forecasts",
      "Deterministic CSV columns",
      "Delivery history and retries",
    ],
    proof: [
      "Core report engine built",
      "Deterministic package verification",
      "Delivery-history work active",
    ],
    preview: {
      label: "Delivery schedule",
      headline: "Reports arrive without the Monday spreadsheet ritual",
      rows: [
        { label: "Warehouse fulfilment", value: "Daily · 07:00", tone: "calm" },
        { label: "Supplier sales", value: "Mondays", tone: "calm" },
        { label: "Last delivery", value: "Delivered", tone: "calm" },
      ],
    },
  },
];

export function getProduct(slug: string): Product {
  const product = products.find((candidate) => candidate.slug === slug);
  if (!product) throw new Error(`Unknown Fire product: ${slug}`);
  return product;
}
