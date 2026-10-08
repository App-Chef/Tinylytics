import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { ButtonLink, buttonClass } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tinylytics vs Google Analytics, Plausible, Simple Analytics, Fathom",
  description:
    "Compare Tinylytics with Google Analytics, Plausible Analytics, Simple Analytics, Fathom Analytics, Matomo, and other web analytics tools. Find the best privacy-friendly analytics solution.",
  keywords: [
    "Google Analytics alternative",
    "Plausible alternative",
    "Simple Analytics alternative",
    "Fathom alternative",
    "privacy-friendly analytics comparison",
    "open source analytics",
    "analytics comparison",
    "cookie-free analytics",
  ],
  alternates: {
    canonical: "/alternatives",
  },
};

const comparisons = [
  {
    name: "Google Analytics",
    description: "The most popular analytics platform",
    differences: [
      {
        aspect: "Privacy",
        them: "Collects extensive personal data, requires cookie consent banners, tracks across websites",
        us: "No cookies, no personal data, no tracking across sites. GDPR-friendly by design.",
      },
      {
        aspect: "Complexity",
        them: "Hundreds of metrics and reports, steep learning curve, requires hours to understand",
        us: "One simple dashboard with essential metrics you actually need. Seconds to understand.",
      },
      {
        aspect: "Script Size",
        them: "45+ KB (Google Analytics 4), blocks rendering if not configured carefully",
        us: "~1 KB gzipped, loads with defer, never blocks your site.",
      },
      {
        aspect: "Data Ownership",
        them: "Google owns your data, can use it for their purposes, closed source",
        us: "You own your data, open source (MIT), self-hostable on your infrastructure.",
      },
      {
        aspect: "Price",
        them: "Free (you pay with your users' data), or $150k+/year for Analytics 360",
        us: "Free and open source. Only pay for your own hosting costs.",
      },
    ],
    bestFor: "Large enterprises needing complex data analysis and integration with Google Ads ecosystem.",
  },
  {
    name: "Plausible Analytics",
    description: "Popular privacy-first Google Analytics alternative",
    differences: [
      {
        aspect: "Open Source",
        them: "Source available (AGPL), self-hosting requires AGPL compliance for modifications",
        us: "Fully open source with permissive MIT license. Modify freely without restrictions.",
      },
      {
        aspect: "Simplicity",
        them: "Simple and clean, but includes goals, campaigns, custom events, properties",
        us: "Even simpler: just the core metrics solo developers actually check daily.",
      },
      {
        aspect: "Hosting",
        them: "$9-$150+/month for hosted service, or self-host with ClickHouse + PostgreSQL setup",
        us: "Free to self-host on simple infrastructure: just PostgreSQL + Next.js. No ClickHouse needed.",
      },
      {
        aspect: "Script Size",
        them: "~1 KB gzipped, similar performance",
        us: "~1 KB gzipped, similar performance.",
      },
      {
        aspect: "Dashboard",
        them: "Clean single-page dashboard with expanding sections",
        us: "Single page showing everything at once. No expanding, no clicking.",
      },
    ],
    bestFor: "Teams needing goal tracking and willing to pay for hassle-free hosted service.",
  },
  {
    name: "Simple Analytics",
    description: "Privacy-friendly analytics with a clean interface",
    differences: [
      {
        aspect: "Open Source",
        them: "Closed source, hosted service only",
        us: "Fully open source (MIT), completely transparent and self-hostable.",
      },
      {
        aspect: "Price",
        them: "$9-$79+/month for hosted service, no self-hosting option",
        us: "Free and open source. Pay only for your own infrastructure.",
      },
      {
        aspect: "Features",
        them: "Goals, events, automated events, custom dashboards, API access",
        us: "Focused on page views, visitors, sources, and device stats. No feature bloat.",
      },
      {
        aspect: "Privacy",
        them: "Privacy-friendly, no cookies, GDPR compliant",
        us: "Privacy-friendly, no cookies, GDPR compliant. Same privacy approach.",
      },
    ],
    bestFor: "Teams wanting a polished hosted solution with advanced features and professional support.",
  },
  {
    name: "Fathom Analytics",
    description: "Simple website analytics for developers",
    differences: [
      {
        aspect: "Open Source",
        them: "Closed source, hosted service only (previously had open source v1)",
        us: "Fully open source (MIT), transparent code, self-hostable.",
      },
      {
        aspect: "Price",
        them: "$14-$54+/month for hosted service",
        us: "Free and open source. Only infrastructure costs for self-hosting.",
      },
      {
        aspect: "Simplicity",
        them: "Simple dashboard with goals, events, uptime monitoring",
        us: "Even simpler: pure traffic analytics without extra features.",
      },
      {
        aspect: "Privacy",
        them: "Privacy-focused, no cookies, GDPR compliant",
        us: "Privacy-focused, no cookies, GDPR compliant. Similar approach.",
      },
    ],
    bestFor: "Businesses wanting a simple hosted solution from a privacy-focused company.",
  },
  {
    name: "Matomo (formerly Piwik)",
    description: "Open source analytics platform with many features",
    differences: [
      {
        aspect: "Complexity",
        them: "Feature-rich like Google Analytics: goals, campaigns, heatmaps, A/B testing, etc.",
        us: "Intentionally simple: focused on essential traffic metrics only.",
      },
      {
        aspect: "Script Size",
        them: "~20 KB+ gzipped depending on configuration and plugins",
        us: "~1 KB gzipped, 20x smaller.",
      },
      {
        aspect: "Setup",
        them: "Complex installation, requires PHP + MySQL, numerous configuration options",
        us: "Simple: PostgreSQL (Supabase) + Next.js. Quick to set up.",
      },
      {
        aspect: "Privacy",
        them: "Can be privacy-friendly but uses cookies by default, requires configuration",
        us: "Privacy-friendly by default. No cookies, no configuration needed.",
      },
      {
        aspect: "Price",
        them: "Free self-hosted, or €19-€49+/month for cloud hosting",
        us: "Free and open source (MIT). Self-host on your infrastructure.",
      },
    ],
    bestFor: "Organizations needing enterprise-grade analytics with advanced features and on-premise hosting.",
  },
];

