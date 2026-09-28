export const MAX_BODY_BYTES = 4096;

export type CollectPayload = {
  siteId: string;
  event: "page_view";
  page: string;
  referrer: string;
  source: string;
};

/**
 * Validates the tracker payload. Unknown fields are ignored; anything that
 * does not look like a Tinylytics page view is rejected.
 */
export function parsePayload(body: string): CollectPayload | null {
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const input = data as Record<string, unknown>;

  const siteId = input.site_id;
  if (typeof siteId !== "string" || !/^[a-z0-9]{8,32}$/.test(siteId)) return null;

  const event = input.event ?? "page_view";
  if (event !== "page_view") return null;

  if (typeof input.page !== "string" || input.page.length > 2048) return null;

  const referrer = typeof input.referrer === "string" && input.referrer.length <= 2048 ? input.referrer : "";
  const source = typeof input.source === "string" && input.source.length <= 256 ? input.source : "";

  return { siteId, event, page: input.page, referrer, source };
}

/** Reads a request body, giving up once it exceeds `limit` bytes. */
export async function readBody(request: Request, limit = MAX_BODY_BYTES): Promise<string | null> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > limit) return null;
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}
