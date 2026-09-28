import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DOCS, getDoc } from "@/lib/docs";

export const dynamicParams = false;

export function generateStaticParams() {
  return DOCS.filter((d) => d.slug !== "introduction").map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const doc = getDoc((await params).slug);
  if (!doc) return {};
  return { title: `${doc.title} · Docs`, description: doc.description, alternates: { canonical: `/docs/${doc.slug}` } };
}

export default async function DocPage({ params }: PageProps<"/docs/[slug]">) {
  const doc = getDoc((await params).slug);
  if (!doc) notFound();
  return <article className="prose-tl" dangerouslySetInnerHTML={{ __html: doc.html }} />;
}
