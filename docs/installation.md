# Installation

## 1. Create a site

Sign in, choose **Add a site**, and enter:

- **Name** — only you see it.
- **Domain** — for example `example.com`. Subdomains such as `www.example.com` or `app.example.com` are included automatically.
- **Timezone** — days in your reports start at midnight in this timezone.

## 2. Add the script

Tinylytics shows you a snippet with your site ID:

```html
<script defer src="https://tinylytics.app/tracker.js" data-site="YOUR_SITE_ID"></script>
```

If you self-host, the `src` points at your own deployment. Add it before `</head>` on every page.

### Next.js

```tsx
// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="https://tinylytics.app/tracker.js" data-site="YOUR_SITE_ID" strategy="afterInteractive" />
      </body>
    </html>
  );
}
```

### React, Vue, Svelte, Vite

Add the `<script>` tag to `index.html`. Client-side navigation through the History API (React Router, Vue Router, SvelteKit, TanStack Router and friends) is tracked automatically.

### Hash-based routers

If your URLs look like `example.com/#/settings`, add `data-hash="true"`:

```html
<script defer src="https://tinylytics.app/tracker.js" data-site="YOUR_SITE_ID" data-hash="true"></script>
```

### Static sites, WordPress, Ghost, Webflow

Paste the snippet into your theme's `<head>` or your platform's "custom code" / "header injection" setting.

## 3. Check that it works

Open your deployed site in a browser. **Settings → Tracking** shows:

- `○ Waiting for your first event` until the first valid page view arrives, then
- `● Tracking installed · Receiving data`.

The status updates on its own; there is nothing to click.

If nothing arrives:

- Visits from `localhost` are ignored on purpose. Test on your real domain, or add `data-allow-localhost="true"` temporarily.
- The page must be served from the site's domain or one of its subdomains. Events from other domains are rejected.
- Ad blockers may block third-party analytics scripts. [Self-hosting](./self-hosting.md) on your own domain reduces this.
- Check the browser's network tab for a request to `/api/collect`. A `202` response means it was accepted.

## Excluding yourself

Run this once in your browser's developer console while on your site:

```js
localStorage.tinylytics_ignore = "true";
```

Remove it with `localStorage.removeItem("tinylytics_ignore")`.
