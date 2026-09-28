// A small fixed-window rate limiter kept in memory. Good enough for a single
// server or a handful of serverless instances; each instance counts on its
// own. Put a CDN/WAF rule in front of /api/collect for stronger guarantees.
//
// Keys are unsalted visitor hashes, so expired windows are swept every window:
// nothing is held for much longer than `windowMs`.

type Window = { start: number; count: number };

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const windows = new Map<string, Window>();
  let lastSweep = 0;

  return function allow(key: string, now = Date.now()): boolean {
    if (now - lastSweep >= windowMs) {
      for (const [k, w] of windows) if (now - w.start >= windowMs) windows.delete(k);
      lastSweep = now;
    }
    const current = windows.get(key);
    if (!current || now - current.start >= windowMs) {
      windows.set(key, { start: now, count: 1 });
      return true;
    }
    current.count += 1;
    return current.count <= limit;
  };
}
