import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Store Canary home">
        <span className="brand-mark" aria-hidden="true">
          SC
        </span>
        <span>Store Canary</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="#how-it-works">How it works</Link>
        <Link href="#apply">Request access</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <span className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">
            SC
          </span>
          Store Canary
        </span>
        <p>WooCommerce Daily Ops, without the dashboard patrol.</p>
      </div>
      <p>Built by Form Nerd, LLC.</p>
    </footer>
  );
}
