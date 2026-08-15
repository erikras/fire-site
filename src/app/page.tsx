import type { Metadata } from "next";
import { ProductLanding } from "@/components/product-landing";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "Store Canary · WooCommerce Daily Ops",
};

export default function Home() {
  return <ProductLanding product={getProduct("daily-ops")} />;
}
