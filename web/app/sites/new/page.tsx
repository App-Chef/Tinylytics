import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/shell";
import { getSites } from "@/lib/analytics/queries";
import { requireUser } from "@/lib/auth";
import { timezones } from "@/lib/sites";
import { SiteForm } from "../site-form";

export const metadata: Metadata = { title: "Add a site", robots: { index: false } };

export default async function NewSitePage() {
  const user = await requireUser();
  const sites = await getSites();

  return (
    <DashboardShell sites={sites} email={user.email}>
      <div className="max-w-xl space-y-8 rise">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {sites.length ? "Add a site" : "Add your first site"}
          </h1>
          <p className="mt-2 text-ink-2">Tell us where the tracking script will run. You can change this later.</p>
        </div>
        <SiteForm mode="create" timezones={timezones()} />
      </div>
    </DashboardShell>
  );
}
