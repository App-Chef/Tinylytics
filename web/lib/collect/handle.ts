import { normalizePage } from "./page";
import { MAX_BODY_BYTES, parsePayload, readBody } from "./payload";
import { createRateLimiter } from "./rate-limit";
import { normalizeReferrer } from "./referrer";
import { clientIp, countryFromHeaders, requestHostname, visitorSeed } from "./request";
import { isBot, parseUserAgent } from "./user-agent";

export type IngestArgs = {
  publicId: string;
  hostname: string | null;
  page: string;
  referrer: string;
  country: string;
  deviceType: string;
  browser: string;
  os: string;
  visitorSeed: string;
};

export type IngestResult = "ok" | "duplicate" | "unknown_site" | "domain_mismatch";

export type CollectDeps = {
  ingest: (args: IngestArgs) => Promise<IngestResult>;
  allow?: (key: string) => boolean;
};

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const defaultLimiter = createRateLimiter({ limit: 120, windowMs: 60_000 });

function reply(status: number): Response {
  // Deliberately empty: the tracker never reads the response, and there is
  // nothing about the site or database worth telling a stranger.
  return new Response(null, { status, headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } });
}

/**
 * POST /api/collect
 *
 * 202  accepted (also returned for bots and duplicates, which are dropped)
 * 400  malformed payload
 * 403  event sent from a domain that does not belong to the site
 * 404  unknown site ID
 * 413  payload too large
 * 429  rate limited
 * 500  storage failed
 */
export async function handleCollect(request: Request, deps: CollectDeps): Promise<Response> {
  const body = await readBody(request, MAX_BODY_BYTES).catch(() => null);
  if (body === null) return reply(413);

  const payload = parsePayload(body);
  if (!payload) return reply(400);

  const page = normalizePage(payload.page);
  if (!page) return reply(400);

  const userAgent = request.headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return reply(202);

  const ip = clientIp(request.headers);
  const seed = visitorSeed(ip, userAgent);
  const allow = deps.allow ?? defaultLimiter;
  if (!allow(`${seed}:${payload.siteId}`)) return reply(429);

  const hostname = requestHostname(request.headers);
  const { browser, os, deviceType } = parseUserAgent(userAgent);

  let result: IngestResult;
  try {
    result = await deps.ingest({
      publicId: payload.siteId,
      hostname,
      page,
      referrer: normalizeReferrer(payload.referrer, payload.source, hostname),
      country: countryFromHeaders(request.headers),
      deviceType,
      browser,
      os,
      visitorSeed: seed,
    });
  } catch (error) {
    console.error("tinylytics: failed to store event", error instanceof Error ? error.message : error);
    return reply(500);
  }

  switch (result) {
    case "ok":
    case "duplicate":
      return reply(202);
    case "unknown_site":
      return reply(404);
    case "domain_mismatch":
      return reply(403);
  }
}
