"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DocsNav({ docs }: { docs: { slug: string; title: string }[] }) {
  const pathname = usePathname();
  const current = pathname === "/docs" ? "introduction" : pathname.split("/")[2];

  return (
    <nav aria-label="Documentation">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">Docs</p>
      <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
        {docs.map((doc) => (
          <li key={doc.slug} className="shrink-0">
            <Link
              href={doc.slug === "introduction" ? "/docs" : `/docs/${doc.slug}`}
              aria-current={doc.slug === current ? "page" : undefined}
              className="flex h-9 items-center whitespace-nowrap rounded-md px-3 text-sm text-ink-2 transition-colors duration-150 hover:bg-sunken hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:font-semibold aria-[current=page]:text-paper"
            >
              {doc.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
