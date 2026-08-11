import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://storecanary.app"),
  title: "Store Canary · WooCommerce Daily Ops",
  description:
    "Catch stuck paid orders, failed payments, new stockouts, and broken scheduled actions in one concise WooCommerce daily digest.",
  openGraph: {
    title: "Store Canary · WooCommerce Daily Ops",
    description: "The quiet morning check for a busy WooCommerce store.",
    url: "https://storecanary.app",
    siteName: "Store Canary",
    type: "website",
  },
  alternates: { canonical: "https://storecanary.app" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
