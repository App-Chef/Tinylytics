// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BreakdownList } from "@/components/dashboard/breakdown-list";
import { TrafficChart, niceTicks } from "@/components/dashboard/traffic-chart";
import { TrafficPanel } from "@/components/dashboard/traffic-panel";

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(cleanup);

const series = [
  { key: "2026-09-26", visitors: 10, pageviews: 25, sessions: 12 },
  { key: "2026-09-27", visitors: 14, pageviews: 30, sessions: 15 },
  { key: "2026-09-28", visitors: 9, pageviews: 18, sessions: 10 },
];

describe("TrafficChart", () => {
  it("offers a text alternative and a table view", () => {
    render(
      <TrafficChart
        label="Visitors"
        granularity="day"
        points={series.map((p) => ({ key: p.key, value: p.visitors }))}
      />,
    );
    expect(screen.getByText(/Visitors per day\. Total 33\. Highest: 14 on Sun, Sep 27, 2026/)).toBeTruthy();
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4); // header + 3 days
  });

  it("only draws hours that have happened", () => {
    const points = Array.from({ length: 24 }, (_, h) => ({ key: String(h), value: h < 10 ? 1 : 0 }));
    render(<TrafficChart label="Page views" granularity="hour" points={points} drawn={10} />);
    expect(screen.getAllByRole("row")).toHaveLength(11);
  });

  it("computes readable axis ticks", () => {
    expect(niceTicks(0)).toEqual([0, 1]);
    expect(niceTicks(5)).toEqual([0, 2, 4, 6]);
    expect(niceTicks(1234)).toEqual([0, 500, 1000, 1500]);
  });
});

describe("TrafficPanel", () => {
  const current = { visitors: 33, pageviews: 73, sessions: 37, bounces: 15 };
  const previous = { visitors: 30, pageviews: 80, sessions: 37, bounces: 20 };

  it("shows the headline metrics, bounce rate and changes", () => {
    render(<TrafficPanel current={current} previous={previous} series={series} granularity="day" drawn={3} compare />);
    expect(screen.getByRole("tab", { name: /Visitors 33/ }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("40.5%")).toBeTruthy(); // 15 / 37
    expect(screen.getByText("10%")).toBeTruthy(); // visitors 30 → 33
  });

  it("switches the chart metric", () => {
    render(<TrafficPanel current={current} previous={previous} series={series} granularity="day" drawn={3} compare />);
    fireEvent.click(screen.getByRole("tab", { name: /Page views/ }));
    expect(screen.getByRole("tab", { name: /Page views/ }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText(/Page views per day\. Total 73/)).toBeTruthy();
  });

  it("shows a dash instead of a bounce rate when there are no sessions", () => {
    const zero = { visitors: 0, pageviews: 0, sessions: 0, bounces: 0 };
    render(<TrafficPanel current={zero} previous={zero} series={series} granularity="day" drawn={3} compare />);
    expect(screen.getByText("—")).toBeTruthy();
  });
});

describe("BreakdownList", () => {
  it("shows values and shares, and an empty message", () => {
    const { rerender } = render(
      <BreakdownList
        valueLabel="Visitors"
        total={100}
        items={[
          { key: "desktop", label: "Desktop", value: 62 },
          { key: "mobile", label: "Mobile", value: 38 },
        ]}
      />,
    );
    expect(screen.getByText("62%")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    rerender(<BreakdownList valueLabel="Visitors" items={[]} />);
    expect(screen.getByText("No data for this period.")).toBeTruthy();
  });
});
