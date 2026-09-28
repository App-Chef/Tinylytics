import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NoDataYet } from "@/components/dashboard/empty-state";
import { RangePicker } from "@/components/dashboard/range-picker";
import {
  ActiveNow,
  CountriesSection,
  PagesSection,
  SourcesSection,
  TechSection,
  TrafficSection,
} from "@/components/dashboard/sections";
import { PanelSkeleton, TrafficSkeleton } from "@/components/dashboard/skeletons";
import { getSite } from "@/lib/analytics/queries";
import { parseRange, resolveRange } from "@/lib/analytics/range";

export async function generateMetadata({ params }: PageProps<"/sites/[siteId]">): Promise<Metadata> {
  const site = await getSite((await params).siteId);
  return { title: site ? site.name : "Site", robots: { index: false } };
}

export default async function OverviewPage({ params, searchParams }: PageProps<"/sites/[siteId]">) {
  const [{ siteId }, query] = await Promise.all([params, searchParams]);
  const site = await getSite(siteId);
  if (!site) notFound();

  const range = resolveRange(parseRange(query.range), site.timezone);
  const props = { siteId: site.id, range, timezone: site.timezone };
  const key = `${site.id}:${range.key}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl font-bold tracking-tight sm:text-4xl">{site.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
            <a
              href={`https://${site.domain}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              {site.domain}
            </a>
            {site.first_event_at ? (
              <Suspense fallback={null}>
                <ActiveNow siteId={site.id} />
              </Suspense>
            ) : null}
          </div>
        </div>
        {site.first_event_at ? (
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <RangePicker basePath={`/sites/${site.id}`} current={range.key} />
            <p className="text-xs text-muted">
              {range.label} · {site.timezone}
            </p>
          </div>
        ) : null}
      </div>

      {site.first_event_at ? (
        <>
          <Suspense key={`traffic:${key}`} fallback={<TrafficSkeleton />}>
            <TrafficSection {...props} />
          </Suspense>
          <div className="grid gap-6 lg:grid-cols-2">
            <Suspense key={`pages:${key}`} fallback={<PanelSkeleton title="Top pages" />}>
              <PagesSection {...props} />
            </Suspense>
            <Suspense key={`sources:${key}`} fallback={<PanelSkeleton title="Sources" />}>
              <SourcesSection {...props} />
            </Suspense>
            <Suspense key={`countries:${key}`} fallback={<PanelSkeleton title="Countries" />}>
              <CountriesSection {...props} />
            </Suspense>
            <Suspense key={`tech:${key}`} fallback={<PanelSkeleton title="Devices" />}>
              <TechSection {...props} />
            </Suspense>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Visitors are estimated without cookies and counted once per day per site; a visitor who returns on another
            day is counted again. Bounce rate is the share of sessions with a single page view.{" "}
            <Link href="/docs/dashboard" className="underline underline-offset-2 hover:text-ink">
              How Tinylytics counts
            </Link>
          </p>
        </>
      ) : (
        <NoDataYet site={site} />
      )}
    </div>
  );
}
