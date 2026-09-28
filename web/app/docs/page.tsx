import type { Metadata } from "next";
import { getDoc } from "@/lib/docs";

const doc = () => getDoc("introduction")!;

export function generateMetadata(): Metadata {
  const { description } = doc();
  return { title: "Documentation", description, alternates: { canonical: "/docs" } };
}

export default function DocsIndex() {
  return <article className="prose-tl" dangerouslySetInnerHTML={{ __html: doc().html }} />;
}
