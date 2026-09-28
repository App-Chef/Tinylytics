# Self-hosting

Tinylytics is two things: a Next.js app (dashboard, ingestion API and tracker file) and a Supabase project (PostgreSQL + Auth). There is no other infrastructure — no Redis, queue or ClickHouse.

## Requirements

- Node.js 20.9 or newer
- A Supabase project ([supabase.com](https://supabase.com) or [self-hosted Supabase](https://supabase.com/docs/guides/self-hosting))
- Somewhere to run Next.js: Vercel, a VPS, Docker, Fly.io, Railway…

## 1. Database

Apply the migrations in `supabase/migrations` to your project:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Or paste the SQL files, in order, into the Supabase SQL editor.

**Do not run `supabase/seed.sql` in production.** It creates a demo account with a public password and synthetic data.

## 2. Auth settings

In the Supabase dashboard, under **Authentication → URL Configuration**:

- **Site URL**: your deployment URL, e.g. `https://stats.example.com`
- **Redirect URLs**: add `https://stats.example.com/auth/callback`

Email/password and magic links work out of the box. For production, configure a custom SMTP provider — Supabase's built-in mailer is heavily rate-limited.

To enable **Google sign-in**, create an OAuth client in Google Cloud, add it under **Authentication → Providers → Google**, and set `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true`.

## 3. Environment

Copy `.env.example` to `web/.env.local` (or set the variables in your host). See [Configuration](./configuration.md).

## 4. Build and run

```bash
npm ci
npm run build     # builds the tracker into web/public/tracker.js, then the Next.js app
npm run start -w web
```

On **Vercel**, import the repository, set the **Root Directory** to `web`, and keep "Include files outside the root directory" enabled (the docs live in `/docs`). Set the install command to `cd .. && npm ci` and the build command to `cd .. && npm run build`.

## 5. Country data

Country detection reads headers from your platform:

| Platform | Header | Setup |
| --- | --- | --- |
| Vercel | `x-vercel-ip-country` | Automatic |
| Cloudflare (proxied) | `cf-ipcountry` | Automatic, or enable "IP Geolocation" |
| AWS CloudFront | `cloudfront-viewer-country` | Add it to the origin request policy |
| Your own proxy | `x-country-code` | e.g. nginx with the GeoIP2 module |

Without any of these, countries show as "Unknown". Everything else works.

## 6. Client IP

Tinylytics reads the client IP from `X-Forwarded-For` (first entry), then `CF-Connecting-IP`, then `X-Real-IP`. Make sure your reverse proxy sets these and that the app is not reachable directly — otherwise visitors could spoof the header and skew visitor estimates.

## 7. Retention job

Raw events older than the retention window are deleted by `GET /api/cron/prune`, protected by `CRON_SECRET`. On Vercel, `web/vercel.json` schedules it daily. Elsewhere, run it from cron:

```bash
0 3 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://stats.example.com/api/cron/prune
```

Or use `pg_cron` inside Supabase:

```sql
select cron.schedule('tinylytics-prune', '0 3 * * *', $$select public.tinylytics_prune(395)$$);
```

## Scaling notes

Each page view is one database round trip to a single SQL function that stores the event and updates the daily rollups in one transaction. This comfortably handles the traffic of most indie products on a small Supabase instance. Very high traffic on a single site concentrates writes on that site's daily row; if you get there, batching ingestion is the next step.
