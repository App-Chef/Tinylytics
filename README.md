# Tinylytics

Analytics without the noise.

Simple, privacy-friendly analytics for solo developers and small products.

![The Tinylytics dashboard, showing synthetic demo data](docs/screenshots/dashboard-light.png)

<sub>Screenshot of the dashboard with the synthetic development seed data. Not real traffic.</sub>

## The problem

Most analytics tools give you hundreds of metrics. You usually need a few. Tinylytics answers the questions a solo developer actually asks:

- How many people visited?
- What did they view?
- Where did they come from?
- What devices are they using?
- Where are they located?
- Is traffic growing or falling?

One small script, one screen, a few seconds.

## Features

- **Visitors, page views, sessions, bounce rate** with a traffic chart for today, 7, 30 or 90 days
- **Top pages**, **sources** (Google, GitHub, Hacker News…), **countries**, **devices, browsers and OS**
- **Single-page app support**: History API navigation is tracked, duplicates are dropped
- **Privacy by design**: no cookies, no personal data, no raw IP addresses stored
- **Tiny tracker**: about 1 KB gzipped, zero dependencies, never blocks your site, fails silently
- **Multiple sites** per account, with install instructions and automatic "tracking installed" verification
- **Row Level Security**: every read is scoped to the owner by PostgreSQL itself
- **Open source (MIT) and self-hostable** on Supabase and any Next.js host

Not included, on purpose: session recordings, heatmaps, funnels, user profiles, fingerprinting, A/B testing, AI reports.

## Architecture

```text
  Tinylytics dashboard  ── Next.js App Router, reads via RLS-protected SQL functions
          │
          ▼
  Analytics API          ── POST /api/collect (Next.js route handler)
          │                 validate → normalize → hash visitor → one SQL call
          ▼
  PostgreSQL (Supabase)  ── events, sessions, daily rollups, auth
          ▲
          │
  Tracking script        ── /tracker.js, sendBeacon, no cookies
          ▲
          │
  Your website
```

| Directory | What's inside |
| --- | --- |
| [`web/`](web) | Next.js app: landing page, dashboard, docs, `/api/collect`, serves `/tracker.js` |
| [`tracker/`](tracker) | The tracking script (plain JavaScript, built with esbuild into `web/public/tracker.js`) |
| [`supabase/`](supabase) | Migrations, development seed data and database tests |
| [`docs/`](docs) | Documentation, also rendered at `/docs` |

Each page view is a single database round trip: `tinylytics_ingest()` stores the event, updates the session and increments daily rollups in one transaction. The dashboard reads the rollups, so a 90-day view is as cheap as a 1-day view. No Redis, queues or ClickHouse required.

## Privacy model

- The tracker sends the page path (never the query string), the external referrer and a campaign source. Nothing else.
- IP address and user agent are used in memory to derive a visitor hash, browser family, OS, device class and country — then discarded.
- Visitors are identified by `sha256(daily random salt ‖ site ‖ sha256(ip ‖ user agent))`, truncated. Salts are deleted after about two days, so hashes can't be reversed or linked across days or sites.
- **Unique visitors are an estimate**: a person is counted once per day per site.

Read the full [privacy model](docs/privacy.md), including its limitations.

## Local development

Requirements: Node.js 20.9+ (22 recommended), Docker (for the local Supabase stack).

```bash
git clone https://github.com/App-Chef/Tinylytics.git
cd Tinylytics
npm install

npx supabase start               # Postgres + Auth locally; applies migrations and seed data
cp .env.example web/.env.local   # paste the API URL, anon key and service_role key it printed

npm run dev                      # http://localhost:3000
```

Sign in with the demo account created by [`supabase/seed.sql`](supabase/seed.sql):

- Email: `demo@tinylytics.local`
- Password: `tinylytics-demo`

It owns a site with 90 days of **synthetic** traffic, clearly labelled as demo data, plus an empty site that shows the "waiting for your first event" state. Local emails (magic links, confirmations) are caught by the local email viewer at http://localhost:54324.

### Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Build the tracker and start Next.js in development |
| `npm run build` | Build the tracker, then the Next.js app |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm test` | Tracker tests (jsdom) and web unit/component tests (Vitest) |
| `npm run test:db` | Database tests: ingestion, sessions, visitors, rollups, RLS and cross-user access |

`npm run test:db` creates a throwaway PostgreSQL cluster when `initdb` is available, or runs against `DATABASE_URL` (e.g. `postgresql://postgres:postgres@127.0.0.1:54322/postgres` for `supabase start`).

## Environment variables

| Variable | Browser | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public anon key (access is limited by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **no** | Server only: event ingestion, retention job, account deletion |
| `NEXT_PUBLIC_SITE_URL` | yes | Public URL of the deployment, used in the snippet and auth redirects |
| `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` | yes | `true` to show Google sign-in |
| `CRON_SECRET` | no | Protects `GET /api/cron/prune` |
| `DATA_RETENTION_DAYS` | no | Raw event retention, default `395`. Daily totals are kept. |

See [`.env.example`](.env.example) and [Configuration](docs/configuration.md).

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema: `npx supabase link --project-ref <ref> && npx supabase db push`.
3. **Authentication → URL Configuration**: set the Site URL to your deployment and add `https://<your-domain>/auth/callback` to the redirect URLs.
4. Optional: enable the Google provider, and configure SMTP for production email.

Never run `supabase/seed.sql` against production.

## Installing the tracker

```html
<script defer src="https://your-tinylytics-host/tracker.js" data-site="YOUR_SITE_ID"></script>
```

Add it before `</head>`. Next.js, SPA, hash-router and WordPress instructions are shown in the app under **Tracking**, and in [Installation](docs/installation.md). Options: `data-hash`, `data-respect-dnt`, `data-allow-localhost`, `data-api` — see [Tracking script](docs/tracking-script.md).

## Self-hosting

Tinylytics runs on a Supabase project plus any Node.js host (Vercel, a VPS, Docker, Fly.io…):

```bash
npm ci
npm run build
npm run start -w web
```

Country data comes from your platform's geo headers (Vercel, Cloudflare, CloudFront, or `X-Country-Code` from your own proxy). A daily retention job deletes old raw events. Full guide: [Self-hosting](docs/self-hosting.md).

## Documentation

[Introduction](docs/introduction.md) · [Installation](docs/installation.md) · [Tracking script](docs/tracking-script.md) · [Events](docs/events.md) · [Dashboard](docs/dashboard.md) · [Privacy](docs/privacy.md) · [Self-hosting](docs/self-hosting.md) · [Configuration](docs/configuration.md) · [API](docs/api.md) · [Contributing](docs/contributing.md)

## Contributing

Contributions that make Tinylytics more accurate, private, fast or clear are very welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and open an issue before starting on a new feature. Security issues: see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
