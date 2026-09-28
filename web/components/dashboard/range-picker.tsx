import Link from "next/link";
import { RANGES, type RangeKey } from "@/lib/analytics/range";

export function RangePicker({ basePath, current }: { basePath: string; current: RangeKey }) {
  return (
    <nav aria-label="Date range">
      <ul className="flex rounded-md border-[1.5px] border-line-strong bg-surface p-0.5">
        {RANGES.map((range) => (
          <li key={range.key}>
            <Link
              href={range.key === "30d" ? basePath : `${basePath}?range=${range.key}`}
              aria-current={range.key === current ? "true" : undefined}
              scroll={false}
              className="flex h-8 items-center rounded-[4px] px-3 text-sm font-medium text-ink-2 transition-colors duration-150 ease-out hover:bg-sunken hover:text-ink aria-[current=true]:bg-ink aria-[current=true]:font-semibold aria-[current=true]:text-paper"
            >
              {range.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
