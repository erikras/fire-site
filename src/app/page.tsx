import { ProductLanding } from "@/components/product-landing";
import { getProduct } from "@/lib/products";

export default function Home() {
  return <ProductLanding product={getProduct("daily-ops")} />;
}
