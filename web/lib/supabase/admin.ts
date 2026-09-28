import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let client: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Service-role client. Bypasses RLS, so it is only used for the public
 * ingestion endpoint, maintenance, and account deletion — never to read data
 * on behalf of a user.
 */
export function createAdminClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }
  client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
