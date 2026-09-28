import { createHash } from "node:crypto";

/**
 * Best-effort client IP. Only used transiently: to derive the visitor hash,
 * for rate limiting, and never stored.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("cf-connecting-ip") || headers.get("x-real-ip") || "";
}

const COUNTRY_HEADERS = ["x-vercel-ip-country", "cf-ipcountry", "cloudfront-viewer-country", "x-country-code"];

/**
 * Country code provided by the hosting platform or CDN (Vercel, Cloudflare,
 * CloudFront, or any reverse proxy that sets X-Country-Code). Tinylytics never
 * looks up anything more precise than the country.
 */
export function countryFromHeaders(headers: Headers): string {
  for (const name of COUNTRY_HEADERS) {
    const value = headers.get(name)?.trim().toUpperCase();
    if (value && /^[A-Z]{2}$/.test(value) && value !== "XX" && value !== "T1") return value;
  }
  return "";
}

/** Hostname of the page that sent the event, from Origin or Referer. */
export function requestHostname(headers: Headers): string | null {
  for (const name of ["origin", "referer"]) {
    const value = headers.get(name);
    if (!value || value === "null") continue;
    try {
      return new URL(value).hostname.toLowerCase();
    } catch {
      // Ignore malformed headers.
    }
  }
  return null;
}

/**
 * Unsalted hash of IP and user agent. The database combines it with a daily
 * random salt; neither the IP nor this value is stored.
 */
export function visitorSeed(ip: string, userAgent: string): string {
  return createHash("sha256").update(`${ip}\n${userAgent}`).digest("hex");
}
