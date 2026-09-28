import { formatNumber } from "@/lib/format";

export type BreakdownItem = { key: string; label: React.ReactNode; value: number; title?: string };

/**
 * A ranked list with a quiet bar behind each row. Bars are scaled to the top
 * row; the number is always shown, so nothing depends on the bar alone.
 */
export function BreakdownList({
  items,
  valueLabel,
  total,
  emptyText = "No data for this period.",
  mono = false,
}: {
  items: BreakdownItem[];
  valueLabel: string;
  /** When set, a percentage of this total is shown next to each value. */
  total?: number;
  emptyText?: string;
  mono?: boolean;
}) {
  if (!items.length) {
    return <p className="px-4 py-10 text-center text-sm text-muted sm:px-5">{emptyText}</p>;
  }
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="px-2 pb-3 pt-2 sm:px-3">
      <div className="flex justify-end px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
        {valueLabel}
      </div>
      <ol className="space-y-0.5">
        {items.map((item) => (
          <li key={item.key} className="relative flex h-9 items-center justify-between gap-3 rounded px-2 text-sm">
            <span
              aria-hidden="true"
              className="absolute inset-y-0.5 left-0 rounded-[4px] bg-accent-wash"
              style={{ width: `${Math.max(1.5, (item.value / max) * 100)}%` }}
            />
            <span className={`relative min-w-0 truncate ${mono ? "font-mono text-[13px]" : ""}`} title={item.title}>
              {item.label}
            </span>
            <span className="tabular relative shrink-0 font-semibold">
              {formatNumber(item.value)}
              {total ? (
                <span className="ml-2 inline-block w-11 text-right font-normal text-muted">
                  {Math.round((item.value / total) * 100)}%
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
