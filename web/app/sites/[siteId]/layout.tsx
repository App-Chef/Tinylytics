import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { RememberSite } from "@/components/dashboard/remember-site";
import { getSite, getSites } from "@/lib/analytics/queries";
import { requireUser } from "@/lib/auth";

export default async function SiteLayout({ children, params }: LayoutProps<"/sites/[siteId]">) {
  const { siteId } = await params;
  const user = await requireUser();
  const [site, sites] = await Promise.all([getSite(siteId), getSites()]);
  // RLS hides other users' sites, so "not yours" and "does not exist" look the same.
  if (!site) notFound();

  return (
    <DashboardShell sites={sites} current={site} email={user.email}>
      <RememberSite siteId={site.id} />
      {children}
    </DashboardShell>
  );
}
