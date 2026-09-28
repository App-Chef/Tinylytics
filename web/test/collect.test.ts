import { describe, expect, it, vi } from "vitest";
import { handleCollect, type CollectDeps, type IngestArgs } from "@/lib/collect/handle";
import { parsePayload } from "@/lib/collect/payload";
import { createRateLimiter } from "@/lib/collect/rate-limit";

const CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://tinylytics.app/api/collect", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: {
      "content-type": "text/plain",
      "user-agent": CHROME,
      origin: "https://amazu.example",
      "x-forwarded-for": "203.0.113.7, 10.0.0.1",
      "x-vercel-ip-country": "RW",
      ...headers,
    },
  });
}

const valid = {
  site_id: "abc123def456",
  event: "page_view",
  page: "/pricing?plan=pro",
  referrer: "https://www.google.com/search",
};

function deps(result: Awaited<ReturnType<CollectDeps["ingest"]>> = "ok") {
  const calls: IngestArgs[] = [];
  return {
    calls,
    deps: {
      ingest: vi.fn(async (args: IngestArgs) => {
        calls.push(args);
        return result;
      }),
      allow: () => true,
    } satisfies CollectDeps,
  };
}

describe("POST /api/collect", () => {
  it("accepts a valid page view and derives safe metadata", async () => {
    const { calls, deps: d } = deps();
    const res = await handleCollect(request(valid), d);
    expect(res.status).toBe(202);
    expect(await res.text()).toBe("");
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      publicId: "abc123def456",
      hostname: "amazu.example",
      page: "/pricing",
      referrer: "Google",
      country: "RW",
      deviceType: "desktop",
      browser: "Chrome",
      os: "Windows",
    });
  });

  it("never passes the raw IP or user agent to storage", async () => {
    const { calls, deps: d } = deps();
    await handleCollect(request(valid), d);
    const serialized = JSON.stringify(calls[0]);
    expect(serialized).not.toContain("203.0.113.7");
    expect(serialized).not.toContain("Mozilla");
    expect(calls[0].visitorSeed).toMatch(/^[0-9a-f]{64}$/);
  });

  it("gives the same visitor seed for the same IP and browser", async () => {
    const { calls, deps: d } = deps();
    await handleCollect(request(valid), d);
    await handleCollect(request(valid), d);
    await handleCollect(request(valid, { "x-forwarded-for": "198.51.100.1" }), d);
    expect(calls[0].visitorSeed).toBe(calls[1].visitorSeed);
    expect(calls[2].visitorSeed).not.toBe(calls[0].visitorSeed);
  });

  it.each([
    ["not json", "{"],
    ["an array", [valid]],
    ["missing site", { ...valid, site_id: undefined }],
    ["bad site id", { ...valid, site_id: "Robert'); DROP TABLE" }],
    ["unknown event", { ...valid, event: "purchase" }],
    ["relative page", { ...valid, page: "pricing" }],
    ["absolute URL page", { ...valid, page: "https://evil.example/" }],
    ["non-string page", { ...valid, page: 42 }],
  ])("rejects %s with 400", async (_, body) => {
    const { deps: d } = deps();
    const res = await handleCollect(request(body), d);
    expect(res.status).toBe(400);
    expect(d.ingest).not.toHaveBeenCalled();
  });

  it("rejects oversized payloads with 413", async () => {
    const { deps: d } = deps();
    const res = await handleCollect(request({ ...valid, padding: "x".repeat(5000) }), d);
    expect(res.status).toBe(413);
    expect(d.ingest).not.toHaveBeenCalled();
  });

  it("silently drops bots", async () => {
    const { deps: d } = deps();
    const res = await handleCollect(
      request(valid, { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" }),
      d,
    );
    expect(res.status).toBe(202);
    expect(d.ingest).not.toHaveBeenCalled();
  });

  it("rate limits", async () => {
    const { deps: d } = deps();
    const res = await handleCollect(request(valid), { ...d, allow: () => false });
    expect(res.status).toBe(429);
    expect(d.ingest).not.toHaveBeenCalled();
  });

  it("maps storage results to status codes", async () => {
    expect((await handleCollect(request(valid), deps("duplicate").deps)).status).toBe(202);
    expect((await handleCollect(request(valid), deps("unknown_site").deps)).status).toBe(404);
    expect((await handleCollect(request(valid), deps("domain_mismatch").deps)).status).toBe(403);
  });

  it("returns 500 without details when storage fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handleCollect(request(valid), {
      ingest: async () => {
        throw new Error("connection refused to db.internal:5432");
      },
      allow: () => true,
    });
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("");
    spy.mockRestore();
  });

  it("falls back to the Referer header, and to no hostname", async () => {
    const { calls, deps: d } = deps();
    await handleCollect(request(valid, { origin: "", referer: "https://www.amazu.example/pricing" }), d);
    await handleCollect(request(valid, { origin: "null" }), d);
    const bare = new Request("https://tinylytics.app/api/collect", {
      method: "POST",
      body: JSON.stringify(valid),
      headers: { "user-agent": CHROME },
    });
    await handleCollect(bare, d);
    expect(calls.map((c) => c.hostname)).toEqual(["www.amazu.example", null, null]);
    expect(calls[2].country).toBe("");
  });
});

describe("parsePayload", () => {
  it("defaults the event to page_view and ignores unknown fields", () => {
    expect(parsePayload(JSON.stringify({ site_id: "abcdefgh", page: "/", extra: { a: 1 } }))).toEqual({
      siteId: "abcdefgh",
      event: "page_view",
      page: "/",
      referrer: "",
      source: "",
    });
  });
});

describe("rate limiter", () => {
  it("allows up to the limit per window", () => {
    const allow = createRateLimiter({ limit: 3, windowMs: 1000 });
    expect([1, 2, 3, 4].map(() => allow("a", 0))).toEqual([true, true, true, false]);
    expect(allow("b", 10)).toBe(true);
    expect(allow("a", 1000)).toBe(true);
  });
});
