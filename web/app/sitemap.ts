import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { DOCS } from "@/lib/docs";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1, lastModified: new Date() },
    { url: `${siteUrl}/signup`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date() },
    { url: `${siteUrl}/login`, changeFrequency: "monthly", priority: 0.6, lastModified: new Date() },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.9, lastModified: new Date() },
    { url: `${siteUrl}/alternatives`, changeFrequency: "monthly", priority: 0.9, lastModified: new Date() },
    ...DOCS.map((doc) => ({
      url: doc.slug === "introduction" ? `${siteUrl}/docs` : `${siteUrl}/docs/${doc.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      lastModified: new Date(),
    })),
  ];
}