const featureComparison = [
  {
    feature: "Open Source",
    tinylytics: "✓ MIT License",
    google: "✗ Closed Source",
    plausible: "AGPL License",
    simple: "✗ Closed Source",
    fathom: "✗ Closed Source",
    matomo: "✓ GPL License",
  },
  {
    feature: "Self-Hostable",
    tinylytics: "✓ Easy Setup",
    google: "✗",
    plausible: "✓ Complex Setup",
    simple: "✗",
    fathom: "✗",
    matomo: "✓ Complex Setup",
  },
  {
    feature: "No Cookies",
    tinylytics: "✓",
    google: "✗ Uses Cookies",
    plausible: "✓",
    simple: "✓",
    fathom: "✓",
    matomo: "Uses Cookies*",
  },
  {
    feature: "Script Size",
    tinylytics: "~1 KB",
    google: "~45 KB",
    plausible: "~1 KB",
    simple: "~3 KB",
    fathom: "~1 KB",
    matomo: "~20 KB",
  },
  {
    feature: "GDPR Friendly",
    tinylytics: "✓ By Design",
    google: "Requires Config",
    plausible: "✓",
    simple: "✓",
    fathom: "✓",
    matomo: "Requires Config",
  },
  {
    feature: "Pricing",
    tinylytics: "Free (OSS)",
    google: "Free*",
    plausible: "$9-$150+/mo",
    simple: "$9-$79+/mo",
    fathom: "$14-$54+/mo",
    matomo: "Free / €19+/mo",
  },
  {
    feature: "Dashboard Complexity",
    tinylytics: "Single Page",
    google: "Very Complex",
    plausible: "Simple",
    simple: "Simple",
    fathom: "Simple",
    matomo: "Complex",
  },
];

