import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Snippet } from "@/components/dashboard/snippet";
import { TrackingStatus } from "@/components/dashboard/tracking-status";
import { CopyButton } from "@/components/ui/copy-button";
import { Panel } from "@/components/ui/panel";
import { getSite } from "@/lib/analytics/queries";
import { siteUrl } from "@/lib/env";
import { trackerSnippet } from "@/lib/sites";
import { InstallGuides } from "./install-guides";

export const metadata: Metadata = { title: "Tracking", robots: { index: false } };

export default async function TrackingPage({ params, searchParams }: PageProps<"/sites/[siteId]/settings/tracking">) {
  const [{ siteId }, query] = await Promise.all([params, searchParams]);
  const site = await getSite(siteId);
  if (!site) notFound();
  const isNew = query.new === "1";
  const src = `${siteUrl}/tracker.js`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {isNew ? "Your site is ready." : "Tracking"}
        </h1>
        <p className="mt-2 max-w-2xl text-ink-2">
          {isNew
            ? "Add this script to your website. Once visitors arrive, analytics will appear here."
            : `Install the tracking script on ${site.domain} and check that events are arriving.`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section aria-labelledby="script-title" className="space-y-3">
            <h2 id="script-title" className="font-display text-lg font-bold">
              1. Add the script
            </h2>
            <Snippet code={trackerSnippet(site.public_id)} />
            <p className="text-sm text-ink-2">
              Add this before{" "}
              <code className="rounded bg-sunken px-1 font-mono text-[13px] text-ink">&lt;/head&gt;</code> on every
              page. It loads with <code className="rounded bg-sunken px-1 font-mono text-[13px] text-ink">defer</code>,
              never blocks rendering, and is about 1 KB gzipped.
            </p>
          </section>

          <section aria-labelledby="guides-title" className="space-y-3">
            <h2 id="guides-title" className="font-display text-lg font-bold">
              2. Using a framework?
            </h2>
            <InstallGuides src={src} publicId={site.public_id} />
          </section>

          <section aria-labelledby="verify-title" className="space-y-3">
            <h2 id="verify-title" className="font-display text-lg font-bold">
              3. Visit your site
            </h2>
            <div className="rounded-lg border-[1.5px] border-line-strong bg-surface p-5">
              <TrackingStatus siteId={site.id} firstEventAt={site.first_event_at} />
            </div>
            <p className="text-sm text-muted">
              Visits from <code className="font-mono">localhost</code> are ignored. Test on your deployed site, and make
              sure it runs on <span className="font-mono">{site.domain}</span> or one of its subdomains.
            </p>
          </section>
        </div>

        <aside className="space-y-6">
          <Panel title="Details" titleId="details-title">
            <dl className="divide-y divide-line text-sm">
              <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <dt className="text-muted">Site ID</dt>
                <dd className="flex items-center gap-2">
                  <span className="font-mono">{site.public_id}</span>
                  <CopyButton value={site.public_id} label="Copy" />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <dt className="text-muted">Domain</dt>
                <dd className="truncate font-mono">{site.domain}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <dt className="text-muted">Timezone</dt>
                <dd className="truncate">{site.timezone}</dd>
              </div>
            </dl>
          </Panel>
          <Panel title="Options" titleId="options-title">
            <dl className="space-y-3 px-4 py-4 text-sm sm:px-5">
              <div>
                <dt className="font-mono text-[13px] font-semibold">data-hash=&quot;true&quot;</dt>
                <dd className="text-muted">Count hash routes like /#/settings as pages.</dd>
              </div>
              <div>
                <dt className="font-mono text-[13px] font-semibold">data-respect-dnt=&quot;true&quot;</dt>
                <dd className="text-muted">Skip visitors with Do Not Track or Global Privacy Control enabled.</dd>
              </div>
              <div>
                <dt className="font-mono text-[13px] font-semibold">data-allow-localhost=&quot;true&quot;</dt>
                <dd className="text-muted">Count visits on localhost while testing.</dd>
              </div>
              <div>
                <dt className="font-semibold">Exclude yourself</dt>
                <dd className="text-muted">
                  Run{" "}
                  <code className="font-mono text-[12px] text-ink">
                    localStorage.tinylytics_ignore = &quot;true&quot;
                  </code>{" "}
                  in your browser&apos;s console on your site.
                </dd>
              </div>
            </dl>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
