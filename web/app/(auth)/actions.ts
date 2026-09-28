"use server";

import { redirect } from "next/navigation";
import { safeNext } from "@/lib/auth";
import { googleAuthEnabled, siteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string; email?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function friendly(message: string): string {
  if (/invalid login credentials/i.test(message)) return "That email and password don't match.";
  if (/email not confirmed/i.test(message)) return "Confirm your email address first — check your inbox for the link.";
  if (/already registered|already exists/i.test(message))
    return "An account with this email already exists. Try signing in.";
  if (/rate limit|too many/i.test(message)) return "Too many attempts. Wait a minute and try again.";
  if (/password/i.test(message)) return message;
  return "Something went wrong. Please try again.";
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = field(formData, "email");
  const password = formData.get("password");
  if (!EMAIL.test(email) || typeof password !== "string" || !password) {
    return { error: "Enter your email and password.", email };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendly(error.message), email };
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = field(formData, "email");
  const name = field(formData, "name").slice(0, 100);
  const password = formData.get("password");
  if (!EMAIL.test(email)) return { error: "Enter a valid email address.", email };
  if (typeof password !== "string" || password.length < 8) {
    return { error: "Use a password with at least 8 characters.", email };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: name ? { name } : undefined,
      emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { error: friendly(error.message), email };
  if (data.session) redirect("/dashboard");
  return { message: `We sent a confirmation link to ${email}. Open it to finish signing up.`, email };
}

export async function sendMagicLink(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = field(formData, "email");
  if (!EMAIL.test(email)) return { error: "Enter a valid email address.", email };
  const next = safeNext(formData.get("next"));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { error: friendly(error.message), email };
  return { message: `Check ${email} for a sign-in link.`, email };
}

export async function signInWithGoogle(formData: FormData) {
  if (!googleAuthEnabled) redirect("/login");
  const next = safeNext(formData.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function requestPasswordReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = field(formData, "email");
  if (!EMAIL.test(email)) return { error: "Enter a valid email address.", email };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/account/password`,
  });
  if (error) return { error: friendly(error.message), email };
  // Same message whether or not the account exists.
  return { message: `If an account exists for ${email}, a reset link is on its way.`, email };
}
