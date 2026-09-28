const MAX_PAGE_LENGTH = 512;

/**
 * Normalizes a page path reported by the tracker.
 *
 * - Query strings are always removed: they often contain tokens, emails or
 *   search terms, and they would split one page into many rows.
 * - Hash routes ("#/settings") are kept, without any query part.
 * - Percent-encoding is decoded for readability, duplicate slashes collapsed,
 *   and trailing slashes removed ("/docs/" and "/docs" are the same page).
 *
 * Returns null when the input is not a usable path.
 */
export function normalizePage(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let value = input.trim();
  if (!value.startsWith("/") || value.length > 2048) return null;

  const hashIndex = value.indexOf("#");
  let hash = "";
  if (hashIndex !== -1) {
    hash = value.slice(hashIndex).split("?")[0];
    value = value.slice(0, hashIndex);
  }
  value = value.split("?")[0];

  let path = safeDecode(value).replace(/\/{2,}/g, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  if (hash === "#" || hash === "#/") hash = "";

  const page = (path + (hash ? safeDecode(hash).replace(/\/+$/, "") : ""))
    // Control characters have no place in a path.
    .replace(/[\u0000-\u001f\u007f]/g, "");

  return page.slice(0, MAX_PAGE_LENGTH) || "/";
}

function safeDecode(value: string): string {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}
