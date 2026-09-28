import { join } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // npm workspaces: dependencies are hoisted to the repository root.
  turbopack: { root: join(__dirname, "..") },
  poweredByHeader: false,
  async headers() {
    return [
      {
        // The tracker is loaded cross-origin from customers' sites.
        source: "/tracker.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
      {
        source: "/((?!tracker\\.js|api/collect).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
