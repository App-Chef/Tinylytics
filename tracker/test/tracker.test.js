import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "../src/tracker.js"), "utf8");

/**
 * Loads the tracker into a fresh page and records what it sends.
 */
function load({
  url = "https://amazu.example/pricing?plan=pro&utm_source=newsletter",
  referrer = "https://www.google.com/search?q=secret",
  attrs = 'data-site="abc123"',
  beacon = "ok",
  fetchImpl = "ok",
  setup,
} = {}) {
  const dom = new JSDOM(
    `<!doctype html><html><head><script src="https://tinylytics.app/tracker.js" ${attrs}></script></head><body></body></html>`,
    { url, referrer, runScripts: "outside-only", pretendToBeVisual: true },
  );
  const w = dom.window;
  const sent = [];

  w.Blob = class {
    constructor(parts) {
      this.data = parts.join("");
    }
  };
  Object.defineProperty(w.navigator, "sendBeacon", {
    configurable: true,
    value:
      beacon === "missing"
        ? undefined
        : (endpoint, blob) => {
            if (beacon === "throws") throw new Error("beacon failed");
            if (beacon === "refused") return false;
            sent.push({ via: "beacon", endpoint, body: JSON.parse(blob.data) });
            return true;
          },
  });
  w.fetch = (endpoint, init) => {
    if (fetchImpl === "throws") throw new Error("fetch failed");
    sent.push({ via: "fetch", endpoint, body: JSON.parse(init.body), init });
    return fetchImpl === "rejects" ? Promise.reject(new Error("offline")) : Promise.resolve({ ok: true });
  };
  setup?.(w);

  w.eval(source);
  return { w, sent };
}

describe("tracker", () => {
  it("sends a page view without the query string", () => {
    const { sent } = load();
    expect(sent).toHaveLength(1);
    expect(sent[0].endpoint).toBe("https://tinylytics.app/api/collect");
    expect(sent[0].body).toEqual({
      site_id: "abc123",
      event: "page_view",
      page: "/pricing",
      referrer: "https://www.google.com/search",
      source: "newsletter",
    });
  });

  it("does not send referrers from the same site", () => {
    const { sent } = load({ referrer: "https://amazu.example/" });
    expect(sent[0].body.referrer).toBe("");
  });

  it("tracks client-side navigation once per URL change", () => {
    const { w, sent } = load();
    w.history.pushState({}, "", "/docs");
    w.history.pushState({}, "", "/docs?tab=2"); // query change only
    w.history.replaceState({}, "", "/docs"); // same page
    w.history.pushState({}, "", "/about");
    expect(sent.map((s) => s.body.page)).toEqual(["/pricing", "/docs", "/about"]);
    // Navigation events never repeat the landing referrer.
    expect(sent[1].body.referrer).toBe("");
    expect(sent[1].body.source).toBe("");
  });

  it("tracks back/forward navigation", () => {
    const { w, sent } = load();
    w.history.pushState({}, "", "/docs");
    w.history.replaceState({}, "", "/pricing"); // simulate the URL a popstate would restore
    w.dispatchEvent(new w.PopStateEvent("popstate"));
    expect(sent.map((s) => s.body.page)).toEqual(["/pricing", "/docs", "/pricing"]);
  });

  it("includes the hash only in hash mode", () => {
    const { w, sent } = load({ url: "https://amazu.example/#/home", attrs: 'data-site="abc123" data-hash="true"' });
    w.location.hash = "#/settings";
    w.dispatchEvent(new w.HashChangeEvent("hashchange"));
    expect(sent.map((s) => s.body.page)).toEqual(["/#/home", "/#/settings"]);
  });

  it("falls back to fetch when sendBeacon is unavailable or refuses", () => {
    for (const beacon of ["missing", "refused", "throws"]) {
      const { sent } = load({ beacon });
      expect(sent).toHaveLength(1);
      expect(sent[0].via).toBe("fetch");
      expect(sent[0].init).toMatchObject({ method: "POST", keepalive: true, credentials: "omit" });
    }
  });

  it("never throws when the network fails", () => {
    expect(() => load({ beacon: "missing", fetchImpl: "throws" })).not.toThrow();
    expect(() => load({ beacon: "missing", fetchImpl: "rejects" })).not.toThrow();
  });

  it("keeps the host page's history API working", () => {
    const { w } = load({ beacon: "throws", fetchImpl: "throws" });
    w.history.pushState({ a: 1 }, "", "/next");
    expect(w.location.pathname).toBe("/next");
    expect(w.history.state).toEqual({ a: 1 });
  });

  it("does nothing without a site id", () => {
    const { sent } = load({ attrs: "" });
    expect(sent).toHaveLength(0);
  });

  it("only initialises once when included twice", () => {
    const { w, sent } = load();
    w.eval(source);
    w.history.pushState({}, "", "/docs");
    expect(sent).toHaveLength(2);
  });

  it("uses a custom endpoint", () => {
    const { sent } = load({ attrs: 'data-site="abc123" data-api="https://stats.example.com/api/collect"' });
    expect(sent[0].endpoint).toBe("https://stats.example.com/api/collect");
  });

  it("ignores localhost unless allowed", () => {
    expect(load({ url: "http://localhost:3000/" }).sent).toHaveLength(0);
    expect(load({ url: "http://127.0.0.1:3000/" }).sent).toHaveLength(0);
    expect(
      load({ url: "http://localhost:3000/", attrs: 'data-site="abc123" data-allow-localhost="true"' }).sent,
    ).toHaveLength(1);
  });

  it("ignores automated browsers", () => {
    const { sent } = load({
      setup: (w) => Object.defineProperty(w.navigator, "webdriver", { value: true }),
    });
    expect(sent).toHaveLength(0);
  });

  it("lets site owners exclude their own browser", () => {
    const { sent } = load({ setup: (w) => w.localStorage.setItem("tinylytics_ignore", "true") });
    expect(sent).toHaveLength(0);
  });

  it("respects Do Not Track and GPC when asked to", () => {
    const dnt = (w) => Object.defineProperty(w.navigator, "doNotTrack", { value: "1" });
    expect(load({ setup: dnt }).sent).toHaveLength(1);
    expect(load({ setup: dnt, attrs: 'data-site="abc123" data-respect-dnt="true"' }).sent).toHaveLength(0);
  });

  it("waits for prerendered pages to become visible", () => {
    let state = "prerender";
    const { w, sent } = load({
      setup: (w) => Object.defineProperty(w.document, "visibilityState", { get: () => state }),
    });
    expect(sent).toHaveLength(0);
    state = "visible";
    w.document.dispatchEvent(new w.Event("visibilitychange"));
    expect(sent).toHaveLength(1);
  });

  it("counts pages restored from the back/forward cache", () => {
    const { w, sent } = load();
    const e = new w.Event("pageshow");
    Object.defineProperty(e, "persisted", { value: true });
    w.dispatchEvent(e);
    expect(sent).toHaveLength(2);
  });
});
