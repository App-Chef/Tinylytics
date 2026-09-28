import { CopyButton } from "@/components/ui/copy-button";

export function Snippet({ code, copyLabel = "Copy code" }: { code: string; copyLabel?: string }) {
  return (
    <div className="overflow-hidden rounded-md border-[1.5px] border-ink bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-sunken px-3 py-1.5">
        <span className="font-mono text-xs text-muted">HTML</span>
        <CopyButton value={code} label={copyLabel} />
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-relaxed text-ink">
        <code>{code}</code>
      </pre>
    </div>
  );
}
