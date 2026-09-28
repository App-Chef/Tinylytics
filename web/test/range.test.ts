import { describe, expect, it } from "vitest";
import { addDays, localToday, parseRange, resolveRange } from "@/lib/analytics/range";

// 2026-09-28 23:30 UTC: already the 29th in Kigali (UTC+2), still the 28th in New York.
const now = new Date("2026-09-28T23:30:00Z");

describe("date ranges", () => {
  it("uses the site's timezone for today", () => {
    expect(localToday("UTC", now)).toBe("2026-09-28");
    expect(localToday("Africa/Kigali", now)).toBe("2026-09-29");
    expect(localToday("America/New_York", now)).toBe("2026-09-28");
  });

  it("resolves inclusive ranges and the previous period", () => {
    expect(resolveRange("7d", "UTC", now)).toMatchObject({
      from: "2026-09-22",
      to: "2026-09-28",
      previousFrom: "2026-09-15",
      previousTo: "2026-09-21",
      granularity: "day",
    });
    expect(resolveRange("today", "Africa/Kigali", now)).toMatchObject({
      from: "2026-09-29",
      to: "2026-09-29",
      granularity: "hour",
    });
    const d30 = resolveRange("30d", "UTC", now);
    expect(d30.from).toBe("2026-08-30");
    expect(d30.label).toBe("Last 30 days");
  });

  it("defaults to 30 days for unknown input", () => {
    expect(parseRange("7d")).toBe("7d");
    expect(parseRange("1y")).toBe("30d");
    expect(parseRange(undefined)).toBe("30d");
    expect(parseRange(["7d"])).toBe("30d");
  });

  it("adds days across month and leap boundaries", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});
