"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

type SiteOption = { id: string; name: string; domain: string };

/**
 * Switches between the user's sites while staying on the same section
 * (overview, settings, tracking). The current range is kept by the page.
 */
export function SiteSelector({ sites, currentId }: { sites: SiteOption[]; currentId?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const current = sites.find((s) => s.id === currentId);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    root.current?.querySelector<HTMLElement>("[aria-current=true], a")?.focus();
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const section = currentId ? (pathname.split(`/sites/${currentId}`)[1] ?? "") : "";

  function onListKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-item]") ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const nextIndex = e.key === "ArrowDown" ? Math.min(index + 1, items.length - 1) : Math.max(index - 1, 0);
    items[nextIndex]?.focus();
  }

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-md border-[1.5px] border-ink bg-surface px-3 text-left shadow-hard-sm transition-[background-color] duration-150 ease-out hover:bg-sunken"
      >
        <span className="min-w-0">
          <span className="sr-only">Current site: </span>
          <span className="block truncate text-sm font-semibold">{current?.name ?? "Choose a site"}</span>
        </span>
        <svg
          viewBox="0 0 16 16"
          className={`size-4 shrink-0 transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        id={listId}
        hidden={!open}
        onKeyDown={onListKey}
        className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 min-w-60 overflow-hidden rounded-md border-[1.5px] border-ink bg-surface shadow-hard rise"
      >
        <ul className="max-h-72 overflow-y-auto py-1" aria-label="Your sites">
          {sites.map((site) => (
            <li key={site.id}>
              <Link
                data-item
                href={`/sites/${site.id}${section}`}
                onClick={() => setOpen(false)}
                aria-current={site.id === currentId}
                className="flex flex-col px-3 py-2 outline-none transition-colors duration-150 hover:bg-sunken focus-visible:bg-sunken aria-[current=true]:bg-accent-wash"
              >
                <span className="truncate text-sm font-semibold">{site.name}</span>
                <span className="truncate font-mono text-xs text-muted">{site.domain}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-line p-1">
          <Link
            data-item
            href="/sites/new"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded px-2 py-2 text-sm font-semibold outline-none transition-colors duration-150 hover:bg-sunken focus-visible:bg-sunken"
          >
            <span
              aria-hidden="true"
              className="grid size-5 place-items-center rounded border-[1.5px] border-ink text-xs leading-none"
            >
              +
            </span>
            Add a site
          </Link>
        </div>
      </div>
    </div>
  );
}
