# Introduction

Tinylytics is simple, privacy-friendly analytics for solo developers and small products. It answers one question: **what's happening in my product?**

Install one small script, open the dashboard, and within a few seconds you know:

- how many people visited,
- which pages they viewed,
- where they came from,
- what devices they use,
- which countries they are in,
- whether traffic is growing or falling.

That is deliberately most of what Tinylytics does. It is not trying to replace Google Analytics or Mixpanel. There are no funnels, heatmaps, session recordings, user profiles or AI reports, and there won't be in v1.

## How it fits together

```text
  Tinylytics dashboard  (Next.js, reads through Row Level Security)
          │
          ▼
  Analytics API          POST /api/collect  (Next.js route handler)
          │
          ▼
  PostgreSQL             events, sessions, daily rollups  (Supabase)
          ▲
          │
  Tracking script        /tracker.js, ~1 KB gzipped, no cookies
          ▲
          │
  Your website
```

- **The tracker** runs on your site and sends one small request per page view.
- **The ingestion API** validates the event, derives coarse metadata (browser family, device class, country), hashes the visitor with a daily salt, and stores it.
- **PostgreSQL** keeps raw events plus small daily rollups, so the dashboard never scans millions of rows.
- **The dashboard** reads only your own sites, enforced by the database.

## Principles

- **Accuracy first.** Numbers are estimates where they must be, and we say so.
- **Privacy by design.** No cookies, no personal data, no raw IP addresses stored. See [Privacy](./privacy.md).
- **Tiny footprint.** The tracker never blocks your site and fails silently.
- **Clarity over features.** A few metrics, clearly defined.

## Next steps

- [Install the script](./installation.md)
- [Understand the numbers](./dashboard.md)
- [Run it yourself](./self-hosting.md)
