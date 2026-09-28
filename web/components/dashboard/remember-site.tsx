"use client";

import { useEffect } from "react";

/** Remembers the last site viewed so /dashboard reopens it. Not sensitive. */
export function RememberSite({ siteId }: { siteId: string }) {
  useEffect(() => {
    document.cookie = `tl_site=${siteId}; path=/; max-age=31536000; samesite=lax`;
  }, [siteId]);
  return null;
}
