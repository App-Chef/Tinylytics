# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report vulnerabilities privately through GitHub: **[Report a vulnerability](https://github.com/App-Chef/Tinylytics/security/advisories/new)**.

Include what you found, how to reproduce it, and the impact you expect. We aim to acknowledge reports within a few days and will keep you updated on the fix. We're happy to credit you once it's released.

## Supported versions

Security fixes are made on the `main` branch. Self-hosters should update to the latest release.

## In scope

Especially interesting:

- Accessing another user's sites, analytics or settings (RLS or authorization bypass)
- Exposure of the service-role key or other secrets to the browser
- Anything that lets the tracker break or run code in a host website
- Storage of data the [privacy model](docs/privacy.md) says is not stored (e.g. raw IPs)
- Recovering visitor identities from stored hashes

## Out of scope

- Sending fake page views to the public ingestion endpoint. It is public by design; see the abuse protections in [docs/api.md](docs/api.md).
- Rate limits being per server instance (documented).
- Findings that require a compromised Supabase project or server.

## Hardening notes for self-hosters

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only; never prefix it with `NEXT_PUBLIC_`.
- Don't expose the app directly without a proxy that sets `X-Forwarded-For` correctly.
- Never run `supabase/seed.sql` in production (it creates a demo account with a public password).
- Set a long random `CRON_SECRET`.
