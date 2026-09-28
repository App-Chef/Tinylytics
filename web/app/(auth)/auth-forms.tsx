"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Field, FormMessage, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonClass } from "@/components/ui/button";
import { requestPasswordReset, sendMagicLink, signIn, signInWithGoogle, signUp, type AuthState } from "./actions";

export function GoogleButton({ next }: { next?: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={next ?? ""} />
      <button type="submit" className={buttonClass("secondary", "md", "w-full")}>
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8z"
          />
          <path
            fill="#34A853"
            d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.8 0-5.2-1.9-6.1-4.5H2.2v2.8A11 11 0 0 0 12 23z"
          />
          <path fill="#FBBC05" d="M5.9 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8l3.7-2.8z" />
          <path
            fill="#EA4335"
            d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.2 7.1l3.7 2.8C6.8 7.3 9.2 5.4 12 5.4z"
          />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}

export function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted" role="separator">
      <span className="h-px flex-1 bg-line" />
      {children}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [passwordState, passwordAction] = useActionState<AuthState, FormData>(signIn, {});
  const [linkState, linkAction] = useActionState<AuthState, FormData>(sendMagicLink, {});
  const state = mode === "password" ? passwordState : linkState;

  return (
    <form action={mode === "password" ? passwordAction : linkAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          aria-invalid={Boolean(state.error)}
        />
      </Field>
      {mode === "password" ? (
        <Field
          label="Password"
          htmlFor="password"
          hint={
            <Link href="/forgot-password" className="underline decoration-line underline-offset-2 hover:text-ink">
              Forgot your password?
            </Link>
          }
        >
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
      ) : null}
      <FormMessage>{state.error}</FormMessage>
      <FormMessage tone="success">{state.message}</FormMessage>
      <SubmitButton className="w-full" pendingLabel={mode === "password" ? "Signing in…" : "Sending…"}>
        {mode === "password" ? "Sign in" : "Email me a sign-in link"}
      </SubmitButton>
      <button
        type="button"
        onClick={() => setMode(mode === "password" ? "link" : "password")}
        className="w-full rounded-md py-1 text-sm text-ink-2 underline decoration-line underline-offset-2 transition-colors duration-150 hover:text-ink"
      >
        {mode === "password" ? "Sign in with a magic link instead" : "Sign in with a password instead"}
      </button>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState<AuthState, FormData>(signUp, {});

  if (state.message) {
    return (
      <div className="space-y-3 rounded-lg border-[1.5px] border-ink bg-surface p-5" role="status">
        <h2 className="font-display text-lg font-bold">Check your inbox</h2>
        <p className="text-sm text-ink-2">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <Field label="Name" htmlFor="name" hint="Optional.">
        <Input id="name" name="name" autoComplete="name" maxLength={100} />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          aria-invalid={Boolean(state.error)}
        />
      </Field>
      <Field label="Password" htmlFor="password" hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <FormMessage>{state.error}</FormMessage>
      <SubmitButton className="w-full" pendingLabel="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.email} />
      </Field>
      <FormMessage>{state.error}</FormMessage>
      <FormMessage tone="success">{state.message}</FormMessage>
      <SubmitButton className="w-full" pendingLabel="Sending…">
        Send reset link
      </SubmitButton>
    </form>
  );
}
