export const supportedDailyOpsExceptions = [
  "stuck paid orders",
  "failed payments",
  "new stockouts",
  "broken scheduled actions",
] as const;

export const prohibitedMarketingClaims: ReadonlyArray<{
  category: string;
  pattern: RegExp;
}> = [
  {
    category: "unsupported company-size, volume, geography, industry, budget, or maturity claims",
    pattern:
      /\b(?:for (?:small|large|enterprise|high-volume|low-volume) (?:companies|businesses|stores)|\d[\d,]*\+? orders? per (?:day|month|year)|(?:North American|European|US|U\.S\.) stores?|(?:retail|fashion|food) industry|budget|technical maturity)\b/i,
  },
  {
    category: "invented customer, user, or adoption evidence",
    pattern:
      /\b(?:trusted by|used by|serving|join)\s+(?:more than\s+)?\d[\d,]*\+?\s+(?:customers?|users?|stores?)\b|\b(?:adoption|paid customers?|customer count|user count)\b/i,
  },
  {
    category: "revenue, sales, or payment history",
    pattern: /\b(?:revenue|sales|payment history|payments? processed|orders? processed)\b/i,
  },
  {
    category: "testimonials, endorsements, case studies, or customer outcomes",
    pattern:
      /\b(?:testimonials?|endorsements?|case stud(?:y|ies)|customer outcomes?|success stor(?:y|ies))\b/i,
  },
  {
    category: "certification, compliance, audit, or accounting claims",
    pattern:
      /\b(?:certifications?|certified|regulatory compliance|compliant|security audits?|audited|accounting conclusions?)\b/i,
  },
  {
    category: "public or self-service availability",
    pattern:
      /\b(?:publicly available|public availability|self[- ]service(?: availability| sign-?up| access)?|available to (?:everyone|the public)|instant access)\b/i,
  },
  {
    category: "speculative lifecycle or launch labels",
    pattern: /\b(?:private beta|beta|early access|waitlist|newly launched|launching soon)\b/i,
  },
  {
    category: "pricing, checkout, subscriptions, or payment offers",
    pattern:
      /\b(?:pricing|price plans?|checkout|subscriptions?|accepted payment methods?|credit cards?|buy now|purchase now|active commercial offer)\b/i,
  },
  {
    category: "unsupported cloud, automation, integration, release, or production claims",
    pattern:
      /\b(?:(?:includes?|provides?|uses?|runs?|offers?) (?:an? |the )?(?:cloud dashboard|data pipeline|automation|remediation)|automatically (?:fixes|resolves|remediates)|automated remediation|integrates? with|release evidence|production outcomes?)\b/i,
  },
  {
    category: "unrelated Fire products",
    pattern:
      /\b(?:Margin Monitor|Feed Failure Monitor|Accessibility Monitor|Scheduled Reports|Fire HQ|Fire Platform)\b/i,
  },
];
