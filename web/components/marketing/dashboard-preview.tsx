// A static rendering of the dashboard for the landing page. The numbers are
// illustrative and labelled as such.

const SERIES = [
  38, 42, 40, 51, 47, 33, 30, 49, 55, 53, 61, 58, 41, 37, 60, 66, 63, 70, 68, 47, 45, 72, 79, 74, 83, 80, 58, 55, 88,
  94,
];
const PAGES: [string, number][] = [
  ["/", 1_204],
  ["/pricing", 588],
  ["/docs", 521],
  ["/blog/launch-week", 309],
  ["/about", 144],
];
const SOURCES: [string, number][] = [
  ["Google", 612],
  ["Direct / none", 498],
  ["GitHub", 231],
  ["Hacker News", 118],
];

function path(values: number[], w: number, h: number) {
  const max = Math.max(...values) * 1.1;
  return values
    .map((v, i) => `${i ? "L" : "M"}${((i / (values.length - 1)) * w).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`)
    .join("");
}

export function DashboardPreview() {
  const w = 600;
  const h = 150;
  const line = path(SERIES, w, h);

  return (
    <figure className="relative">
      <div className="overflow-hidden rounded-lg border-[1.5px] border-ink bg-surface shadow-[6px_6px_0_0_var(--shadow)]">
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full border border-line-strong" />
              <span className="size-2.5 rounded-full border border-line-strong" />
              <span className="size-2.5 rounded-full border border-line-strong" />
            </span>
            <span className="truncate font-display text-sm font-bold">your-product.com</span>
          </div>
          <span className="shrink-0 rounded border-[1.5px] border-line-strong px-2 py-0.5 text-xs font-medium">
            Last 30 days
          </span>
        </div>
        <dl className="grid grid-cols-2 border-b border-line sm:grid-cols-4">
          {[
            ["Visitors", "1,846"],
            ["Page views", "4,392"],
            ["Sessions", "2,210"],
            ["Bounce rate", "44.1%"],
          ].map(([label, value], i) => (
            <div
              key={label}
              className={`px-4 py-3 sm:px-5 ${i % 2 === 0 ? "border-r border-line" : ""} ${i < 2 ? "border-b border-line sm:border-b-0" : ""} ${i === 1 ? "sm:border-r" : ""}`}
            >
              <dt className="text-xs font-medium text-ink-2">{label}</dt>
              <dd className="mt-0.5 font-display text-xl font-bold sm:text-2xl">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="px-4 pb-4 pt-5 sm:px-5">
          <svg viewBox={`0 0 ${w} ${h}`} className="h-28 w-full sm:h-36" preserveAspectRatio="none" aria-hidden="true">
            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1="0"
                x2={w}
                y1={h * f}
                y2={h * f}
                stroke="var(--line)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={`${line}L${w},${h}L0,${h}Z`} fill="var(--accent-wash)" />
            <path
              d={line}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="grid border-t border-line sm:grid-cols-2">
          {[
            ["Top pages", PAGES, true],
            ["Sources", SOURCES, false],
          ].map(([title, rows, mono], idx) => (
            <div
              key={title as string}
              className={`px-3 py-3 sm:px-4 ${idx === 0 ? "border-b border-line sm:border-b-0 sm:border-r" : ""}`}
            >
              <p className="px-1 pb-1.5 font-display text-sm font-bold">{title as string}</p>
              <ul className="space-y-0.5">
                {(rows as [string, number][]).map(([label, value]) => (
                  <li key={label} className="relative flex h-7 items-center justify-between px-1 text-[13px]">
                    <span
                      className="absolute inset-y-0.5 left-0 rounded-[3px] bg-accent-wash"
                      style={{ width: `${(value / (rows as [string, number][])[0][1]) * 100}%` }}
                      aria-hidden="true"
                    />
                    <span className={`relative truncate ${mono ? "font-mono text-[12px]" : ""}`}>{label}</span>
                    <span className="tabular relative font-semibold">{value.toLocaleString("en-US")}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted">
        The Tinylytics dashboard, shown with example data.
      </figcaption>
    </figure>
  );
}
