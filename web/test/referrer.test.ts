import { describe, expect, it } from "vitest";
import { normalizeReferrer } from "@/lib/collect/referrer";

describe("normalizeReferrer", () => {
  it.each([
    ["https://www.google.com/search", "Google"],
    ["https://www.google.co.uk/", "Google"],
    ["https://t.co/abc", "X"],
    ["https://x.com/someone", "X"],
    ["https://github.com/App-Chef/Tinylytics", "GitHub"],
    ["https://news.ycombinator.com/item", "Hacker News"],
    ["https://old.reddit.com/r/webdev", "Reddit"],
    ["https://np.reddit.com/r/webdev", "Reddit"],
    ["https://l.facebook.com/l.php", "Facebook"],
    ["https://duckduckgo.com/", "DuckDuckGo"],
    ["https://chatgpt.com/", "ChatGPT"],
    ["https://someone.substack.com/p/post", "Substack"],
    ["https://www.blog.example.org/post", "blog.example.org"],
  ])("%s → %s", (referrer, expected) => {
    expect(normalizeReferrer(referrer, "", "amazu.example")).toBe(expected);
  });

  it("drops referrers from the same site and its subdomains", () => {
    expect(normalizeReferrer("https://amazu.example/pricing", "", "amazu.example")).toBe("");
    expect(normalizeReferrer("https://www.amazu.example/", "", "amazu.example")).toBe("");
    expect(normalizeReferrer("https://docs.amazu.example/", "", "www.amazu.example")).toBe("");
  });

  it("uses the campaign source when there is no referrer", () => {
    expect(normalizeReferrer("", "newsletter", "amazu.example")).toBe("Newsletter");
    expect(normalizeReferrer("", "HN", "amazu.example")).toBe("Hacker News");
    expect(normalizeReferrer("", "  Spring <script>Launch ", "amazu.example")).toBe("spring scriptlaunch");
  });

  it("ignores non-web referrers and garbage", () => {
    expect(normalizeReferrer("android-app://com.google.android.gm", "", null)).toBe("");
    expect(normalizeReferrer("not a url", "", null)).toBe("");
    expect(normalizeReferrer(undefined, undefined, null)).toBe("");
  });
});
