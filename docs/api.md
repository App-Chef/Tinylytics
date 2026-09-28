# API

## `POST /api/collect`

The public ingestion endpoint used by the tracker. You can call it yourself, for example from a server-rendered app or a proxy, but most people never need to.

**Request**

```http
POST /api/collect
Content-Type: text/plain

{"site_id":"k3mz8q2hw4ta","event":"page_view","page":"/pricing","referrer":"https://news.ycombinator.com/","source":""}
```

`Content-Type: text/plain` keeps browser requests "simple", so no CORS preflight is needed. `application/json` works too.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `site_id` | string | yes | 8–32 lowercase letters and digits |
| `event` | string | no | Only `page_view` (the default) |
| `page` | string | yes | Must start with `/`, at most 2048 characters. Normalized before storage. |
| `referrer` | string | no | Full URL; reduced to a source name |
| `source` | string | no | Campaign source, used when there is no referrer |

The request's `User-Agent`, `Origin`/`Referer` and client IP are used as described in [Privacy](./privacy.md).

**Responses**

Responses have no body.

| Status | Meaning |
| --- | --- |
| `202` | Accepted. Also returned for bots and duplicates, which are silently dropped. |
| `400` | Malformed payload. |
| `403` | The request's `Origin` does not match the site's domain or its subdomains. |
| `404` | Unknown site ID. |
| `413` | Body larger than 4 KB. |
| `429` | Rate limited. |
| `500` | The event could not be stored. |

### Abuse protection

- Payloads over 4 KB are rejected before parsing.
- Only known event types and well-formed site IDs and paths are accepted.
- Events must come from the site's domain or a subdomain when the browser sends an `Origin` or `Referer` header.
- Known crawlers, uptime monitors, link previewers, headless browsers and HTTP libraries are filtered by user agent.
- Each visitor is limited to 120 events per minute per site.

These checks stop casual abuse and accidental noise. A determined attacker can still send fake page views to a public endpoint — as with every client-side analytics tool.

## `GET /api/cron/prune`

Deletes raw events and sessions older than `DATA_RETENTION_DAYS`. Requires `Authorization: Bearer $CRON_SECRET`. Returns `{ "retentionDays": 395, "events_deleted": 0, "sessions_deleted": 0 }`.

## Reading your data

There is no public read API in v1. Your data lives in PostgreSQL, so you can query it directly (see [Events](./events.md)), or call the dashboard's SQL functions with a signed-in Supabase client:

| Function | Returns |
| --- | --- |
| `tinylytics_summary(site, from, to)` | visitors, page views, sessions, bounces |
| `tinylytics_daily_series(site, from, to)` | one row per day |
| `tinylytics_hourly_series(site, day)` | one row per hour of a local day |
| `tinylytics_top_pages(site, from, to, limit)` | page, page views, visitors |
| `tinylytics_breakdown(site, dimension, from, to, limit)` | value, visitors, sessions, page views for `referrer`, `country`, `device_type`, `browser` or `os` |
| `tinylytics_active_now(site)` | visitors in the last 5 minutes |

Dates are inclusive `YYYY-MM-DD` days in the site's timezone. The functions run with the caller's permissions, so they only ever return data for sites the caller owns.
