"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export type NavItem = { href: string; label: string; exact?: boolean };

function useActive() {
  const pathname = usePathname();
  return (item: NavItem) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));
}

/** Keeps ?range= when moving between sections so the chosen period sticks. */
function useWithRange() {
  const params = useSearchParams();
  const range = params.get("range");
  return (href: string, exact?: boolean) => (range && exact ? `${href}?range=${range}` : href);
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const isActive = useActive();
  const withRange = useWithRange();
  return (
    <nav aria-label="Site">
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={withRange(item.href, item.exact)}
              aria-current={isActive(item) ? "page" : undefined}
              className="relative flex h-9 items-center rounded-md px-3 text-sm font-medium text-ink-2 transition-colors duration-150 ease-out hover:bg-sunken hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:font-semibold aria-[current=page]:text-paper"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function TabNav({ items }: { items: NavItem[] }) {
  const isActive = useActive();
  const withRange = useWithRange();
  return (
    <nav aria-label="Site" className="-mb-px flex gap-5 overflow-x-auto">
      {items.map((item) => (
        <Link
          key={item.href}
          href={withRange(item.href, item.exact)}
          aria-current={isActive(item) ? "page" : undefined}
          className="shrink-0 border-b-2 border-transparent pb-2.5 pt-1 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink aria-[current=page]:border-accent aria-[current=page]:font-semibold aria-[current=page]:text-ink"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
