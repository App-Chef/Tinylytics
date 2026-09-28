import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";

// Documentation lives in /docs at the repository root, so it reads well on
// GitHub too. The web app renders it statically at build time.

export const DOCS = [
  { slug: "introduction", title: "Introduction" },
  { slug: "installation", title: "Installation" },
  { slug: "tracking-script", title: "Tracking script" },
  { slug: "events", title: "Events" },
  { slug: "dashboard", title: "Dashboard" },
  { slug: "privacy", title: "Privacy" },
  { slug: "self-hosting", title: "Self-hosting" },
  { slug: "configuration", title: "Configuration" },
  { slug: "api", title: "API" },
  { slug: "contributing", title: "Contributing" },
] as const;

const DOCS_DIR = join(process.cwd(), "..", "docs");

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function getDoc(slug: string) {
  const entry = DOCS.find((d) => d.slug === slug);
  if (!entry) return null;
  const markdown = readFileSync(join(DOCS_DIR, `${slug}.md`), "utf8");
  const description = markdown
    .split("\n")
    .find((line) => line.trim() && !line.startsWith("#"))
    ?.replace(/[*_`[\]]/g, "")
    .slice(0, 160);

  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const id = slugify(text);
    return depth === 1 ? `<h1>${text}</h1>` : `<h${depth} id="${id}">${text}</h${depth}>`;
  };
  renderer.link = function ({ href, tokens }) {
    const text = this.parser.parseInline(tokens);
    // Links between docs files ("./privacy.md#visitors") become site routes.
    const local = href.match(/^\.?\/?([a-z-]+)\.md(#.*)?$/);
    if (local) return `<a href="/docs/${local[1]}${local[2] ?? ""}">${text}</a>`;
    const external = /^https?:/.test(href);
    return `<a href="${href}"${external ? ' rel="noreferrer"' : ""}>${text}</a>`;
  };

  const html = marked.parse(markdown, { renderer, async: false }) as string;
  return { ...entry, html, description };
}
