"use client";

import { useState } from "react";
import type { SeriesPoint, Summary } from "@/lib/analytics/queries";
import { bounceRate, formatCompact, formatNumber, formatPercent, percentChange } from "@/lib/format";
import { TrafficChart } from "./traffic-chart";

type Metric = "visitors" | "pageviews" | "sessions";

const METRICS: { key: Metric; label: string }[] = [
  { key: "visitors", label: "Visitors" },
  { key: "pageviews", label: "Page views" },
  { key: "sessions", label: "Sessions" },
];

function Delta({ change, goodWhenUp = true }: { change: number | null; goodWhenUp?: boolean }) {
  if (change === null || !Number.isFinite(change)) return <span className="text-xs text-muted">&nbsp;</span>;
  const rounded = Math.round(change);
  if (rounded === 0) return <span className="text-xs text-muted">No change</span>;
  const up = rounded > 0;
  const good = up === goodWhenUp;
  return (
    <span
      className={`tabular inline-flex items-center gap-0.5 text-xs font-semibold ${good ? "text-good" : "text-danger"}`}
    >
      <span aria-hidden="true">{up ? "↑" : "↓"}</span>
      <span className="sr-only">{up ? "Up" : "Down"}</span>
      {Math.abs(rounded)}%
    </span>
  );
}

export function TrafficPanel({
  current,
  previous,
  series,
  granularity,
  drawn,
  compare,
}: {
  current: Summary;
  previous: Summary;
  series: SeriesPoint[];
  granularity: "hour" | "day";
  drawn: number;
  /** Whether a previous-period comparison is meaningful for this range. */
  compare: boolean;
}) {
  const [metric, setMetric] = useState<Metric>("visitors");
  const rate = bounceRate(current.bounces, current.sessions);
  const previousRate = bounceRate(previous.bounces, previous.sessions);
  const pagesPerSession = current.sessions ? current.pageviews / current.sessions : null;
  const active = METRICS.find((m) => m.key === metric)!;

  return (
    <section aria-label="Traffic" className="rounded-lg border-[1.5px] border-line-strong bg-surface">
      <div role="tablist" aria-label="Chart metric" className="grid grid-cols-2 border-b border-line md:grid-cols-4">
        {METRICS.map((m, i) => {
          const selected = m.key === metric;
          return (
            <button
              key={m.key}
              role="tab"
              type="button"
              id={`metric-${m.key}`}
              aria-selected={selected}
              aria-controls="traffic-chart"
              tabIndex={selected ? 0 : -1}
              onClick={() => setMetric(m.key)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                const next = METRICS[(i + (e.key === "ArrowRight" ? 1 : METRICS.length - 1)) % METRICS.length];
                setMetric(next.key);
                document.getElementById(`metric-${next.key}`)?.focus();
              }}
              className={
                "group relative px-4 py-4 text-left transition-colors duration-150 ease-out sm:px-5 " +
                "border-line [&:nth-child(odd)]:border-r md:border-r " +
                (i < 2 ? "border-b md:border-b-0 " : "") +
                (selected ? "bg-surface" : "bg-paper/40 hover:bg-sunken/60")
              }
            >
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-[3px] transition-colors duration-200 ${selected ? "bg-accent" : "bg-transparent"}`}
              />
              <span className="block text-[13px] font-medium text-ink-2">{m.label}</span>
              <span
                className="mt-1 block font-display text-[28px] font-bold leading-none tracking-tight sm:text-[32px]"
                title={formatNumber(current[m.key])}
              >
                {formatCompact(current[m.key])}
              </span>
              <span className="mt-2 block h-4">
                {compare ? <Delta change={percentChange(current[m.key], previous[m.key])} /> : null}
                {m.key === "sessions" && pagesPerSession !== null && !compare ? (
                  <span className="tabular text-xs text-muted">{pagesPerSession.toFixed(1)} pages / session</span>
                ) : null}
              </span>
            </button>
          );
        })}
        <div className="px-4 py-4 sm:px-5">
          <span className="block text-[13px] font-medium text-ink-2">
            Bounce rate{" "}
            <abbr
              title="Share of sessions where the visitor viewed only one page."
              className="cursor-help text-muted no-underline"
              aria-label="Share of sessions where the visitor viewed only one page."
            >
              ⓘ
            </abbr>
          </span>
          <span className="mt-1 block font-display text-[28px] font-bold leading-none tracking-tight sm:text-[32px]">
            {rate === null ? "—" : formatPercent(rate)}
          </span>
          <span className="mt-2 block h-4">
            {compare && rate !== null && previousRate !== null ? (
              <Delta change={percentChange(rate, previousRate)} goodWhenUp={false} />
            ) : null}
          </span>
        </div>
      </div>

      <div id="traffic-chart" role="tabpanel" aria-labelledby={`metric-${metric}`} className="px-3 pb-4 pt-5 sm:px-5">
        <TrafficChart
          label={active.label}
          granularity={granularity}
          drawn={drawn}
          points={series.map((p) => ({ key: p.key, value: p[metric] }))}
        />
      </div>
    </section>
  );
}
