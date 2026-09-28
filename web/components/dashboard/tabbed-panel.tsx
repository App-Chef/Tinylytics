"use client";

import { useId, useState, type ReactNode } from "react";

/** A panel whose content switches between a few related lists. */
export function TabbedPanel({
  title,
  tabs,
}: {
  title: string;
  tabs: { key: string; label: string; content: ReactNode }[];
}) {
  const [current, setCurrent] = useState(tabs[0]?.key);
  const id = useId();
  const active = tabs.find((t) => t.key === current) ?? tabs[0];

  return (
    <section aria-labelledby={`${id}-title`} className="rounded-lg border-[1.5px] border-line-strong bg-surface">
      <header className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2 sm:px-5">
        <h2 id={`${id}-title`} className="font-display text-[15px] font-bold tracking-tight">
          {title}
        </h2>
        <div role="tablist" aria-label={title} className="flex gap-0.5 rounded-md bg-sunken p-0.5">
          {tabs.map((tab, i) => (
            <button
              key={tab.key}
              id={`${id}-${tab.key}`}
              role="tab"
              type="button"
              aria-selected={tab.key === active.key}
              aria-controls={`${id}-panel`}
              tabIndex={tab.key === active.key ? 0 : -1}
              onClick={() => setCurrent(tab.key)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
                setCurrent(next.key);
                document.getElementById(`${id}-${next.key}`)?.focus();
              }}
              className="h-7 rounded px-2.5 text-xs font-semibold text-muted transition-[background-color,color,box-shadow] duration-150 ease-out hover:text-ink aria-selected:bg-surface aria-selected:text-ink aria-selected:shadow-[0_0_0_1.5px_var(--line-strong)]"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${active.key}`}>
        {active.content}
      </div>
    </section>
  );
}
