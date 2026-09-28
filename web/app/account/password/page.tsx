import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/shell";
import { getSites } from "@/lib/analytics/queries";
import { requireUser } from "@/lib/auth";
import { PasswordForm } from "../forms";

export const metadata: Metadata = { title: "Change password", robots: { index: false } };

export default async function PasswordPage() {
  const user = await requireUser();
  const sites = await getSites();
  return (
    <DashboardShell sites={sites} email={user.email}>
      <div className="max-w-md space-y-8">
        <div>
          <Link href="/account" className="text-sm text-muted hover:text-ink">
            ← Account
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Choose a new password</h1>
        </div>
        <PasswordForm />
      </div>
    </DashboardShell>
  );
}
