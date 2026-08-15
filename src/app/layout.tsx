import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { getProduct } from "@/lib/products";
import { SITE_ORIGIN, SOCIAL_IMAGE } from "@/lib/site-metadata";
import "./globals.css";

const sans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });
const dailyOps = getProduct("daily-ops");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "Store Canary · WooCommerce Daily Ops",
  description:
    "Catch stuck paid orders, failed payments, new stockouts, and broken scheduled actions in one concise WooCommerce daily digest.",
  openGraph: {
    title: dailyOps.promise,
    description: dailyOps.offer,
    url: SITE_ORIGIN,
    siteName: "Store Canary",
    images: [SOCIAL_IMAGE],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: dailyOps.promise,
    description: dailyOps.offer,
    images: [SOCIAL_IMAGE],
  },
  alternates: { canonical: SITE_ORIGIN },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
