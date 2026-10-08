import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tinylytics - Simple Privacy-Friendly Analytics",
    short_name: "Tinylytics",
    description: "Simple, privacy-friendly analytics for solo developers and small products. Track visitors, page views, and traffic sources without cookies or personal data.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f2eb",
    theme_color: "#ff5b14",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
