import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { siteUrl } from "@/lib/env";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const description = "Simple, privacy-friendly analytics for solo developers and small products. Track website visitors, page views, and traffic sources without cookies. Open-source, GDPR-compliant, and self-hostable.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tinylytics - Simple Privacy-Friendly Web Analytics Without Cookies",
    template: "%s | Tinylytics",
  },
  description,
  applicationName: "Tinylytics",
  keywords: [
    "web analytics",
    "privacy-friendly analytics",
    "cookie-free analytics",
    "GDPR compliant analytics",
    "open source analytics",
    "self-hosted analytics",
    "website visitor tracking",
    "page view analytics",
    "traffic analytics",
    "simple analytics",
    "lightweight analytics",
    "analytics for developers",
    "analytics without cookies",
    "privacy-focused analytics",
    "anonymous analytics",
    "Google Analytics alternative",
    "website statistics",
    "real-time analytics",
    "minimal analytics",
    "analytics dashboard",
  ],
  authors: [{ name: "Tinylytics Team" }],
  creator: "Tinylytics",
  publisher: "Tinylytics",
  category: "Analytics & Monitoring",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Tinylytics",
    title: "Tinylytics - Simple Privacy-Friendly Web Analytics Without Cookies",
    description,
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Tinylytics - Analytics without the noise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tinylytics - Simple Privacy-Friendly Web Analytics Without Cookies",
    description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2eb" },
    { media: "(prefers-color-scheme: dark)", color: "#121210" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Tinylytics",
    description:
      "Simple, privacy-friendly analytics for solo developers and small products. Track website visitors, page views, and traffic sources without cookies.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      ratingCount: "1",
    },
    featureList: [
      "Privacy-friendly visitor tracking",
      "Cookie-free analytics",
      "Real-time traffic monitoring",
      "Page view tracking",
      "Traffic source analysis",
      "Device and browser statistics",
      "Country-level geolocation",
      "GDPR compliant",
      "Open source",
      "Self-hostable",
    ],
  };

  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          suppressHydrationWarning
        />
      </head>
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before React
          hydrates. This only silences attribute mismatches on <body> itself. */}
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border-[1.5px] focus:border-ink focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-semibold"
          >
            Skip to content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
