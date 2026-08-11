import type { Product } from "@/lib/products";
import { ProductPreview } from "./product-preview";
import { SiteFooter, SiteHeader } from "./site-shell";

function contactHref(product: Product) {
  const subject = encodeURIComponent(
    `${product.shortName} ${product.betaApproved ? "private beta application" : "waitlist"}`,
  );
  const body = encodeURIComponent(
    `Hi Fire team,\n\nI’m interested in ${product.name}.\n\nStore URL:\nMy role:\nWhat I want this product to solve:\nWooCommerce version (if known):\n\nThanks,`,
  );
  return `mailto:homer.agent.erik@gmail.com?subject=${subject}&body=${body}`;
}

export function ProductLanding({ product }: { product: Product }) {
  const actionLabel = product.betaApproved ? "Email the beta application" : product.cta;
  return (
    <>
      <SiteHeader />
      <main>
        <section className="product-hero section-shell">
          <div className="product-copy">
            <span className="stage-badge">{product.stage}</span>
            <p className="eyebrow">{product.eyebrow}</p>
            <h1>{product.promise}</h1>
            <p className="lede">{product.description}</p>
            <a className="button button-primary" href="#apply">
              {product.cta}
            </a>
          </div>
          <ProductPreview product={product} />
        </section>

        <section className="split-section section-shell" id="how-it-works">
          <div>
            <p className="section-number">01 / What it does</p>
            <h2>Operational truth without another cloud dashboard.</h2>
            <p>{product.audience}</p>
          </div>
          <ul className="feature-list">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section className="proof-strip" aria-label="Product readiness evidence">
          {product.proof.map((item, index) => (
            <div key={item}>
              <span>0{index + 1}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </section>

        <section className="apply-section section-shell" id="apply">
          <p className="section-number">02 / Get involved</p>
          <div className="apply-grid">
            <div>
              <h2>
                {product.betaApproved
                  ? "Run it on a real store. Tell us where it hurts."
                  : "Get notified when the next test cohort opens."}
              </h2>
              <p>
                {product.betaApproved
                  ? "We’re inviting a small number of WooCommerce operators. Start on a backed-up staging site, follow the test checklist, and keep a private feedback channel open. No public release theater."
                  : "Tell us what you operate and what problem you need solved. We’ll contact you when this product reaches the right beta stage."}
              </p>
            </div>
            <div className="application-card">
              <span className="stage-badge">{product.stage}</span>
              {product.betaApproved && <strong>Owner-approved private distribution</strong>}
              <p>
                Send a short application with your store, role, and the operational problem you want
                fixed.
              </p>
              <a className="button button-primary" href={contactHref(product)}>
                {actionLabel}
              </a>
              <small>Email opens in your default mail app. No sales call required.</small>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
