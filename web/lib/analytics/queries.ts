import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Dimension, Site } from "@/types/database";
import type { DateRange } from "./range";

// Every query below runs as the signed-in user through RLS-protected SQL
// functions that read pre-aggregated daily rollups. Nothing returns raw
// events to the browser.

export type Summary = {
  visitors: number;
  pageviews: number;
  sessions: number;
  bounces: number;
};

export type SeriesPoint = {
  /** YYYY-MM-DD for daily series, 0-23 for hourly series. */
  key: string;
  visitors: number;
  pageviews: number;
  sessions: number;
};

export type PageRow = { page: string; pageviews: number; visitors: number };
export type BreakdownRow = { value: string; visitors: number; sessions: number; pageviews: number };

export class AnalyticsError extends Error {}

function fail(error: { message: string }): never {
  console.error("tinylytics: analytics query failed", error.message);
  throw new AnalyticsError("We couldn't load your analytics.");
}

const EMPTY: Summary = { visitors: 0, pageviews: 0, sessions: 0, bounces: 0 };

/** Sites owned by the current user, oldest first. */
export const getSites = cache(async (): Promise<Site[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("sites").select("*").order("created_at", { ascending: true });
  if (error) fail(error);
  return data;
});

/** A single site, or null if it does not exist or belongs to someone else. */
export const getSite = cache(async (siteId: string): Promise<Site | null> => {
  if (!/^[0-9a-f-]{36}$/i.test(siteId)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("sites").select("*").eq("id", siteId).maybeSingle();
  if (error) fail(error);
  return data;
});

export async function getDashboardSummary(
  siteId: string,
  range: DateRange,
): Promise<{ current: Summary; previous: Summary }> {
  const supabase = await createClient();
  const [current, previous] = await Promise.all([
    supabase.rpc("tinylytics_summary", { p_site_id: siteId, p_from: range.from, p_to: range.to }),
    supabase.rpc("tinylytics_summary", { p_site_id: siteId, p_from: range.previousFrom, p_to: range.previousTo }),
  ]);
  if (current.error) fail(current.error);
  if (previous.error) fail(previous.error);
  return { current: toSummary(current.data?.[0]), previous: toSummary(previous.data?.[0]) };
}

export async function getTrafficSeries(siteId: string, range: DateRange): Promise<SeriesPoint[]> {
  const supabase = await createClient();
  if (range.granularity === "hour") {
    const { data, error } = await supabase.rpc("tinylytics_hourly_series", { p_site_id: siteId, p_day: range.to });
    if (error) fail(error);
    return data.map((r) => ({
      key: String(r.hour),
      visitors: Number(r.visitors),
      pageviews: Number(r.pageviews),
      sessions: Number(r.sessions),
    }));
  }
  const { data, error } = await supabase.rpc("tinylytics_daily_series", {
    p_site_id: siteId,
    p_from: range.from,
    p_to: range.to,
  });
  if (error) fail(error);
  return data.map((r) => ({
    key: r.day,
    visitors: Number(r.visitors),
    pageviews: Number(r.pageviews),
    sessions: Number(r.sessions),
  }));
}

export async function getTopPages(siteId: string, range: DateRange, limit = 10): Promise<PageRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("tinylytics_top_pages", {
    p_site_id: siteId,
    p_from: range.from,
    p_to: range.to,
    p_limit: limit,
  });
  if (error) fail(error);
  return data.map((r) => ({ page: r.page, pageviews: Number(r.pageviews), visitors: Number(r.visitors) }));
}

export async function getBreakdown(
  siteId: string,
  dimension: Dimension,
  range: DateRange,
  limit = 10,
): Promise<BreakdownRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("tinylytics_breakdown", {
    p_site_id: siteId,
    p_dimension: dimension,
    p_from: range.from,
    p_to: range.to,
    p_limit: limit,
  });
  if (error) fail(error);
  return data.map((r) => ({
    value: r.value,
    visitors: Number(r.visitors),
    sessions: Number(r.sessions),
    pageviews: Number(r.pageviews),
  }));
}

export const getTopReferrers = (siteId: string, range: DateRange) => getBreakdown(siteId, "referrer", range);
export const getCountries = (siteId: string, range: DateRange) => getBreakdown(siteId, "country", range);
export const getDevices = (siteId: string, range: DateRange) => getBreakdown(siteId, "device_type", range);
export const getBrowsers = (siteId: string, range: DateRange) => getBreakdown(siteId, "browser", range);
export const getOperatingSystems = (siteId: string, range: DateRange) => getBreakdown(siteId, "os", range);

export async function getActiveNow(siteId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("tinylytics_active_now", { p_site_id: siteId });
  if (error) fail(error);
  return Number(data);
}

function toSummary(row: Partial<Summary> | undefined): Summary {
  if (!row) return EMPTY;
  return {
    visitors: Number(row.visitors ?? 0),
    pageviews: Number(row.pageviews ?? 0),
    sessions: Number(row.sessions ?? 0),
    bounces: Number(row.bounces ?? 0),
  };
}
