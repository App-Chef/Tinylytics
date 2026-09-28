# Privacy

Tinylytics is built to measure traffic, not people. This page describes exactly what is collected, what is derived, what is stored, and what isn't. If anything here is inaccurate, that's a bug — please [report it](https://github.com/App-Chef/Tinylytics/issues).

## What the tracker sends

Per page view: your site ID, the page path (without query string), the external referrer's origin and path (first page view only), and `utm_source`/`ref` (first page view only). See [Tracking script](./tracking-script.md#payload).

The browser also sends standard HTTP information with every request, notably the **IP address** and **User-Agent** header.

## What the server derives, and then discards

| Input | Used for | Stored? |
| --- | --- | --- |
| IP address | Visitor hash, rate limiting, country (via your host's geo headers) | **No.** Never written to the database or logs by Tinylytics. |
| User-Agent | Visitor hash, browser family, OS family, device type, bot filtering | **No.** Only the three coarse labels are stored. |
| Referrer URL | Source name | Only the name, e.g. `Google`. |
| Origin / Referer header | Checking the event comes from your domain | **No.** |

Country comes from headers set by your hosting platform or CDN (`x-vercel-ip-country`, `cf-ipcountry`, `cloudfront-viewer-country` or `x-country-code`). Tinylytics never looks up regions, cities or coordinates.

## Visitors

To estimate unique visitors without cookies:

1. The API computes `sha256(ip + user agent)` in memory.
2. The database combines it with your site ID and a **random salt for the current day** and keeps the first 16 bytes of `sha256(salt ‖ site ‖ hash)` as `visitor_id`.
3. Salts are random (not derived from any secret) and are **deleted after about two days**.

Once a salt is deleted, nobody — including whoever runs the server — can recompute which IP/browser produced a given `visitor_id`, or link visitor IDs across days or across sites. The same person gets a different ID every day and on every site.

## What is stored

Per page view: timestamp, page path, source name, country code, device type, browser family, OS family, a random session ID and the daily visitor hash. Per session: the same attributes plus start/end time and page count. Plus daily totals.

## What is never collected

- Names, email addresses or any account data of your visitors
- Full IP addresses (not stored at all)
- Exact or approximate GPS location, city or region
- Cookies or any client-side identifier
- Fingerprints (canvas, fonts, screen, hardware…)
- Keystrokes, form input, mouse movement, scroll depth or session recordings
- Cross-site identifiers or advertising profiles

## Honest limitations

- **Page paths are stored as-is** (minus the query string). If your paths contain personal data, that data will be stored.
- **The IP address does reach the server**, as it does for every website request. Your hosting provider may log requests independently of Tinylytics; check its settings if that matters to you.
- **Visitor counts are estimates**, not precise head counts. See [Dashboard](./dashboard.md#visitors).
- **Rate limiting** keeps a short-lived in-memory map keyed by the unsalted visitor hash, for one minute.

## Do I need a cookie banner?

Tinylytics sets no cookies and stores no personal data, which is why many similar tools are used without consent banners. Whether *your* use needs consent depends on your jurisdiction and how you use it. This is not legal advice.

## Retention

Raw events and sessions are deleted after **395 days** by default (configurable with `DATA_RETENTION_DAYS`). Daily totals are kept so long-term charts keep working. Deleting a site deletes all of its data immediately; deleting your account deletes all of your sites.

## Your own opt-out

Visitors (and you) can opt out on any site by setting `localStorage.tinylytics_ignore = "true"`. Site owners can make the tracker honour Do Not Track / Global Privacy Control with `data-respect-dnt="true"`.
