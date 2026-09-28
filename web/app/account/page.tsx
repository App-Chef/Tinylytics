import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/shell";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { buttonClass } from "@/components/ui/button";
import { getSites } from "@/lib/analytics/queries";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteAccount } from "./actions";
import { ProfileForm } from "./forms";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [sites, { data: profile }] = await Promise.all([
    getSites(),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);

  return (
    <DashboardShell sites={sites} email={user.email}>
      <div className="max-w-2xl space-y-10">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Account</h1>

        <section aria-labelledby="profile-title" className="space-y-4">
          <h2 id="profile-title" className="font-display text-lg font-bold">
            Profile
          </h2>
          <p className="text-sm text-ink-2">
            Signed in as <span className="font-semibold text-ink">{user.email}</span>
          </p>
          <ProfileForm name={profile?.name ?? ""} />
        </section>

        <section aria-labelledby="security-title" className="space-y-3 border-t border-line pt-8">
          <h2 id="security-title" className="font-display text-lg font-bold">
            Password
          </h2>
          <p className="text-sm text-ink-2">Set or change the password you use to sign in.</p>
          <Link href="/account/password" className={buttonClass("secondary", "md")}>
            Change password
          </Link>
        </section>

        <section aria-labelledby="session-title" className="space-y-3 border-t border-line pt-8">
          <h2 id="session-title" className="font-display text-lg font-bold">
            Session
          </h2>
          <form action="/auth/signout" method="post">
            <button type="submit" className={buttonClass("secondary", "md")}>
              Sign out
            </button>
          </form>
        </section>

        <section
          aria-labelledby="delete-title"
          className="space-y-3 rounded-lg border-[1.5px] border-danger bg-danger-wash p-5"
        >
          <h2 id="delete-title" className="font-display text-lg font-bold text-danger">
            Delete account
          </h2>
          <p className="text-sm text-ink-2">
            Permanently deletes your account, all {sites.length} of your sites, and all of their analytics data.
          </p>
          <ConfirmDialog
            triggerLabel="Delete account"
            title="Delete your account?"
            description={
              <p>Your account, every site and all analytics data will be deleted permanently. This cannot be undone.</p>
            }
            confirmText="delete my account"
            confirmLabel="Delete everything"
            action={deleteAccount}
          />
        </section>
      </div>
    </DashboardShell>
  );
}
