"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";

export function InstallGuides({ src, publicId }: { src: string; publicId: string }) {
  const guides = [
    {
      key: "next",
      label: "Next.js",
      file: "app/layout.tsx",
      code: `import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="${src}" data-site="${publicId}" strategy="afterInteractive" />
      </body>
    </html>
  );
}`,
      note: "Client-side navigation is tracked automatically.",
    },
    {
      key: "vite",
      label: "React / Vue / Vite",
      file: "index.html",
      code: `<head>
  <!-- ... -->
  <script defer src="${src}" data-site="${publicId}"></script>
</head>`,
      note: "Works with React Router, Vue Router, TanStack Router and other History API routers.",
    },
    {
      key: "hash",
      label: "Hash router",
      file: "index.html",
      code: `<script defer src="${src}" data-site="${publicId}" data-hash="true"></script>`,
      note: "For apps whose URLs look like example.com/#/settings.",
    },
    {
      key: "wordpress",
      label: "WordPress",
      file: "Appearance → Theme File Editor → header.php",
      code: `<script defer src="${src}" data-site="${publicId}"></script>`,
      note: "Paste it just before </head>, or use any “insert headers” plugin.",
    },
  ];
  const [current, setCurrent] = useState(guides[0].key);
  const guide = guides.find((g) => g.key === current)!;

  return (
    <div className="overflow-hidden rounded-md border-[1.5px] border-ink bg-surface">
      <div role="tablist" aria-label="Framework" className="flex overflow-x-auto border-b border-line bg-sunken">
        {guides.map((g, i) => (
          <button
            key={g.key}
            id={`guide-${g.key}`}
            role="tab"
            type="button"
            aria-selected={g.key === current}
            aria-controls="guide-panel"
            tabIndex={g.key === current ? 0 : -1}
            onClick={() => setCurrent(g.key)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const next = guides[(i + (e.key === "ArrowRight" ? 1 : guides.length - 1)) % guides.length];
              setCurrent(next.key);
              document.getElementById(`guide-${next.key}`)?.focus();
            }}
            className="shrink-0 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink aria-selected:border-accent aria-selected:bg-surface aria-selected:font-semibold aria-selected:text-ink"
          >
            {g.label}
          </button>
        ))}
      </div>
      <div id="guide-panel" role="tabpanel" aria-labelledby={`guide-${current}`}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-1.5">
          <span className="truncate font-mono text-xs text-muted">{guide.file}</span>
          <CopyButton value={guide.code} />
        </div>
        <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-relaxed">
          <code>{guide.code}</code>
        </pre>
        <p className="border-t border-line px-4 py-2.5 text-sm text-muted">{guide.note}</p>
      </div>
    </div>
  );
}
