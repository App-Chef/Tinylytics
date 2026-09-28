import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string | null };

/** The signed-in user, verified from the session JWT, or null. */
export const getUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: data.claims.sub, email: (data.claims.email as string | undefined) ?? null };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** Only allow redirects to paths on this site. */
export function safeNext(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
