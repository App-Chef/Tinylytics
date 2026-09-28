import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/auth";
import { bounceRate, countryName, formatCompact, percentChange } from "@/lib/format";
import { isTimezone, normalizeDomain } from "@/lib/sites";

describe("normalizeDomain", () => {
  it.each([
    ["example.com", "example.com"],
    ["https://www.Example.com/pricing?x=1", "example.com"],
    ["http://app.example.co.uk:8080/", "app.example.co.uk"],
    ["example.com.", "example.com"],
    ["bücher.de", "xn--bcher-kva.de"],
  ])("%s → %s", (input, expected) => {
    expect(normalizeDomain(input)).toBe(expected);
  });

  it.each(["", "localhost", "example", "exa mple.com", "-bad.com", "127.0.0.1", "javascript:alert(1)"])(
    "rejects %s",
    (input) => {
      expect(normalizeDomain(input)).toBeNull();
    },
  );
});

describe("safeNext", () => {
  it("only allows local paths", () => {
    expect(safeNext("/sites/abc?range=7d")).toBe("/sites/abc?range=7d");
    expect(safeNext("//evil.example")).toBe("/dashboard");
    expect(safeNext("/\\evil.example")).toBe("/dashboard");
    expect(safeNext("https://evil.example")).toBe("/dashboard");
    expect(safeNext(undefined)).toBe("/dashboard");
  });
});

describe("formatting", () => {
  it("computes bounce rate and change", () => {
    expect(bounceRate(42, 100)).toBe(42);
    expect(bounceRate(0, 0)).toBeNull();
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(5, 0)).toBeNull();
  });

  it("formats numbers and countries", () => {
    expect(formatCompact(9_999)).toBe("9,999");
    expect(formatCompact(12_482)).toBe("12.5K");
    expect(countryName("RW")).toBe("Rwanda");
    expect(countryName("")).toBe("Unknown");
  });

  it("validates timezones", () => {
    expect(isTimezone("Africa/Kigali")).toBe(true);
    expect(isTimezone("UTC")).toBe(true);
    expect(isTimezone("Mars/Olympus")).toBe(false);
  });
});
