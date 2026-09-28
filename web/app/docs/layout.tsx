import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { DOCS } from "@/lib/docs";
import { DocsNav } from "./docs-nav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-14 lg:py-14">
        <DocsNav docs={DOCS.map(({ slug, title }) => ({ slug, title }))} />
        <main id="main" className="min-w-0 max-w-3xl">
          {children}
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
