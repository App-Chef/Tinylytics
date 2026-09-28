"use client";

import { useState } from "react";
import type { PageRow } from "@/lib/analytics/queries";
import { BreakdownList } from "./breakdown-list";

export function PagesPanel({ rows }: { rows: PageRow[] }) {
  const [sort, setSort] = useState<"pageviews" | "visitors">("pageviews");
  const sorted = [...rows].sort((a, b) => b[sort] - a[sort] || a.page.localeCompare(b.page)).slice(0, 10);

  return (
    <section aria-labelledby="pages-title" className="rounded-lg border-[1.5px] border-line-strong bg-surface">
      <header className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2 sm:px-5">
        <h2 id="pages-title" className="font-display text-[15px] font-bold tracking-tight">
          Top pages
        </h2>
        <div role="group" aria-label="Sort pages by" className="flex gap-0.5 rounded-md bg-sunken p-0.5">
          {(
            [
              ["pageviews", "Views"],
              ["visitors", "Visitors"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={sort === key}
              onClick={() => setSort(key)}
              className="h-7 rounded px-2.5 text-xs font-semibold text-muted transition-[background-color,color,box-shadow] duration-150 ease-out hover:text-ink aria-pressed:bg-surface aria-pressed:text-ink aria-pressed:shadow-[0_0_0_1.5px_var(--line-strong)]"
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <BreakdownList
        mono
        valueLabel={sort === "pageviews" ? "Views" : "Visitors"}
        items={sorted.map((r) => ({ key: r.page, label: r.page, title: r.page, value: r[sort] }))}
      />
    </section>
  );
}
