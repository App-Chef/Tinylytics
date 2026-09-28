"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { formatDay, formatHour, formatNumber } from "@/lib/format";

export type ChartPoint = { key: string; value: number };

type Props = {
  points: ChartPoint[];
  granularity: "hour" | "day";
  /** What is plotted, e.g. "Visitors". */
  label: string;
  /** Number of points that have happened so far (later hours of today are not drawn). */
  drawn?: number;
};

const HEIGHT = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 44 };

/** Rounds a maximum up to a readable axis value and returns evenly spaced ticks. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? rough;
  const niceStep = step < 1 ? 1 : step;
  const ticks: number[] = [];
  for (let v = 0; v <= max + niceStep * 0.001 || ticks.length < 2; v += niceStep) ticks.push(v);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + niceStep);
  return ticks;
}

function keyLabel(key: string, granularity: "hour" | "day", style: "short" | "long" = "short") {
  return granularity === "hour" ? formatHour(Number(key)) : formatDay(key, style);
}

function axisTickCompact(value: number) {
  return value >= 1000 ? `${Math.round((value / 1000) * 10) / 10}k` : String(value);
}

export function TrafficChart({ points, granularity, label, drawn = points.length }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const visible = points.slice(0, Math.max(1, drawn));
  const max = Math.max(0, ...visible.map((p) => p.value));
  const ticks = useMemo(() => niceTicks(max), [max]);
  const top = ticks[ticks.length - 1];

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;

  const line = visible.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join("");
  const area = visible.length ? `${line}L${x(visible.length - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z` : "";

  // Roughly one x label per 90px, always including the first and last.
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(innerW / 90))));
  const last = points.length - 1;
  const xLabels = points
    .map((p, i) => ({ p, i }))
    .filter(({ i }) =>
      granularity === "hour" ? i % 6 === 0 : i === last || (i % labelEvery === 0 && last - i >= labelEvery / 2),
    );

  const total = visible.reduce((sum, p) => sum + p.value, 0);
  const peak = visible.reduce((best, p) => (p.value > best.value ? p : best), visible[0] ?? { key: "", value: 0 });
  const summary =
    `${label} per ${granularity}. Total ${formatNumber(total)}.` +
    (peak && peak.value > 0
      ? ` Highest: ${formatNumber(peak.value)} on ${keyLabel(peak.key, granularity, "long")}.`
      : "");

  function indexFromPointer(clientX: number) {
    const rect = wrap.current?.getBoundingClientRect();
    if (!rect || points.length === 0) return null;
    const rel = clientX - rect.left - PAD.left;
    const i = points.length <= 1 ? 0 : Math.round((rel / innerW) * (points.length - 1));
    return Math.min(visible.length - 1, Math.max(0, i));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const last = visible.length - 1;
    const current = active ?? last;
    let next: number | null = null;
    if (e.key === "ArrowLeft") next = Math.max(0, current - 1);
    else if (e.key === "ArrowRight") next = Math.min(last, current + 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else if (e.key === "Escape") setActive(null);
    if (next !== null) {
      e.preventDefault();
      setActive(next);
    }
  }

  const activePoint = active !== null ? visible[active] : null;
  const tooltipLeft = active !== null ? Math.min(Math.max(x(active), 70), width - 70) : 0;

  return (
    <div>
      <div
        ref={wrap}
        className="relative select-none outline-none focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        style={{ height: HEIGHT }}
        tabIndex={0}
        role="group"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onKeyDown={onKeyDown}
        onPointerMove={(e) => setActive(indexFromPointer(e.clientX))}
        onPointerLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
      >
        <span id={titleId} className="sr-only">
          {label} chart. Use the left and right arrow keys to read values.
        </span>
        <span id={descId} className="sr-only">
          {summary}
        </span>
        {width > 0 ? (
          <svg
            viewBox={`0 0 ${width} ${HEIGHT}`}
            width="100%"
            height={HEIGHT}
            aria-hidden="true"
            className="block overflow-visible"
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} />
                <text
                  x={PAD.left - 10}
                  y={y(t)}
                  dy="0.32em"
                  textAnchor="end"
                  className="tabular fill-muted text-[11px]"
                >
                  {axisTickCompact(t)}
                </text>
              </g>
            ))}
            {xLabels.map(({ p, i }) => (
              <text
                key={p.key}
                x={x(i)}
                y={HEIGHT - 8}
                textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
                className="tabular fill-muted text-[11px]"
              >
                {keyLabel(p.key, granularity)}
              </text>
            ))}
            <path d={area} fill="var(--accent-wash)" />
            <path
              d={line}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {visible.length === 1 ? (
              <circle
                cx={x(0)}
                cy={y(visible[0].value)}
                r={4}
                fill="var(--accent)"
                stroke="var(--surface)"
                strokeWidth={2}
              />
            ) : null}
            {activePoint && active !== null ? (
              <g>
                <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={y(0)} stroke="var(--ink)" strokeWidth={1} />
                <circle
                  cx={x(active)}
                  cy={y(activePoint.value)}
                  r={5}
                  fill="var(--accent)"
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              </g>
            ) : null}
          </svg>
        ) : (
          <div className="skeleton h-full w-full" />
        )}
        {activePoint ? (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border-[1.5px] border-ink bg-surface px-2.5 py-1.5 text-xs shadow-hard-sm"
            style={{ left: tooltipLeft }}
          >
            <div className="text-muted">{keyLabel(activePoint.key, granularity, "long")}</div>
            <div className="tabular font-semibold text-ink">
              {formatNumber(activePoint.value)} {label.toLowerCase()}
            </div>
          </div>
        ) : null}
        <div className="sr-only" aria-live="polite">
          {activePoint ? `${keyLabel(activePoint.key, granularity, "long")}: ${formatNumber(activePoint.value)}` : ""}
        </div>
      </div>

      <details className="group mt-3">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded text-xs font-medium text-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
          <svg
            viewBox="0 0 12 12"
            className="size-3 transition-transform duration-150 group-open:rotate-90"
            aria-hidden="true"
          >
            <path d="M4 2.5 7.5 6 4 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          View as table
        </summary>
        <div className="mt-2 max-h-64 overflow-auto rounded-md border border-line">
          <table className="w-full text-sm">
            <caption className="sr-only">
              {label} per {granularity}
            </caption>
            <thead className="sticky top-0 bg-sunken text-left text-xs text-muted">
              <tr>
                <th scope="col" className="px-3 py-1.5 font-semibold">
                  {granularity === "hour" ? "Hour" : "Date"}
                </th>
                <th scope="col" className="px-3 py-1.5 text-right font-semibold">
                  {label}
                </th>
              </tr>
            </thead>
            <tbody className="tabular">
              {visible.map((p) => (
                <tr key={p.key} className="border-t border-line">
                  <td className="px-3 py-1.5">{keyLabel(p.key, granularity, "long")}</td>
                  <td className="px-3 py-1.5 text-right">{formatNumber(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
