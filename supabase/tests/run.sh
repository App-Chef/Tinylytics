#!/usr/bin/env bash
# Runs the database test suite.
#
#   DATABASE_URL=postgres://postgres:postgres@127.0.0.1:54322/postgres npm run test:db
#       runs the tests against an existing database (e.g. `supabase start`).
#       The tests run inside a transaction and roll back.
#
#   npm run test:db
#       without DATABASE_URL, creates a throwaway PostgreSQL cluster (needs
#       initdb/pg_ctl on PATH or discoverable via pg_config), applies a small
#       Supabase stub plus the migrations, runs the tests, and deletes it.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"

run_tests() {
  psql "$1" -v ON_ERROR_STOP=1 -q -X -f "$here/database.test.sql"
}

if [[ -n "${DATABASE_URL:-}" ]]; then
  run_tests "$DATABASE_URL"
  exit 0
fi

if ! command -v initdb >/dev/null 2>&1; then
  if command -v pg_config >/dev/null 2>&1; then
    PATH="$(pg_config --bindir):$PATH"
  fi
fi
for candidate in /usr/lib/postgresql/*/bin; do
  command -v initdb >/dev/null 2>&1 && break
  [[ -x "$candidate/initdb" ]] && PATH="$candidate:$PATH"
done
command -v initdb >/dev/null 2>&1 || { echo "initdb not found; set DATABASE_URL instead" >&2; exit 1; }

tmp="$(mktemp -d)"
port="${TEST_DB_PORT:-54329}"
cleanup() {
  pg_ctl -D "$tmp/data" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$tmp"
}
trap cleanup EXIT

initdb -D "$tmp/data" -U postgres --auth=trust >/dev/null
pg_ctl -D "$tmp/data" -o "-p $port -k $tmp -c listen_addresses=''" -l "$tmp/log" -w start >/dev/null

url="postgresql://postgres@/postgres?host=$tmp&port=$port"
psql "$url" -v ON_ERROR_STOP=1 -q -X -f "$here/supabase_stub.sql"
for migration in "$root"/supabase/migrations/*.sql; do
  psql "$url" -v ON_ERROR_STOP=1 -q -X -f "$migration"
done
run_tests "$url"

# Finally, check that the development seed applies cleanly.
psql "$url" -v ON_ERROR_STOP=1 -q -X -f "$root/supabase/seed.sql"
psql "$url" -v ON_ERROR_STOP=1 -q -X -At -c \
  "select 'seed: ' || count(*) || ' days, ' || sum(pageviews) || ' page views, ' || sum(visitors) || ' visitors' from public.daily_stats"
