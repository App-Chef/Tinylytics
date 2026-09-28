# Dashboard

The overview answers "how is my product doing right now?" on one screen.

## Date ranges

**Today**, **7 days**, **30 days** (default) and **90 days**. Ranges are whole days in the site's timezone and include today. Today is shown per hour; the other ranges per day.

Next to each headline number, Tinylytics shows the change compared with the previous period of the same length (for example the 30 days before the last 30 days). Today has no comparison, because a partial day would not compare fairly with a full one.

## Metrics

### Visitors

An **estimate** of unique visitors. Tinylytics doesn't use cookies, so it cannot recognise a returning visitor across days. Instead, a visitor is identified by a hash of their IP address, user agent and your site, combined with a random salt that changes every day. Consequences:

- A person is counted **once per day per site**.
- Over a multi-day range, visitors are the **sum of daily visitors**. Someone who visits on three different days counts as three.
- Two people behind the same network address with identical browsers count as one.
- One person switching networks (Wi-Fi to mobile) or browsers counts as two.

Treat visitors as a trend, not a head count.

### Page views

Every page shown, including client-side navigation in single-page apps. Reloads count.

### Sessions

A session is a series of page views by the same visitor with **no more than 30 minutes between them**. A new day also starts a new session (the visitor hash changes at local midnight).

### Bounce rate

The **percentage of sessions where the visitor viewed only one page**. It is not the same definition every other analytics provider uses, so don't compare it directly.

### Pages per session

Page views divided by sessions, shown on the Sessions tile when there is no comparison.

### Active now

Distinct visitors with a page view in the last 5 minutes. It updates when you load the page.

## Breakdowns

| Panel | Shows | Counted by |
| --- | --- | --- |
| Top pages | Most viewed paths, sortable by views or visitors | Page views / visitors |
| Sources | Where sessions came from (see [referrers](./events.md#referrer-normalization)) | Visitors |
| Countries | Country of the visitor | Visitors |
| Devices | Device type, browser and OS | Visitors, with share of total |

Sources, countries and devices are attributes of a **session** and are fixed when it starts. All page views within a session are attributed to its source.

## How numbers are computed

Every page view updates small daily rollup tables (`daily_stats`, `daily_pages`, `daily_breakdowns`) inside the same database transaction that stores the event. The dashboard reads those rollups, so a 90-day view costs the same as a 1-day view. Only the hourly chart for **Today** reads raw events, and only for one day.

Days are assigned using the site's timezone **at the time the event arrived**. Changing the timezone later doesn't move historical data.
