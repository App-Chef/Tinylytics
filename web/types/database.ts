// Types for the Tinylytics database schema (supabase/migrations).
// Keep in sync with the migrations, or regenerate with:
//   npx supabase gen types typescript --local > web/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Rollup<Row> = {
  Row: Row;
  Insert: never;
  Update: never;
  Relationships: [];
};

export type Dimension = "referrer" | "country" | "device_type" | "browser" | "os";

export type Database = {
  __InternalSupabase: { PostgrestVersion: "12" };
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string | null; name: string | null; created_at: string; updated_at: string };
        Insert: never;
        Update: { name?: string | null };
        Relationships: [];
      };
      sites: {
        Row: {
          id: string;
          user_id: string;
          public_id: string;
          name: string;
          domain: string;
          timezone: string;
          first_event_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: { name: string; domain: string; timezone?: string };
        Update: { name?: string; domain?: string; timezone?: string; public_id?: string };
        Relationships: [];
      };
      sessions: Rollup<{
        id: string;
        site_id: string;
        visitor_id: string;
        day: string;
        started_at: string;
        last_seen_at: string;
        entry_page: string;
        exit_page: string;
        pageviews: number;
        referrer: string;
        country: string;
        device_type: string;
        browser: string;
        os: string;
      }>;
      events: Rollup<{
        id: number;
        site_id: string;
        event_type: "page_view" | "session_start";
        timestamp: string;
        page: string;
        referrer: string;
        country: string;
        device_type: string;
        browser: string;
        os: string;
        session_id: string;
        visitor_id: string;
      }>;
      daily_stats: Rollup<{
        site_id: string;
        day: string;
        visitors: number;
        pageviews: number;
        sessions: number;
        bounces: number;
      }>;
      daily_pages: Rollup<{ site_id: string; day: string; page: string; pageviews: number; visitors: number }>;
      daily_breakdowns: Rollup<{
        site_id: string;
        day: string;
        dimension: Dimension;
        value: string;
        visitors: number;
        sessions: number;
        pageviews: number;
      }>;
    };
    Views: { [_ in never]: never };
    Functions: {
      tinylytics_ingest: {
        Args: {
          p_public_id: string;
          p_hostname: string | null;
          p_page: string;
          p_referrer: string;
          p_country: string;
          p_device_type: string;
          p_browser: string;
          p_os: string;
          p_visitor_seed: string;
          p_now?: string;
        };
        Returns: "ok" | "duplicate" | "unknown_site" | "domain_mismatch";
      };
      tinylytics_prune: {
        Args: { p_retention_days?: number };
        Returns: Json;
      };
      tinylytics_public_id: { Args: Record<string, never>; Returns: string };
      tinylytics_summary: {
        Args: { p_site_id: string; p_from: string; p_to: string };
        Returns: { visitors: number; pageviews: number; sessions: number; bounces: number }[];
      };
      tinylytics_daily_series: {
        Args: { p_site_id: string; p_from: string; p_to: string };
        Returns: { day: string; visitors: number; pageviews: number; sessions: number }[];
      };
      tinylytics_hourly_series: {
        Args: { p_site_id: string; p_day: string };
        Returns: { hour: number; visitors: number; pageviews: number; sessions: number }[];
      };
      tinylytics_top_pages: {
        Args: { p_site_id: string; p_from: string; p_to: string; p_limit?: number };
        Returns: { page: string; pageviews: number; visitors: number }[];
      };
      tinylytics_breakdown: {
        Args: { p_site_id: string; p_dimension: Dimension; p_from: string; p_to: string; p_limit?: number };
        Returns: { value: string; visitors: number; sessions: number; pageviews: number }[];
      };
      tinylytics_active_now: { Args: { p_site_id: string }; Returns: number };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Site = Database["public"]["Tables"]["sites"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