export default function AlternativesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {/* Hero */}
        <header className="mb-16 max-w-3xl">
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
            Privacy-Friendly Analytics Comparison
          </h1>
          <p className="mt-4 text-xl text-ink-2">
            Compare Tinylytics with Google Analytics, Plausible, Simple Analytics, Fathom, Matomo, and other web
            analytics platforms to find the best solution for your needs.
          </p>
        </header>

        {/* Quick Comparison Table */}
        <section aria-labelledby="comparison-table" className="mb-20">
          <h2 id="comparison-table" className="mb-6 font-display text-3xl font-bold tracking-tight">
            Quick Comparison
          </h2>
          <div className="overflow-x-auto rounded-lg border-[1.5px] border-line-strong">
            <table className="w-full text-sm">
              <thead className="border-b-[1.5px] border-line-strong bg-surface">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Feature</th>
                  <th className="bg-accent/5 px-4 py-3 text-left font-semibold">Tinylytics</th>
                  <th className="px-4 py-3 text-left font-semibold">Google Analytics</th>
                  <th className="px-4 py-3 text-left font-semibold">Plausible</th>
                  <th className="px-4 py-3 text-left font-semibold">Simple Analytics</th>
                  <th className="px-4 py-3 text-left font-semibold">Fathom</th>
                  <th className="px-4 py-3 text-left font-semibold">Matomo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {featureComparison.map((row) => (
                  <tr key={row.feature}>
                    <td className="px-4 py-3 font-medium">{row.feature}</td>
                    <td className="bg-accent/5 px-4 py-3 font-semibold">{row.tinylytics}</td>
                    <td className="px-4 py-3 text-muted">{row.google}</td>
                    <td className="px-4 py-3 text-muted">{row.plausible}</td>
                    <td className="px-4 py-3 text-muted">{row.simple}</td>
                    <td className="px-4 py-3 text-muted">{row.fathom}</td>
                    <td className="px-4 py-3 text-muted">{row.matomo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed Comparisons */}
        <section aria-labelledby="detailed-comparisons">
          <h2 id="detailed-comparisons" className="mb-8 font-display text-3xl font-bold tracking-tight">
            Detailed Comparisons
          </h2>
          <div className="space-y-12">
            {comparisons.map((comp) => (
              <article key={comp.name} className="rounded-lg border-[1.5px] border-line-strong bg-surface p-8">
                <header className="mb-6">
                  <h3 className="font-display text-2xl font-bold">{comp.name}</h3>
                  <p className="mt-2 text-ink-2">{comp.description}</p>
                </header>

                <div className="mb-6 space-y-6">
                  {comp.differences.map((diff) => (
                    <div key={diff.aspect} className="border-l-4 border-accent pl-4">
                      <h4 className="mb-2 font-semibold">{diff.aspect}</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{comp.name}</p>
                          <p className="mt-1 text-sm text-ink-2">{diff.them}</p>
                        </div>
                        <div className="bg-accent/5 rounded p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Tinylytics</p>
                          <p className="mt-1 text-sm font-medium">{diff.us}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-line pt-4">
                  <p className="text-sm">
                    <span className="font-semibold">Best for:</span>{" "}
                    <span className="text-ink-2">{comp.bestFor}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Why Choose Tinylytics */}
        <section aria-labelledby="why-tinylytics" className="mt-20">
          <div className="rounded-lg border-[1.5px] border-line-strong bg-surface p-8">
            <h2 id="why-tinylytics" className="font-display text-2xl font-bold">
              Why Choose Tinylytics?
            </h2>
            <ul className="mt-6 space-y-3">
              <li className="flex gap-3">
                <span className="mt-1 text-accent">✓</span>
                <span>
                  <strong>Truly Open Source:</strong> MIT licensed, not source-available. Fork, modify, and use however
                  you want.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-accent">✓</span>
                <span>
                  <strong>Simple Self-Hosting:</strong> Just PostgreSQL and Next.js. No ClickHouse, Redis, or complex
                  infrastructure.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-accent">✓</span>
                <span>
                  <strong>Actually Simple:</strong> One dashboard page with only the metrics that matter. No feature
                  bloat.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-accent">✓</span>
                <span>
                  <strong>Privacy by Default:</strong> No cookies, no personal data, no configuration needed. GDPR
                  friendly from day one.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-accent">✓</span>
                <span>
                  <strong>Lightweight:</strong> ~1 KB tracking script that never blocks your site. 20x smaller than some
                  alternatives.
                </span>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/signup" size="lg">
                Start Using Tinylytics
              </ButtonLink>
              <Link href="/faq" className={buttonClass("secondary", "lg")}>
                Read FAQ
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
