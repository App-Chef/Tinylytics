import { siteUrl } from "@/lib/env";

const DOMAIN = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{0,61}[a-z0-9]$/;

/**
 * Accepts what people paste ("https://www.Example.com/pricing") and returns the
 * bare domain ("example.com"). Subdomains of the domain are tracked too, so
 * "www." is dropped. Returns null if it is not a valid public domain.
 */
export function normalizeDomain(input: string): string | null {
  let value = input.trim().toLowerCase();
  if (!value) return null;
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  value = value.split(/[/?#]/)[0];
  value = value.replace(/:\d+$/, "").replace(/\.$/, "");
  value = value.replace(/^www\./, "");
  try {
    // Converts internationalized domains to punycode.
    value = new URL(`http://${value}`).hostname;
  } catch {
    return null;
  }
  if (value.length > 253 || !DOMAIN.test(value)) return null;
  return value;
}

export function validateSiteName(input: string): string | null {
  const name = input.trim();
  return name.length >= 1 && name.length <= 80 ? name : null;
}

export function timezones(): string[] {
  const zones = Intl.supportedValuesOf("timeZone");
  return zones.includes("UTC") ? zones : ["UTC", ...zones];
}

export function isTimezone(value: string): boolean {
  if (value === "UTC") return true;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function trackerSnippet(publicId: string): string {
  return `<script defer src="${siteUrl}/tracker.js" data-site="${publicId}"></script>`;
}
