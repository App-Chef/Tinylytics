import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const PROTECTED = ["/dashboard", "/sites", "/account"];
const AUTH_PAGES = ["/login", "/signup"];

/**
 * Refreshes the Supabase session cookie and guards dashboard routes. Pages
 * still check the user themselves; this only avoids rendering them signed out.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  // getClaims() validates the JWT; do not put code between client creation and this call.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  const redirectTo = (path: string) => {
    const target = request.nextUrl.clone();
    target.pathname = path;
    target.search = "";
    if (path === "/login") target.searchParams.set("next", pathname + search);
    const redirect = NextResponse.redirect(target);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  };

  if (!signedIn && PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return redirectTo("/login");
  }
  if (signedIn && AUTH_PAGES.includes(pathname)) {
    return redirectTo("/dashboard");
  }
  return response;
}
