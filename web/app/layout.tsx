import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { siteUrl } from "@/lib/env";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const description = "Simple, privacy-friendly analytics for solo developers and small products.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tinylytics | Simple, privacy-friendly analytics",
    template: "%s | Tinylytics",
  },
  description,
  applicationName: "Tinylytics",
  openGraph: {
    type: "website",
    siteName: "Tinylytics",
    title: "Tinylytics | Simple, privacy-friendly analytics",
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tinylytics | Simple, privacy-friendly analytics",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2eb" },
    { media: "(prefers-color-scheme: dark)", color: "#121210" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border-[1.5px] focus:border-ink focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
