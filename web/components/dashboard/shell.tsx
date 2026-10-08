import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Site } from "@/types/database";
import { SidebarNav, TabNav, type NavItem } from "./nav";
import { SiteSelector } from "./site-selector";

export function DashboardShell({
  sites,
  current,
  email,
  children,
}: {
  sites: Site[];
  current?: Site;
  email: string | null;
  children: React.ReactNode;
}) {
  const options = sites.map(({ id, name, domain }) => ({ id, name, domain }));
  const items: NavItem[] = current
    ? [
        { href: `/sites/${current.id}`, label: "Overview", exact: true },
        { href: `/sites/${current.id}/settings/tracking`, label: "Tracking" },
        { href: `/sites/${current.id}/settings`, label: "Settings", exact: true },
      ]
    : [];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r-[1.5px] border-line-strong bg-paper px-4 py-5 lg:flex">
        <Logo href="/dashboard" className="px-1" />
        <div className="mt-7">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted">Site</p>
          <SiteSelector sites={options} currentId={current?.id} />
        </div>
        {items.length ? (
          <div className="mt-6">
            <Suspense>
              <SidebarNav items={items} />
            </Suspense>
          </div>
        ) : null}
        <div className="mt-auto space-y-0.5 border-t border-line pt-4 text-sm">
          <ThemeToggle />
          <Link
            href="/docs"
            className="flex h-9 items-center rounded-md px-3 text-ink-2 transition-colors duration-150 hover:bg-sunken hover:text-ink"
          >
            Documentation
          </Link>
          <Link
            href="/account"
            className="flex h-9 items-center rounded-md px-3 text-ink-2 transition-colors duration-150 hover:bg-sunken hover:text-ink"
          >
            Account
          </Link>
          <form action="/auth/signout" method="post">
            <button className="flex h-9 w-full items-center rounded-md px-3 text-left text-ink-2 transition-colors duration-150 hover:bg-sunken hover:text-ink">
              Sign out
            </button>
          </form>
          {email ? <p className="truncate px-3 pt-2 text-xs text-muted">{email}</p> : null}
        </div>
      </aside>

      {/* Mobile and tablet header */}
      <header className="sticky top-0 z-30 border-b-[1.5px] border-line-strong bg-paper/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-3 px-4 pt-3">
          <Logo href="/dashboard" className="shrink-0 [&>span]:hidden sm:[&>span]:inline" />
          <div className="min-w-0 flex-1">
            <SiteSelector sites={options} currentId={current?.id} />
          </div>
          <Link
            href="/account"
            className="grid size-11 shrink-0 place-items-center rounded-md border-[1.5px] border-transparent text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
            aria-label="Account"
          >
            <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
              <circle cx="10" cy="7" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M3.5 17c1-3 3.5-4.5 6.5-4.5s5.5 1.5 6.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        </div>
        <div className="px-4 pt-2">
          {items.length ? (
            <Suspense>
              <TabNav items={items} />
            </Suspense>
          ) : (
            <div className="h-3" />
          )}
        </div>
      </header>

      <main id="main" className="min-w-0 px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
