const integer = new Intl.NumberFormat("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export function formatNumber(value: number): string {
  return integer.format(value);
}

/** 1,234 → "1,234"; 12,345 → "12.3K". Keeps big numbers short on small screens. */
export function formatCompact(value: number): string {
  return value < 10_000 ? integer.format(value) : compact.format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

/** Bounce rate: share of sessions with exactly one page view. */
export function bounceRate(bounces: number, sessions: number): number | null {
  return sessions > 0 ? (bounces / sessions) * 100 : null;
}

/** Relative change between two periods, or null when there is nothing to compare. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function countryName(code: string): string {
  if (!code) return "Unknown";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export function sourceName(value: string): string {
  return value || "Direct / none";
}

export function deviceName(value: string): string {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatDay(day: string, style: "short" | "long" = "short"): string {
  const date = new Date(`${day}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(style === "long" ? { weekday: "short", year: "numeric" } : {}),
  });
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}
