// Deliberately coarse user-agent parsing. Tinylytics only needs the browser
// family, operating system and device class — no versions, no models.

export type DeviceType = "desktop" | "mobile" | "tablet";

export type ParsedUserAgent = {
  browser: string;
  os: string;
  deviceType: DeviceType;
};

const BOT_PATTERN =
  /bot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pagespeed|pingdom|uptime|monitor|preview|scanner|curl\/|wget|python-|httpclient|okhttp|axios|node-fetch|undici|go-http|java\/|libwww|phantomjs|facebookexternalhit|embedly|whatsapp|vercel-screenshot|prerender/i;

/** Known crawlers, uptime monitors, link previewers and HTTP libraries. */
export function isBot(userAgent: string): boolean {
  if (!userAgent || userAgent.length < 20) return true;
  // "Cubot" is a phone brand, not a crawler.
  return BOT_PATTERN.test(userAgent.replace(/cubot/gi, ""));
}

export function parseUserAgent(ua: string): ParsedUserAgent {
  return { browser: browserOf(ua), os: osOf(ua), deviceType: deviceOf(ua) };
}

function browserOf(ua: string): string {
  if (/Edg(e|A|iOS)?\//.test(ua)) return "Edge";
  if (/OPR\/|Opera|OPT\//.test(ua)) return "Opera";
  if (/SamsungBrowser\//.test(ua)) return "Samsung Internet";
  if (/Firefox\/|FxiOS\//.test(ua)) return "Firefox";
  if (/Chrome\/|CriOS\/|Chromium\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && /Version\/|Mobile\//.test(ua)) return "Safari";
  return "Other";
}

function osOf(ua: string): string {
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/Linux|X11/.test(ua)) return "Linux";
  return "Other";
}

function deviceOf(ua: string): DeviceType {
  if (/iPad|Tablet|PlayBook|Silk\//.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) return "tablet";
  if (/Mobi|iPhone|iPod|Android|Windows Phone/.test(ua)) return "mobile";
  return "desktop";
}
