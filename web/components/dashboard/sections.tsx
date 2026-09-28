import {
  getActiveNow,
  getBreakdown,
  getDashboardSummary,
  getTopPages,
  getTrafficSeries,
} from "@/lib/analytics/queries";
import type { DateRange } from "@/lib/analytics/range";
import { countryName, deviceName, formatNumber, sourceName } from "@/lib/format";
import { Panel } from "@/components/ui/panel";
import { BreakdownList } from "./breakdown-list";
import { PagesPanel } from "./pages-panel";
import { SectionError } from "./section-error";
import { TabbedPanel } from "./tabbed-panel";
import { TrafficPanel } from "./traffic-panel";

// Each section fetches its own data inside its own Suspense boundary, so they
// load in parallel and a slow or failing query only affects one section.

type SectionProps = { siteId: string; range: DateRange; timezone: string };

/** Runs a data loader; resolves to null instead of throwing. */
async function attempt<T>(load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch {
    return null;
  }
}

function currentHour(timeZone: string) {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hour12: false }).format(new Date())) % 24;
}

export async function TrafficSection({ siteId, range, timezone }: SectionProps) {
  const data = await attempt(() => Promise.all([getDashboardSummary(siteId, range), getTrafficSeries(siteId, range)]));
  if (!data) return <SectionError title="Traffic" />;
  const [{ current, previous }, series] = data;
  return (
    <TrafficPanel
      current={current}
      previous={previous}
      series={series}
      granularity={range.granularity}
      drawn={range.granularity === "hour" ? currentHour(timezone) + 1 : series.length}
      compare={range.key !== "today"}
    />
  );
}

export async function PagesSection({ siteId, range }: SectionProps) {
  const rows = await attempt(() => getTopPages(siteId, range, 50));
  if (!rows) return <SectionError title="Top pages" />;
  return <PagesPanel rows={rows} />;
}

export async function SourcesSection({ siteId, range }: SectionProps) {
  const rows = await attempt(() => getBreakdown(siteId, "referrer", range));
  if (!rows) return <SectionError title="Sources" />;
  return (
    <Panel title="Sources" titleId="sources-title">
      <BreakdownList
        valueLabel="Visitors"
        items={rows.map((r) => ({
          key: r.value || "(direct)",
          label: r.value ? r.value : <span className="text-ink-2">{sourceName(r.value)}</span>,
          value: r.visitors,
        }))}
      />
    </Panel>
  );
}

export async function CountriesSection({ siteId, range }: SectionProps) {
  const rows = await attempt(() => getBreakdown(siteId, "country", range));
  if (!rows) return <SectionError title="Countries" />;
  return (
    <Panel title="Countries" titleId="countries-title">
      <BreakdownList
        valueLabel="Visitors"
        items={rows.map((r) => ({ key: r.value || "unknown", label: countryName(r.value), value: r.visitors }))}
      />
    </Panel>
  );
}

export async function TechSection({ siteId, range }: SectionProps) {
  const data = await attempt(() =>
    Promise.all([
      getBreakdown(siteId, "device_type", range),
      getBreakdown(siteId, "browser", range),
      getBreakdown(siteId, "os", range),
    ]),
  );
  if (!data) return <SectionError title="Devices" />;
  const [devices, browsers, systems] = data;
  const list = (rows: typeof devices, name: (v: string) => string = (v) => v || "Unknown") => {
    const total = rows.reduce((sum, r) => sum + r.visitors, 0);
    return (
      <BreakdownList
        valueLabel="Visitors"
        total={total}
        items={rows.map((r) => ({ key: r.value || "unknown", label: name(r.value), value: r.visitors }))}
      />
    );
  };
  return (
    <TabbedPanel
      title="Devices"
      tabs={[
        { key: "devices", label: "Type", content: list(devices, deviceName) },
        { key: "browsers", label: "Browser", content: list(browsers) },
        { key: "os", label: "OS", content: list(systems) },
      ]}
    />
  );
}

export async function ActiveNow({ siteId }: { siteId: string }) {
  const count = await attempt(() => getActiveNow(siteId));
  if (count === null) return null;
  return (
    <p
      className="inline-flex items-center gap-2 text-sm text-ink-2"
      title="Visitors with activity in the last 5 minutes"
    >
      <span className="relative flex size-2.5" aria-hidden="true">
        {count > 0 ? (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-good opacity-60 motion-reduce:hidden" />
        ) : null}
        <span className={`relative inline-flex size-2.5 rounded-full ${count > 0 ? "bg-good" : "bg-line-strong"}`} />
      </span>
      <span>
        <span className="tabular font-semibold text-ink">{formatNumber(count)}</span>{" "}
        {count === 1 ? "visitor" : "visitors"} now
      </span>
    </p>
  );
}
