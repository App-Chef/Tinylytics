import { describe, expect, it } from "vitest";
import { isBot, parseUserAgent } from "@/lib/collect/user-agent";

const UA = {
  chromeWindows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  edge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0",
  safariMac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
  firefoxLinux: "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0",
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
  ipad: "Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
  androidPhone:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
  androidTablet:
    "Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  samsung:
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36",
  cubot:
    "Mozilla/5.0 (Linux; Android 11; CUBOT P50) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  chromeOs:
    "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
};

describe("parseUserAgent", () => {
  it.each([
    [UA.chromeWindows, "Chrome", "Windows", "desktop"],
    [UA.edge, "Edge", "Windows", "desktop"],
    [UA.safariMac, "Safari", "macOS", "desktop"],
    [UA.firefoxLinux, "Firefox", "Linux", "desktop"],
    [UA.iphone, "Safari", "iOS", "mobile"],
    [UA.ipad, "Safari", "iOS", "tablet"],
    [UA.androidPhone, "Chrome", "Android", "mobile"],
    [UA.androidTablet, "Chrome", "Android", "tablet"],
    [UA.samsung, "Samsung Internet", "Android", "mobile"],
    [UA.chromeOs, "Chrome", "ChromeOS", "desktop"],
  ])("%#", (ua, browser, os, deviceType) => {
    expect(parseUserAgent(ua)).toEqual({ browser, os, deviceType });
  });
});

describe("isBot", () => {
  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/129.0.0.0 Safari/537.36",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "curl/8.5.0",
    "python-requests/2.32.3",
    "Mozilla/5.0 (compatible; UptimeRobot/2.0; http://www.uptimerobot.com/)",
    "",
    "short",
  ])("flags %s", (ua) => {
    expect(isBot(ua)).toBe(true);
  });

  it("does not flag real browsers, including Cubot phones", () => {
    for (const ua of Object.values(UA)) expect(isBot(ua)).toBe(false);
  });
});
