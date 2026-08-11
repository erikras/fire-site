import type { Product } from "@/lib/products";
import { ProductPreview } from "./product-preview";
import { SiteFooter, SiteHeader } from "./site-shell";

function contactHref(product: Product) {
  const subject = encodeURIComponent(`${product.shortName} access request`);
  const body = encodeURIComponent(
    `Hi Store Canary team,\n\nI’m interested in ${product.name}.\n\nStore URL:\nMy role:\nWhat I want this product to solve:\nWooCommerce version (if known):\n\nThanks,`,
  );
  return `mailto:homer.agent.erik@gmail.com?subject=${subject}&body=${body}`;
}

export function ProductLanding({ product }: { product: Product }) {
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
          <p className="section-number">02 / Get Daily Ops</p>
          <div className="apply-grid">
            <div>
              <h2>Put Daily Ops to work on your store.</h2>
              <p>
                Tell us about your WooCommerce setup and the operational checks that consume your
                time. We’ll confirm compatibility and guide installation on a backed-up staging site
                before production.
              </p>
            </div>
            <div className="application-card">
              <span className="stage-badge">{product.stage}</span>
              <strong>Guided staging-site installation</strong>
              <p>
                Send your store, role, and the operational problem you want fixed. We’ll reply with
                the right installation path.
              </p>
              <a className="button button-primary" href={contactHref(product)}>
                Email the access request
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
