export type Product = {
  slug: string;
  name: string;
  shortName: string;
  eyebrow: string;
  promise: string;
  description: string;
  stage: string;
  cta: string;
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
    stage: "Available by request",
    cta: "Request access",
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
      "Production-ready package",
      "HPOS + legacy lifecycle tested",
      "Guided staging-site installation",
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
];

export function getProduct(slug: string): Product {
  const product = products.find((candidate) => candidate.slug === slug);
  if (!product) throw new Error(`Unknown Fire product: ${slug}`);
  return product;
}
