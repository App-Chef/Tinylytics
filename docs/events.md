# Events

Tinylytics v1 has two event types, stored in the `events` table:

| Event | Sent by | Meaning |
| --- | --- | --- |
| `page_view` | the tracker | A page was shown to a visitor. |
| `session_start` | the server | The first page view of a new session. Recorded automatically; the tracker never sends it. |

## Event record

| Column | Example | Notes |
| --- | --- | --- |
| `site_id` | `4f1c…` | Internal site ID. |
| `event_type` | `page_view` | |
| `timestamp` | `2026-09-28T12:00:00Z` | Server time. |
| `page` | `/pricing` | Normalized path, no query string. |
| `referrer` | `Google` | Readable source name, or empty for direct traffic. |
| `country` | `RW` | ISO 3166-1 alpha-2 code, or empty. |
| `device_type` | `desktop` | `desktop`, `mobile` or `tablet`. |
| `browser` | `Firefox` | Family only, no version. |
| `os` | `Linux` | Family only, no version. |
| `session_id` | `9b2e…` | Random ID of the session. |
| `visitor_id` | 16 bytes | Daily-salted hash. See [Privacy](./privacy.md#visitors). |

## Page normalization

- Query strings are removed. They often hold tokens, emails or search terms, and they would split one page into many rows.
- Trailing slashes are removed (`/docs/` → `/docs`), duplicate slashes collapsed, and percent-encoding decoded for readability.
- Paths are truncated to 512 characters.

If your URLs contain personal data in the *path* itself (for example `/users/jane@example.com`), consider changing those routes — Tinylytics records the path as it is.

## Referrer normalization

Referrers are reduced to a short name before they are stored:

| Raw referrer | Stored as |
| --- | --- |
| `https://www.google.com/search?q=…` | `Google` |
| `https://t.co/abc` | `X` |
| `https://news.ycombinator.com/item?id=…` | `Hacker News` |
| `https://old.reddit.com/r/…` | `Reddit` |
| `https://blog.example.org/post` | `blog.example.org` |
| none, with `?utm_source=newsletter` | `Newsletter` |
| none | *(Direct / none)* |

Links from your own domain or its subdomains are not referrers.

## Custom events

Not in v1. The `event_type` column and the ingestion function are shaped so custom events (and goals built on them) can be added later without a new pipeline.
