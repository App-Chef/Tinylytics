import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import Link from "next/link";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { repositoryUrl, siteUrl } from "@/lib/env";

// Measured at build time, so the landing page never overstates it.
function trackerSize() {
  try {
    const code = readFileSync(join(process.cwd(), "public", "tracker.js"));
    return `${(gzipSync(code).length / 1024).toFixed(1)} KB`;
  } catch {
    return "~1 KB";
  }
}

const NOISE = [
  "Engagement-weighted cohort explorer",
  "Custom dimension scopes",
  "Attribution model comparison",
  "Event parameter reporting",
  "Predictive audiences",
  "Sampling thresholds",
];

const QUESTIONS = [
  "How many people visited?",
  "What did they view?",
  "Where did they come from?",
  "What devices are they using?",
  "Where are they located?",
  "Is traffic growing or falling?",
];

const FEATURES = [
  {
    title: "Page views",
    body: "Every page, counted once per view — including client-side navigation in single-page apps.",
  },
  { title: "Visitors", body: "Approximate unique visitors per day, estimated without cookies or fingerprinting." },
  {
    title: "Traffic sources",
    body: "Google, GitHub, Hacker News, newsletters. Referrers are reduced to a readable name.",
  },
  { title: "Countries", body: "Country-level location from your hosting provider. Never cities, never coordinates." },
  { title: "Devices", body: "Desktop, mobile or tablet, plus browser and operating system. Families, not versions." },
  { title: "Privacy", body: "No cookies, no personal data, no raw IP addresses stored. Nothing to put in a banner." },
];

export default function Home() {
  const size = trackerSize();

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="max-w-3xl rise">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border-[1.5px] border-line-strong px-3 py-1 text-xs font-semibold">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Open source · Self-hostable · No cookies
            </p>
            <h1 className="font-display text-[44px] font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-7xl">
              Analytics without the{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">noise.</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-[-0.06em] bottom-[0.08em] z-0 h-[0.22em] bg-accent"
                />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl">
              Simple, privacy-friendly analytics for solo developers and small products.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/signup" size="lg">
                Start tracking
              </ButtonLink>
              <a href={repositoryUrl} className={buttonClass("secondary", "lg")}>
                View GitHub
              </a>
            </div>
            <p className="mt-8 max-w-lg text-[15px] text-muted">
              See your traffic, pages, referrers, and audience without turning analytics into another full-time job.
            </p>
          </div>
          <div className="mt-16 sm:mt-20">
            <DashboardPreview />
          </div>
        </section>

        {/* Problem */}
        <section aria-labelledby="problem-title" className="border-y-[1.5px] border-line-strong bg-surface">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2
                id="problem-title"
                className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
              >
                Most analytics tools give you hundreds of metrics.
                <span className="block text-muted">You usually need a few.</span>
              </h2>
              <ul className="mt-8 space-y-2" aria-label="Things you probably don't need">
                {NOISE.map((item) => (
                  <li key={item} className="text-muted line-through decoration-danger/70 decoration-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:pt-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted">What Tinylytics answers</p>
              <ol className="mt-4 divide-y divide-line border-y-[1.5px] border-line-strong">
                {QUESTIONS.map((q, i) => (
                  <li key={q} className="flex items-baseline gap-4 py-3.5">
                    <span className="tabular w-6 shrink-0 font-mono text-sm text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-lg font-semibold">{q}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-ink-2">One screen. A few seconds. Then back to building.</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section aria-labelledby="features-title" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 id="features-title" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything on one page.
          </h2>
          <div className="mt-10 grid overflow-hidden rounded-lg border-[1.5px] border-line-strong sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="-mb-px -mr-px border-b border-r border-line bg-surface p-6">
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tracker */}
        <section
          aria-labelledby="tracker-title"
          className="border-y-[1.5px] border-line-strong bg-[#121211] text-[#f4f2eb]"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <h2 id="tracker-title" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                A tracker you&apos;ll forget is there.
              </h2>
              <p className="mt-4 text-lg leading-relaxed opacity-80">
                One script tag. It loads with <code className="font-mono text-base">defer</code>, never blocks
                rendering, sends events with <code className="font-mono text-base">sendBeacon</code>, and fails
                silently. If Tinylytics is down, your site doesn&apos;t notice.
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
                <div>
                  <dt className="text-sm opacity-70">Gzipped</dt>
                  <dd className="font-display text-2xl font-bold">{size}</dd>
                </div>
                <div>
                  <dt className="text-sm opacity-70">Dependencies</dt>
                  <dd className="font-display text-2xl font-bold">0</dd>
                </div>
                <div>
                  <dt className="text-sm opacity-70">Cookies</dt>
                  <dd className="font-display text-2xl font-bold">0</dd>
                </div>
              </dl>
            </div>
            <pre className="overflow-x-auto rounded-lg border-[1.5px] border-white/25 bg-white/5 p-5 font-mono text-[13px] leading-relaxed sm:text-sm">
              <code>
                <span className="opacity-50">{"<!-- before </head> -->"}</span>
                {"\n"}
                {`<script\n  defer\n  src="${siteUrl}/tracker.js"\n  data-site="`}
                <span className="text-[#ff7a3d]">YOUR_SITE_ID</span>
                {`">\n</script>`}
              </code>
            </pre>
          </div>
        </section>

        {/* Open source */}
        <section aria-labelledby="oss-title" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 id="oss-title" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Open source. Yours to run.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-2">
                Tinylytics is MIT licensed. Read every line of the tracker, audit what is stored, or run the whole thing
                on your own Supabase project and Next.js host.
              </p>
            </div>
            <ul className="space-y-4 self-center">
              {[
                ["Plain PostgreSQL", "Events and daily rollups live in tables you can query yourself."],
                ["Row Level Security", "Every read is scoped to the signed-in owner, enforced by the database."],
                ["Documented privacy model", "Exactly what is collected, how visitors are estimated, and what is not."],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <span aria-hidden="true" className="mt-1.5 size-2.5 shrink-0 rounded-sm bg-accent" />
                  <span>
                    <span className="font-semibold">{title}.</span> <span className="text-ink-2">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/docs/self-hosting" className={buttonClass("secondary", "md")}>
              Self-hosting guide
            </Link>
            <Link href="/docs/privacy" className={buttonClass("ghost", "md")}>
              Read the privacy model →
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section aria-labelledby="cta-title" className="border-t-[1.5px] border-line-strong">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 md:flex-row md:items-center md:justify-between">
            <h2 id="cta-title" className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              See what&apos;s happening.
            </h2>
            <ButtonLink href="/signup" size="lg">
              Start tracking
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
