import { describe, expect, it } from "vitest";
import { normalizePage } from "@/lib/collect/page";

describe("normalizePage", () => {
  it.each([
    ["/", "/"],
    ["/pricing", "/pricing"],
    ["/docs/", "/docs"],
    ["//docs///intro/", "/docs/intro"],
    ["/reset?token=secret&email=a@b.c", "/reset"],
    ["/search?q=private", "/search"],
    ["/?utm_source=x", "/"],
    ["/blog/caf%C3%A9", "/blog/café"],
    ["/bad%E0%A4%A", "/bad%E0%A4%A"],
    ["/#/settings", "/#/settings"],
    ["/#/settings?tab=2", "/#/settings"],
    ["/app#", "/app"],
    ["/a\u0000b", "/ab"],
  ])("%s → %s", (input, expected) => {
    expect(normalizePage(input)).toBe(expected);
  });

  it("truncates very long paths", () => {
    expect(normalizePage("/" + "a".repeat(1000))).toHaveLength(512);
  });

  it.each([undefined, null, 42, "", "pricing", "https://example.com/", "/" + "a".repeat(3000)])(
    "rejects %s",
    (input) => {
      expect(normalizePage(input)).toBeNull();
    },
  );
});
