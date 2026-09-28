"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Shows whether the site has received its first event. While waiting, checks
 * every few seconds (RLS-protected read of the user's own site), then
 * refreshes the page once data arrives. No manual verification step.
 */
export function TrackingStatus({ siteId, firstEventAt }: { siteId: string; firstEventAt: string | null }) {
  const [receivedAt, setReceivedAt] = useState(firstEventAt);
  const router = useRouter();

  useEffect(() => {
    if (receivedAt) return;
    const supabase = createClient();
    let stopped = false;
    let delay = 4000;
    let timer: number;

    const check = async () => {
      if (document.visibilityState === "visible") {
        const { data } = await supabase.from("sites").select("first_event_at").eq("id", siteId).maybeSingle();
        if (stopped) return;
        if (data?.first_event_at) {
          setReceivedAt(data.first_event_at);
          router.refresh();
          return;
        }
      }
      // Back off gently so an idle tab does not poll forever at full speed.
      delay = Math.min(delay * 1.25, 30000);
      timer = window.setTimeout(check, delay);
    };
    timer = window.setTimeout(check, delay);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [receivedAt, siteId, router]);

  return (
    <div role="status" aria-live="polite" className="flex items-start gap-3">
      <span className="relative mt-1 flex size-3 shrink-0" aria-hidden="true">
        {receivedAt ? (
          <span className="size-3 rounded-full bg-good" />
        ) : (
          <>
            <span className="absolute inline-flex size-full animate-ping rounded-full border-2 border-muted opacity-50 motion-reduce:hidden" />
            <span className="relative size-3 rounded-full border-2 border-muted" />
          </>
        )}
      </span>
      <div>
        <p className="font-semibold">
          {receivedAt ? "Tracking installed · Receiving data" : "Waiting for your first event"}
        </p>
        <p className="text-sm text-muted">
          {receivedAt
            ? `First event received ${new Date(receivedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}.`
            : "Open your site in a browser once the script is added. This updates on its own."}
        </p>
      </div>
    </div>
  );
}
