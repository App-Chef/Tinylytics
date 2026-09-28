import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { DOCS } from "@/lib/docs";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/signup`, changeFrequency: "yearly", priority: 0.5 },
    ...DOCS.map((doc) => ({
      url: doc.slug === "introduction" ? `${siteUrl}/docs` : `${siteUrl}/docs/${doc.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
