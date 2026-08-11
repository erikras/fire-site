import type { Product } from "@/lib/products";

export function ProductPreview({ product }: { product: Product }) {
  return (
    <div className="product-preview" aria-label={`${product.shortName} interface preview`}>
      <div className="preview-chrome">
        <span />
        <span />
        <span />
        <small>{product.preview.label}</small>
      </div>
      <div className="preview-body">
        <p className="preview-kicker">{product.shortName}</p>
        <h2>{product.preview.headline}</h2>
        <div className="preview-rows">
          {product.preview.rows.map((row) => (
            <div className="preview-row" key={row.label}>
              <span>
                <i className={`signal signal-${row.tone}`} aria-hidden="true" />
                {row.label}
              </span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
