import Link from "next/link";
import { trackerSnippet } from "@/lib/sites";
import type { Site } from "@/types/database";
import { Snippet } from "./snippet";
import { TrackingStatus } from "./tracking-status";

export function NoDataYet({ site }: { site: Site }) {
  return (
    <section
      aria-labelledby="empty-title"
      className="rounded-lg border-[1.5px] border-dashed border-line-strong bg-surface px-5 py-10 sm:px-10 sm:py-14"
    >
      <div className="mx-auto max-w-xl space-y-6">
        <div className="space-y-2">
          <h2 id="empty-title" className="font-display text-2xl font-bold tracking-tight">
            No traffic yet.
          </h2>
          <p className="text-ink-2">
            Install the Tinylytics tracking script on <span className="font-mono text-ink">{site.domain}</span> and your
            first visitors will appear here.
          </p>
        </div>
        <Snippet code={trackerSnippet(site.public_id)} copyLabel="Copy tracking code" />
        <p className="text-sm text-muted">
          Add it before <code className="font-mono text-ink">&lt;/head&gt;</code>.{" "}
          <Link
            href={`/sites/${site.id}/settings/tracking`}
            className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4"
          >
            Framework guides
          </Link>
        </p>
        <div className="border-t border-line pt-5">
          <TrackingStatus siteId={site.id} firstEventAt={site.first_event_at} />
        </div>
      </div>
    </section>
  );
}
