import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSites } from "@/lib/analytics/queries";
import { requireUser } from "@/lib/auth";

// Opens the last site the user viewed, or their first site, or onboarding.
export default async function DashboardPage() {
  await requireUser();
  const sites = await getSites();
  if (!sites.length) redirect("/sites/new");
  const remembered = (await cookies()).get("tl_site")?.value;
  const site = sites.find((s) => s.id === remembered) ?? sites[0];
  redirect(`/sites/${site.id}`);
}
