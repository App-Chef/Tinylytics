import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const response = NextResponse.redirect(new URL("/", request.nextUrl.origin), { status: 303 });
  response.cookies.delete("tl_site");
  return response;
}
