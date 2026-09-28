import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Supabase client acting as the signed-in user. Every query goes through RLS.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = supabaseConfig();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // proxy refreshes the session instead.
        }
      },
    },
  });
}
