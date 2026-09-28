// Central place for environment variables. NEXT_PUBLIC_* values are inlined
// into the browser bundle at build time; everything else stays on the server.

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const googleAuthEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";

export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to web/.env.local.",
    );
  }
  return { url, anonKey };
}

export const repositoryUrl = "https://github.com/App-Chef/Tinylytics";
