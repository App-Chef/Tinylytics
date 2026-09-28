# Contributing

Thanks for helping. Tinylytics stays useful by staying small, so the most valuable contributions make existing things more accurate, private, fast or clear.

Before starting on a new feature, please open an issue to discuss it. Features outside the [v1 scope](https://github.com/App-Chef/Tinylytics/blob/main/CONTRIBUTING.md#scope) are likely to be declined, however well they are built.

## Local setup

```bash
git clone https://github.com/App-Chef/Tinylytics.git
cd Tinylytics
npm install
cp .env.example web/.env.local

# Start a local Supabase stack (needs Docker). Prints the URL and keys.
npx supabase start
# Paste the API URL, anon key and service_role key into web/.env.local

npm run dev
```

`supabase start` applies the migrations and `supabase/seed.sql`, which creates a demo account:

- Email: `demo@tinylytics.local`
- Password: `tinylytics-demo`

The demo site contains **synthetic** data for development only.

## Checks

```bash
npm run lint
npm run typecheck
npm test          # tracker + web unit tests
npm run test:db   # database tests (RLS, ingestion, rollups)
npm run build
```

`npm run test:db` spins up a throwaway PostgreSQL if `initdb` is available, or runs against `DATABASE_URL`, for example your local Supabase database:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres npm run test:db
```

## Project layout

```text
web/        Next.js dashboard, landing page, docs and API
tracker/    The tracking script (plain JS, built with esbuild)
supabase/   Migrations, seed data and database tests
docs/       Documentation (rendered at /docs)
```

## Guidelines

- Changes to what is collected or stored must update [Privacy](./privacy.md) in the same pull request.
- Keep the tracker dependency-free. The build fails if it grows past 2 KB gzipped.
- Database changes go in a new migration file; never edit one that has been released.
- New dashboard queries should read rollups, not raw events.
