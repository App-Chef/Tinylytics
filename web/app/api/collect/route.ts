import { CORS_HEADERS, handleCollect } from "@/lib/collect/handle";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  return handleCollect(request, {
    async ingest(args) {
      const { data, error } = await createAdminClient().rpc("tinylytics_ingest", {
        p_public_id: args.publicId,
        p_hostname: args.hostname,
        p_page: args.page,
        p_referrer: args.referrer,
        p_country: args.country,
        p_device_type: args.deviceType,
        p_browser: args.browser,
        p_os: args.os,
        p_visitor_seed: args.visitorSeed,
      });
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
