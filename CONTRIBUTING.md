# Contributing to Tinylytics

Thanks for your interest! Tinylytics stays useful by staying small, so the best contributions make what exists more **accurate, private, fast or clear**. The project's priorities, in order:

**Accuracy → Privacy → Performance → Clarity → Design → Features**

## Before you start

- **Bugs**: open an issue with steps to reproduce. For security issues, see [SECURITY.md](SECURITY.md) instead.
- **Features**: open an issue first and describe the problem it solves. Please wait for a maintainer's response before writing code.
- **Small fixes** (typos, docs, obvious bugs): go ahead and open a pull request.

## Scope

Tinylytics v1 deliberately does **not** include session recordings, heatmaps, user profiles, fingerprinting, cross-site or advertising tracking, AI features, funnels, A/B testing, teams, billing or real-time WebSocket infrastructure. Pull requests adding these will be declined. Custom events, goals and data export are planned; please discuss the design in an issue first.

## Development setup

See [docs/contributing.md](docs/contributing.md) for local setup with `supabase start`, the demo account and the test commands.

## Pull requests

- Keep changes focused; one concern per pull request.
- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:db` and `npm run build`.
- Add or update tests for behaviour changes.
- If you change **what is collected, stored or derived**, update [docs/privacy.md](docs/privacy.md) in the same pull request.
- Database changes go into a **new** migration in `supabase/migrations`, and `web/types/database.ts` must match.
- The tracker must stay dependency-free and under the 2 KB gzip budget enforced by its build.
- UI changes should follow the existing design tokens (`web/app/globals.css`), work on mobile, keep visible focus states and respect `prefers-reduced-motion`.

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE) and that you will follow the [Code of Conduct](CODE_OF_CONDUCT.md).
