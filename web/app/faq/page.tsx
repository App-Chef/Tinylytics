import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Common questions about Tinylytics privacy-friendly analytics: pricing, features, GDPR compliance, self-hosting, installation, and data privacy.",
  alternates: {
    canonical: "/faq",
  },
};

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is Tinylytics?",
        a: "Tinylytics is a simple, privacy-friendly analytics platform designed for solo developers and small products. It tracks essential metrics like page views, visitors, traffic sources, and device information without using cookies or storing personal data.",
      },
      {
        q: "How is Tinylytics different from Google Analytics?",
        a: "Unlike Google Analytics, Tinylytics focuses on essential metrics without overwhelming you with hundreds of data points. It's privacy-friendly (no cookies), lightweight (about 1 KB), and doesn't require cookie consent banners. It's designed to give you quick insights, not hours of data analysis.",
      },
      {
        q: "Who is Tinylytics for?",
        a: "Tinylytics is perfect for solo developers, indie makers, small businesses, bloggers, and anyone who wants simple website analytics without the complexity of enterprise tools. If you want to know how many people visit your site and where they come from, Tinylytics is for you.",
      },
    ],
  },
  {
    category: "Privacy & Compliance",
    questions: [
      {
        q: "Is Tinylytics GDPR compliant?",
        a: "Yes, Tinylytics is designed to be GDPR compliant. It doesn't use cookies, doesn't store personal data, and doesn't store raw IP addresses. Visitor identification uses a hashed, anonymized approach that can't be reversed or linked across days or sites.",
      },
      {
        q: "Do I need a cookie consent banner?",
        a: "In most cases, no. Since Tinylytics doesn't use cookies and doesn't store personal data, you typically don't need a cookie consent banner. However, we recommend consulting with a legal professional for your specific jurisdiction and use case.",
      },
      {
        q: "What data does Tinylytics collect?",
        a: "Tinylytics collects the page path (never query strings), external referrer, campaign source, browser family, operating system, device type (desktop/mobile/tablet), and country. IP addresses and user agents are used in memory to derive these values, then immediately discarded.",
      },
      {
        q: "How are unique visitors counted?",
        a: "Unique visitors are estimated using a hash of the IP address and user agent combined with a daily random salt. The salt is deleted after about two days, so visitors can't be tracked across days or sites. Each person is counted once per day per site.",
      },
      {
        q: "Where is data stored?",
        a: "Data is stored in PostgreSQL (via Supabase) with Row Level Security ensuring each user can only access their own data. If you self-host, you control exactly where your data lives.",
      },
    ],
  },
  {
    category: "Features & Technical",
    questions: [
      {
        q: "How small is the tracking script?",
        a: "The Tinylytics tracking script is approximately 1 KB gzipped with zero dependencies. It loads with the 'defer' attribute, never blocks page rendering, and fails silently if unavailable.",
      },
      {
        q: "Does Tinylytics work with single-page applications?",
        a: "Yes! Tinylytics automatically tracks History API navigation in single-page applications (SPAs) built with React, Vue, Svelte, or similar frameworks. Duplicate page views are automatically dropped.",
      },
      {
        q: "Does it work with hash-based routing?",
        a: "Yes, you can enable hash-based routing support by adding the data-hash attribute to the tracking script.",
      },
      {
        q: "What metrics does Tinylytics track?",
        a: "Tinylytics tracks page views, unique visitors (estimated), sessions, bounce rate, top pages, traffic sources (referrers), countries, devices (desktop/mobile/tablet), browsers, and operating systems. All metrics are shown on a single dashboard page.",
      },
      {
        q: "Can I track custom events?",
        a: "Currently, Tinylytics focuses on automatic page view tracking. Custom event tracking is not yet supported but may be added in future versions.",
      },
      {
        q: "Does it support multiple websites?",
        a: "Yes, you can track multiple websites from a single Tinylytics account. Each site gets its own unique ID and separate analytics dashboard.",
      },
      {
        q: "What time periods can I view?",
        a: "You can view analytics for today, the last 7 days, 30 days, or 90 days. All views load quickly because data is aggregated into daily rollups.",
      },
    ],
  },
  {
    category: "Installation & Setup",
    questions: [
      {
        q: "How do I install Tinylytics?",
        a: "Installation is simple: sign up for an account, get your unique site ID, and add one script tag to your website's <head> section before the closing </head> tag. Full instructions are provided in your dashboard.",
      },
      {
        q: "Does it work with WordPress?",
        a: "Yes, Tinylytics works with WordPress. You can add the tracking script to your theme's header.php file or use a plugin like 'Insert Headers and Footers' to add the script without editing theme files.",
      },
      {
        q: "Can I use it with Next.js, React, or Vue?",
        a: "Absolutely! Tinylytics works with any JavaScript framework including Next.js, React, Vue, Svelte, Angular, and others. It automatically handles client-side navigation in single-page applications.",
      },
      {
        q: "How do I verify tracking is working?",
        a: "After installing the script, visit your website and check your Tinylytics dashboard. Your visit should appear within seconds. The dashboard also shows a 'tracking installed' verification status.",
      },
    ],
  },
  {
    category: "Self-Hosting & Open Source",
    questions: [
      {
        q: "Is Tinylytics open source?",
        a: "Yes! Tinylytics is fully open source under the MIT license. You can read every line of code, audit what data is collected, and contribute to the project on GitHub.",
      },
      {
        q: "Can I self-host Tinylytics?",
        a: "Yes, Tinylytics is designed to be self-hostable. You can run it on your own Supabase project and any Next.js hosting platform like Vercel, a VPS, Docker, or Fly.io. Full self-hosting documentation is available.",
      },
      {
        q: "What do I need to self-host?",
        a: "You'll need a Supabase project (for PostgreSQL and authentication) and a Node.js hosting platform for the Next.js application. Both can be free or self-hosted on your own infrastructure.",
      },
      {
        q: "Can I modify the code?",
        a: "Yes! The MIT license allows you to modify, fork, and adapt the code for your needs. You can customize the dashboard, add features, or integrate it into your own products.",
      },
    ],
  },
  {
    category: "Pricing & Support",
    questions: [
      {
        q: "How much does Tinylytics cost?",
        a: "Tinylytics is open source and free to use. If you self-host, you only pay for your own infrastructure costs (Supabase and hosting). Hosted plans may be available in the future.",
      },
      {
        q: "Are there any usage limits?",
        a: "Since Tinylytics is self-hosted, limits depend on your infrastructure. The architecture is designed to be efficient: each page view is a single database operation, and dashboard queries read from pre-aggregated daily rollups.",
      },
      {
        q: "How do I get support?",
        a: "For open source support, you can open an issue on GitHub, check the documentation, or join community discussions. The documentation covers installation, configuration, and common troubleshooting scenarios.",
      },
    ],
  },
  {
    category: "Comparison",
    questions: [
      {
        q: "How does Tinylytics compare to Plausible or Simple Analytics?",
        a: "Like Plausible and Simple Analytics, Tinylytics is privacy-friendly and cookie-free. The key difference is that Tinylytics is fully open source (MIT), completely self-hostable, and focuses on an even simpler set of metrics—just what solo developers actually need.",
      },
      {
        q: "Why not just use server logs?",
        a: "Server logs can't track client-side navigation in single-page applications, don't capture accurate visitor counts (due to caching/CDNs), and require complex parsing. Tinylytics gives you a clean dashboard with accurate metrics in real-time.",
      },
      {
        q: "What's not included in Tinylytics?",
        a: "By design, Tinylytics doesn't include session recordings, heatmaps, funnels, user profiles, fingerprinting, A/B testing, or AI-generated reports. It focuses on essential traffic metrics, not feature bloat.",
      },
    ],
  },
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.flatMap((category) =>
      category.questions.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        suppressHydrationWarning
      />
      <SiteHeader />
      <main id="main" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <header className="mb-12">
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-ink-2">
            Everything you need to know about Tinylytics, privacy-friendly analytics for developers.
          </p>
        </header>

        <div className="space-y-12">
          {faqs.map((category) => (
            <section key={category.category} aria-labelledby={`category-${category.category.toLowerCase()}`}>
              <h2
                id={`category-${category.category.toLowerCase()}`}
                className="mb-6 font-display text-2xl font-bold tracking-tight"
              >
                {category.category}
              </h2>
              <dl className="space-y-6">
                {category.questions.map((faq, idx) => (
                  <div key={idx} className="rounded-lg border-[1.5px] border-line bg-surface p-6">
                    <dt className="text-lg font-semibold">{faq.q}</dt>
                    <dd className="mt-2 text-ink-2">{faq.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <section className="mt-16 rounded-lg border-[1.5px] border-line-strong bg-surface p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Still have questions?</h2>
          <p className="mt-2 text-ink-2">Check our documentation or open an issue on GitHub.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/docs" className={buttonClass("primary", "md")}>
              Read Documentation
            </Link>
            <a
              href="https://github.com/App-Chef/Tinylytics/issues"
              className={buttonClass("secondary", "md")}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Issues
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
