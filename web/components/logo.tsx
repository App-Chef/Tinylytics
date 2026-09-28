import Link from "next/link";

/** The Tinylytics mark: three rising bars, the last one lit. */
export function LogoMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="5" fill="var(--ink)" />
      <rect x="5.5" y="13" width="3" height="5.5" rx="1" fill="var(--paper)" />
      <rect x="10.5" y="9.5" width="3" height="9" rx="1" fill="var(--paper)" />
      <rect x="15.5" y="5.5" width="3" height="13" rx="1" fill="var(--accent)" />
    </svg>
  );
}

export function Logo({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 rounded-md ${className}`} aria-label="Tinylytics home">
      <LogoMark />
      <span className="font-display text-lg font-bold tracking-tight">tinylytics</span>
    </Link>
  );
}
