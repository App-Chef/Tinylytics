import type { Metadata } from "next";
import Link from "next/link";
import { googleAuthEnabled } from "@/lib/env";
import { safeNext } from "@/lib/auth";
import { Divider, GoogleButton, SignInForm } from "../auth-forms";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const ERRORS: Record<string, string> = {
  link: "That link is invalid or has expired. Request a new one.",
  oauth: "Google sign-in didn't work. Try again or use your email.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-ink-2">Sign in to see what&apos;s happening.</p>
      </div>
      {error ? (
        <p
          role="alert"
          className="rounded-md border-[1.5px] border-danger bg-danger-wash px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}
      {googleAuthEnabled ? (
        <>
          <GoogleButton next={next} />
          <Divider>or</Divider>
        </>
      ) : null}
      <SignInForm next={next} />
      <p className="text-sm text-ink-2">
        New here?{" "}
        <Link
          href="/signup"
          className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
