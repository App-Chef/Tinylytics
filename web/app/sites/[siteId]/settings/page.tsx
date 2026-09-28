import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SubmitButton } from "@/components/ui/submit-button";
import { getSite } from "@/lib/analytics/queries";
import { timezones } from "@/lib/sites";
import { deleteSite, regenerateSiteId } from "../../actions";
import { SiteForm } from "../../site-form";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default async function SettingsPage({ params }: PageProps<"/sites/[siteId]/settings">) {
  const { siteId } = await params;
  const site = await getSite(siteId);
  if (!site) notFound();

  return (
    <div className="max-w-2xl space-y-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>

      <section aria-labelledby="general-title" className="space-y-4">
        <h2 id="general-title" className="font-display text-lg font-bold">
          General
        </h2>
        <SiteForm mode="edit" site={site} timezones={timezones()} />
      </section>

      <section aria-labelledby="id-title" className="space-y-3 border-t border-line pt-8">
        <h2 id="id-title" className="font-display text-lg font-bold">
          Site ID
        </h2>
        <p className="text-sm text-ink-2">
          Your current site ID is <span className="font-mono text-ink">{site.public_id}</span>. Regenerate it if someone
          else is sending events with your snippet. The old ID stops working immediately, so update the script on your
          site right after.
        </p>
        <form action={regenerateSiteId}>
          <input type="hidden" name="siteId" value={site.id} />
          <SubmitButton variant="secondary" pendingLabel="Regenerating…">
            Regenerate site ID
          </SubmitButton>
        </form>
      </section>

      <section
        aria-labelledby="danger-title"
        className="space-y-3 rounded-lg border-[1.5px] border-danger bg-danger-wash p-5"
      >
        <h2 id="danger-title" className="font-display text-lg font-bold text-danger">
          Delete site
        </h2>
        <p className="text-sm text-ink-2">
          This will permanently delete the site&apos;s analytics data. It cannot be undone.
        </p>
        <ConfirmDialog
          triggerLabel="Delete site"
          title={`Delete ${site.name}?`}
          description={
            <p>
              This will permanently delete the site&apos;s analytics data — every page view, session and daily total for{" "}
              <span className="font-mono">{site.domain}</span>. It cannot be undone.
            </p>
          }
          confirmText={site.domain}
          confirmLabel="Delete permanently"
          action={deleteSite}
          hiddenFields={{ siteId: site.id }}
        />
      </section>
    </div>
  );
}
