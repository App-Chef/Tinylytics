import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "../auth-forms";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-ink-2">We&apos;ll email you a link to choose a new one.</p>
      </div>
      <ForgotPasswordForm />
      <p className="text-sm text-ink-2">
        <Link
          href="/login"
          className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
