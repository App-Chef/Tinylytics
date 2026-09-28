# Configuration

All configuration is through environment variables. Copy `.env.example` to `web/.env.local` for local development.

| Variable | Required | Exposed to browser | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Your Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | The anon (public) key. Safe in the browser: all access is restricted by Row Level Security. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **No** | Used only by the ingestion API, the retention job and account deletion. Never prefix it with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | Yes | Public URL of your deployment, e.g. `https://stats.example.com`. Used in the tracking snippet, auth redirects and metadata. |
| `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` | No | Yes | `true` shows the "Continue with Google" button. Configure the provider in Supabase first. |
| `CRON_SECRET` | For retention | No | Bearer token required by `/api/cron/prune`. Use a long random string. |
| `DATA_RETENTION_DAYS` | No | No | Days of raw events and sessions to keep. Default `395`. Daily totals are always kept. |

`NEXT_PUBLIC_*` values are compiled into the browser bundle at build time, so rebuild after changing them.

## Defaults worth knowing

| Setting | Value | Where |
| --- | --- | --- |
| Session timeout | 30 minutes of inactivity | `tinylytics_ingest` in the migration |
| Duplicate window | Same page, same visitor, within 2 seconds | `tinylytics_ingest` |
| Rate limit | 120 events per minute per visitor and site, per server instance | `web/lib/collect/handle.ts` |
| Max payload | 4 KB | `web/lib/collect/payload.ts` |
| Max page path | 512 characters | `web/lib/collect/page.ts` |
| Active now window | 5 minutes | `tinylytics_active_now` |
| Visitor salt lifetime | about 2 days | `tinylytics_ingest` / `tinylytics_prune` |
