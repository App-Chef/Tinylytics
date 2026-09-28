"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { buttonClass } from "@/components/ui/button";

export function SectionError({ title }: { title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div
      role="alert"
      className="rounded-lg border-[1.5px] border-dashed border-line-strong bg-surface px-5 py-8 text-center"
    >
      <p className="font-semibold">We couldn&apos;t load {title.toLowerCase()}.</p>
      <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
      <button
        type="button"
        onClick={() => start(() => router.refresh())}
        disabled={pending}
        className={buttonClass("secondary", "sm", "mt-4")}
      >
        {pending ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}
