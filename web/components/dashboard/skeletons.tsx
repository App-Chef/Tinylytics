export function TrafficSkeleton() {
  return (
    <div
      className="rounded-lg border-[1.5px] border-line-strong bg-surface"
      aria-busy="true"
      aria-label="Loading traffic"
    >
      <div className="grid grid-cols-2 border-b border-line md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 px-5 py-4">
            <div className="skeleton h-3.5 w-16" />
            <div className="skeleton h-8 w-24" />
            <div className="skeleton h-3 w-10" />
          </div>
        ))}
      </div>
      <div className="p-5">
        <div className="skeleton h-[240px] w-full" />
      </div>
    </div>
  );
}

export function PanelSkeleton({ title, rows = 6 }: { title: string; rows?: number }) {
  return (
    <div
      className="rounded-lg border-[1.5px] border-line-strong bg-surface"
      aria-busy="true"
      aria-label={`Loading ${title}`}
    >
      <div className="flex min-h-12 items-center border-b border-line px-5">
        <span className="font-display text-[15px] font-bold tracking-tight">{title}</span>
      </div>
      <div className="space-y-2 p-4">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="skeleton h-7" style={{ width: `${92 - i * 11}%` }} />
        ))}
      </div>
    </div>
  );
}
