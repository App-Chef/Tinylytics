export const RANGES = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
] as const;

export type RangeKey = (typeof RANGES)[number]["key"];

export const DEFAULT_RANGE: RangeKey = "30d";

export type DateRange = {
  key: RangeKey;
  label: string;
  /** Inclusive local dates (YYYY-MM-DD) in the site's timezone. */
  from: string;
  to: string;
  /** The period of the same length immediately before. */
  previousFrom: string;
  previousTo: string;
  /** Hourly buckets for a single day, daily buckets otherwise. */
  granularity: "hour" | "day";
};

export function parseRange(value: unknown): RangeKey {
  return RANGES.some((r) => r.key === value) ? (value as RangeKey) : DEFAULT_RANGE;
}

/** Today's date in the given IANA timezone, as YYYY-MM-DD. */
export function localToday(timeZone: string, now = new Date()): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function resolveRange(key: RangeKey, timeZone: string, now = new Date()): DateRange {
  const range = RANGES.find((r) => r.key === key) ?? RANGES[2];
  const to = localToday(timeZone, now);
  const from = addDays(to, -(range.days - 1));
  return {
    key: range.key,
    label: range.key === "today" ? "Today" : `Last ${range.label}`,
    from,
    to,
    previousFrom: addDays(from, -range.days),
    previousTo: addDays(from, -1),
    granularity: range.key === "today" ? "hour" : "day",
  };
}
