# Tracking script

The tracker is a single, dependency-free JavaScript file of about 1 KB gzipped. Its source is [`tracker/src/tracker.js`](https://github.com/App-Chef/Tinylytics/blob/main/tracker/src/tracker.js) — short enough to read in a couple of minutes.

## What it does

1. Reads your site ID from `data-site`.
2. Sends a `page_view` when the page loads.
3. Sends another `page_view` whenever the URL path changes through `history.pushState`, `history.replaceState` or back/forward navigation (`popstate`).
4. That's it.

## What it does not do

- It sets **no cookies** and uses **no localStorage or sessionStorage** (it only *reads* the opt-out flag described below).
- It does not read the page content, form fields, clicks, scrolls, mouse movement or keystrokes.
- It does not fingerprint the browser (no canvas, fonts, plugins, screen size or hardware probing).
- It does not send query strings. `https://example.com/reset?token=abc` is recorded as `/reset`.

## Payload

```json
{
  "site_id": "k3mz8q2hw4ta",
  "event": "page_view",
  "page": "/pricing",
  "referrer": "https://www.google.com/search",
  "source": "newsletter"
}
```

| Field | Meaning |
| --- | --- |
| `site_id` | Your public site ID. |
| `event` | Always `page_view` in v1. |
| `page` | `location.pathname` (plus `location.hash` in hash mode). |
| `referrer` | Origin and path of `document.referrer`, only on the first page view and only if it is another site. |
| `source` | `utm_source` or `ref` from the landing URL, only on the first page view. |

The timestamp is set by the server, not the browser.

## Reliability

The script is built so that Tinylytics can never break your site:

- Loaded with `defer`, it never blocks HTML parsing or rendering.
- Events are sent with `navigator.sendBeacon()`, falling back to `fetch(..., { keepalive: true })`.
- Every step is wrapped in `try/catch`. Network failures and server errors are ignored.
- Including the script twice is harmless; it only initialises once.
- Your own `history.pushState` / `replaceState` calls keep working exactly as before.

## Duplicate prevention

- A URL change that keeps the same path (for example only the query string changes, or a router calls `replaceState` with the same URL) is not counted again.
- The server also ignores the same page reported twice by the same visitor within 2 seconds.
- Reloading a page counts as a new page view, like in most analytics tools.
- Pages restored from the back/forward cache are counted once when shown.
- Prerendered pages are only counted when the visitor actually sees them.

## Options

| Attribute | Effect |
| --- | --- |
| `data-site` | Required. Your site ID. |
| `data-api` | Send events to a different endpoint, e.g. a proxy on your own domain. Defaults to `<script origin>/api/collect`. |
| `data-hash="true"` | Include the URL hash in the page path, for hash-based routers. |
| `data-respect-dnt="true"` | Don't send anything if the browser has Do Not Track or Global Privacy Control enabled. |
| `data-allow-localhost="true"` | Count visits on `localhost` and `127.0.0.1` (ignored by default). |

Automated browsers (`navigator.webdriver`) and browsers with `localStorage.tinylytics_ignore = "true"` are never counted.
