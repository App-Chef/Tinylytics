import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Deletes raw events older than DATA_RETENTION_DAYS (default 395). Daily
// rollups are kept. Call it once a day, e.g. with Vercel Cron (see
// vercel.json) or any scheduler:
//   curl -H "Authorization: Bearer $CRON_SECRET" https://your-host/api/cron/prune

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const days = Number(process.env.DATA_RETENTION_DAYS) || 395;
  const { data, error } = await createAdminClient().rpc("tinylytics_prune", { p_retention_days: days });
  if (error) {
    console.error("tinylytics: prune failed", error.message);
    return Response.json({ error: "Prune failed" }, { status: 500 });
  }
  return Response.json({ retentionDays: days, ...(data as object) });
}
