import type { Metadata } from "next";
import Link from "next/link";
import { googleAuthEnabled } from "@/lib/env";
import { Divider, GoogleButton, SignUpForm } from "../auth-forms";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Start tracking your product with simple, privacy-friendly analytics.",
};

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Start tracking</h1>
        <p className="text-ink-2">One account, as many sites as you like.</p>
      </div>
      {googleAuthEnabled ? (
        <>
          <GoogleButton />
          <Divider>or</Divider>
        </>
      ) : null}
      <SignUpForm />
      <p className="text-sm text-ink-2">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
