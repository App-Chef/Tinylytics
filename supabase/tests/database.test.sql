-- Tinylytics database tests: ingestion, sessions, visitors, rollups, RLS and
-- privileges. Runs in a transaction and rolls everything back.
--
-- Run with: npm run test:db

\set QUIET on
begin;

-- Fixed users and a reference time (UTC noon, so every timezone used here is on
-- the same local day).
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'alice@example.test', '{"name": "Alice"}'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@example.test', '{}');

create temporary table t (key text primary key, value text);
grant all on t to anon, authenticated, service_role;

do $$ begin
  assert (select count(*) from public.profiles) = 2, 'profiles are created for new users';
  assert (select name from public.profiles where email = 'alice@example.test') = 'Alice', 'profile name comes from metadata';
end $$;

-- ---------------------------------------------------------------------------
-- Sites: create, validate, isolate
-- ---------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000a", "role": "authenticated"}';

insert into public.sites (name, domain, timezone) values ('  Amazu  ', 'Amazu.Example', 'Africa/Kigali');
insert into t select 'site_a', id::text from public.sites where domain = 'amazu.example';
insert into t select 'public_a', public_id from public.sites where domain = 'amazu.example';

do $$
declare s public.sites%rowtype;
begin
  select * into s from public.sites where domain = 'amazu.example';
  assert s.user_id = '00000000-0000-0000-0000-00000000000a', 'site owner defaults to the caller';
  assert s.name = 'Amazu', 'site name is trimmed';
  assert s.public_id ~ '^[a-z0-9]{12}$', 'public id is generated';
  assert s.first_event_at is null, 'new site has no events';
end $$;

do $$ begin
  begin
    insert into public.sites (name, domain, timezone) values ('Bad', 'bad.example', 'Mars/Olympus');
    raise exception 'invalid timezone was accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    insert into public.sites (name, domain) values ('Bad', 'https://bad.example/path');
    raise exception 'invalid domain was accepted';
  exception when check_violation then null;
  end;
  begin
    insert into public.sites (name, domain, user_id) values ('Stolen', 'stolen.example', '00000000-0000-0000-0000-00000000000b');
    raise exception 'user_id could be set explicitly';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.sites set first_event_at = now();
    raise exception 'first_event_at is writable by users';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.tinylytics_ingest('x', null, '/', '', '', '', '', '', 'seed');
    raise exception 'authenticated users can call the ingest function';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.tinylytics_prune(30);
    raise exception 'authenticated users can call prune';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.events (site_id, event_type, page, session_id, visitor_id)
    values ((select id from public.sites limit 1), 'page_view', '/', gen_random_uuid(), '\x00');
    raise exception 'authenticated users can insert events';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Bob creates his own site with the same domain (allowed: domains are unique per user).
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000b", "role": "authenticated"}';
insert into public.sites (name, domain) values ('Bob site', 'bob.example');
insert into t select 'site_b', id::text from public.sites where domain = 'bob.example';

do $$
declare n integer;
begin
  assert (select count(*) from public.sites) = 1, 'bob only sees his own site';
  assert not exists (select 1 from public.sites where domain = 'amazu.example'), 'bob cannot see alice''s site';
  update public.sites set name = 'Hijacked' where id = (select value::uuid from t where key = 'site_a');
  get diagnostics n = row_count;
  assert n = 0, 'bob cannot update alice''s site';
  delete from public.sites where id = (select value::uuid from t where key = 'site_a');
  get diagnostics n = row_count;
  assert n = 0, 'bob cannot delete alice''s site';
  assert (select count(*) from public.profiles) = 1, 'bob only sees his own profile';
end $$;

reset role;
do $$ begin
  assert (select name from public.sites where domain = 'amazu.example') = 'Amazu', 'alice''s site is untouched';
end $$;

set local role anon;
do $$ begin
  begin
    perform 1 from public.sites;
    raise exception 'anon can read sites';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.tinylytics_ingest('x', null, '/', '', '', '', '', '', 'seed');
    raise exception 'anon can call the ingest function';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.tinylytics_summary(gen_random_uuid(), current_date, current_date);
    raise exception 'anon can call dashboard functions';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- ---------------------------------------------------------------------------
-- Ingestion
-- ---------------------------------------------------------------------------

set local role service_role;

do $$
declare
  pid text := (select value from t where key = 'public_a');
  t0 timestamptz := date_trunc('day', now() at time zone 'UTC') at time zone 'UTC' + interval '12 hours';
  r text;
begin
  -- Visitor 1: two pages in one session from Google, then a second session later.
  r := public.tinylytics_ingest(pid, 'amazu.example', '/', 'Google', 'RW', 'desktop', 'Chrome', 'Windows', 'v1', t0);
  assert r = 'ok', 'first page view accepted: ' || r;
  r := public.tinylytics_ingest(pid, 'www.amazu.example', '/pricing', '', 'RW', 'desktop', 'Chrome', 'Windows', 'v1', t0 + interval '1 minute');
  assert r = 'ok', 'subdomain accepted: ' || r;
  r := public.tinylytics_ingest(pid, null, '/', '', 'RW', 'desktop', 'Chrome', 'Windows', 'v1', t0 + interval '2 hours');
  assert r = 'ok', 'missing hostname accepted: ' || r;

  -- Visitor 2: one page (a bounce), then a duplicate within 2 seconds.
  r := public.tinylytics_ingest(pid, 'amazu.example', '/', '', 'US', 'mobile', 'Safari', 'iOS', 'v2', t0 + interval '5 minutes');
  assert r = 'ok', 'visitor 2 accepted: ' || r;
  r := public.tinylytics_ingest(pid, 'amazu.example', '/', '', 'US', 'mobile', 'Safari', 'iOS', 'v2', t0 + interval '5 minutes 1 second');
  assert r = 'duplicate', 'duplicate within 2s ignored: ' || r;

  r := public.tinylytics_ingest('nosuchsite', 'amazu.example', '/', '', '', '', '', '', 'v3', t0);
  assert r = 'unknown_site', 'unknown site rejected: ' || r;
  r := public.tinylytics_ingest(pid, 'evil.example', '/', '', '', '', '', '', 'v3', t0);
  assert r = 'domain_mismatch', 'other domain rejected: ' || r;
  r := public.tinylytics_ingest(pid, 'notamazu.example', '/', '', '', '', '', '', 'v3', t0);
  assert r = 'domain_mismatch', 'suffix lookalike domain rejected: ' || r;
end $$;

reset role;

do $$
declare
  site uuid := (select value::uuid from t where key = 'site_a');
  d public.daily_stats%rowtype;
  day date := (select min(day) from public.daily_stats where site_id = (select value::uuid from t where key = 'site_a'));
begin
  select * into d from public.daily_stats where site_id = site;
  assert d.visitors = 2, 'two visitors, got ' || d.visitors;
  assert d.pageviews = 4, 'four page views, got ' || d.pageviews;
  assert d.sessions = 3, 'three sessions, got ' || d.sessions;
  assert d.bounces = 2, 'two bounced sessions, got ' || d.bounces;

  assert (select count(*) from public.events where site_id = site and event_type = 'page_view') = 4, 'page_view events stored';
  assert (select count(*) from public.events where site_id = site and event_type = 'session_start') = 3, 'session_start events stored';
  assert (select count(distinct visitor_id) from public.events where site_id = site) = 2, 'visitor ids are stable within a day';
  assert (select octet_length(visitor_id) from public.events where site_id = site limit 1) = 16, 'visitor ids are truncated hashes';

  assert (select pageviews from public.daily_pages where site_id = site and page = '/') = 3, 'page views per page';
  assert (select visitors from public.daily_pages where site_id = site and page = '/') = 2, 'visitors per page';
  assert (select visitors from public.daily_pages where site_id = site and page = '/pricing') = 1, 'visitors on /pricing';

  assert (select sessions from public.daily_breakdowns where site_id = site and dimension = 'referrer' and value = 'Google') = 1, 'google sessions';
  assert (select pageviews from public.daily_breakdowns where site_id = site and dimension = 'referrer' and value = 'Google') = 2, 'page views attributed to session referrer';
  assert (select visitors from public.daily_breakdowns where site_id = site and dimension = 'referrer' and value = '') = 2, 'direct visitors';
  assert (select visitors from public.daily_breakdowns where site_id = site and dimension = 'country' and value = 'RW') = 1, 'visitor counted once per country';
  assert (select sessions from public.daily_breakdowns where site_id = site and dimension = 'country' and value = 'RW') = 2, 'sessions per country';
  assert (select visitors from public.daily_breakdowns where site_id = site and dimension = 'device_type' and value = 'mobile') = 1, 'mobile visitors';

  assert (select first_event_at from public.sites where id = site) is not null, 'first event is recorded for verification';
  assert (select count(*) from private.salts) >= 1, 'a salt exists for today';
end $$;

-- The same person on another day gets a different visitor id.
set local role service_role;
select public.tinylytics_ingest(
  (select value from t where key = 'public_a'), 'amazu.example', '/', '', 'RW', 'desktop', 'Chrome', 'Windows', 'v1',
  date_trunc('day', now() at time zone 'UTC') at time zone 'UTC' - interval '12 hours'
) \gset ignored_
reset role;

do $$
declare site uuid := (select value::uuid from t where key = 'site_a');
begin
  assert (select count(distinct visitor_id) from public.events where site_id = site) = 3, 'visitor ids rotate daily';
  assert (select count(*) from public.daily_stats where site_id = site) = 2, 'events land on the local day';
end $$;

-- ---------------------------------------------------------------------------
-- Dashboard queries and cross-user access
-- ---------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000a", "role": "authenticated"}';

do $$
declare
  site uuid := (select value::uuid from t where key = 'site_a');
  today date := (select max(day) from public.daily_stats where site_id = (select value::uuid from t where key = 'site_a'));
  s record;
begin
  select * into s from public.tinylytics_summary(site, today - 1, today);
  assert s.visitors = 3 and s.pageviews = 5 and s.sessions = 4 and s.bounces = 3, 'summary over two days';

  assert (select count(*) from public.tinylytics_daily_series(site, today - 6, today)) = 7, 'daily series fills empty days';
  assert (select sum(pageviews) from public.tinylytics_daily_series(site, today - 6, today)) = 5, 'daily series totals';

  assert (select count(*) from public.tinylytics_hourly_series(site, today)) = 24, 'hourly series has 24 buckets';
  assert (select sum(pageviews) from public.tinylytics_hourly_series(site, today)) = 4, 'hourly page views';
  assert (select sum(sessions) from public.tinylytics_hourly_series(site, today)) = 3, 'hourly sessions';

  assert (select page from public.tinylytics_top_pages(site, today - 1, today) limit 1) = '/', 'top page';
  assert (select pageviews from public.tinylytics_top_pages(site, today - 1, today) where page = '/') = 4, 'top page views';
  assert (select count(*) from public.tinylytics_breakdown(site, 'browser', today, today)) = 2, 'browser breakdown';
  assert (select value from public.tinylytics_breakdown(site, 'country', today, today) limit 1) = 'RW', 'country ordering by visitors';
  assert public.tinylytics_active_now(site) >= 0, 'active now runs';
end $$;

set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000b", "role": "authenticated"}';

do $$
declare
  site uuid := (select value::uuid from t where key = 'site_a');
  s record;
begin
  select * into s from public.tinylytics_summary(site, current_date - 30, current_date + 1);
  assert s.visitors = 0 and s.pageviews = 0, 'bob sees no totals for alice''s site';
  assert (select count(*) from public.tinylytics_top_pages(site, current_date - 30, current_date + 1)) = 0, 'bob sees no pages';
  assert (select count(*) from public.tinylytics_breakdown(site, 'country', current_date - 30, current_date + 1)) = 0, 'bob sees no countries';
  assert (select coalesce(sum(pageviews), 0) from public.tinylytics_hourly_series(site, current_date)) = 0, 'bob sees no hourly data';
  assert public.tinylytics_active_now(site) = 0, 'bob sees no active visitors';
  assert (select count(*) from public.events) = 0, 'bob reads no raw events';
  assert (select count(*) from public.sessions) = 0, 'bob reads no sessions';
  assert (select count(*) from public.daily_stats) = 0, 'bob reads no rollups';
end $$;

-- ---------------------------------------------------------------------------
-- Site ID regeneration, deletion and retention
-- ---------------------------------------------------------------------------

set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000a", "role": "authenticated"}';

update public.sites set public_id = public.tinylytics_public_id() where domain = 'amazu.example';

reset role;
set local role service_role;
do $$ begin
  assert public.tinylytics_ingest((select value from t where key = 'public_a'), null, '/', '', '', '', '', '', 'v9') = 'unknown_site',
    'old public id stops working after regeneration';
  assert (public.tinylytics_prune(395) ->> 'events_deleted')::integer = 0, 'recent events are kept';
end $$;
reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000a", "role": "authenticated"}';
delete from public.sites where domain = 'amazu.example';
reset role;

do $$
declare site uuid := (select value::uuid from t where key = 'site_a');
begin
  assert not exists (select 1 from public.events where site_id = site), 'events are deleted with the site';
  assert not exists (select 1 from public.sessions where site_id = site), 'sessions are deleted with the site';
  assert not exists (select 1 from public.daily_stats where site_id = site), 'rollups are deleted with the site';
  assert exists (select 1 from public.sites where domain = 'bob.example'), 'other sites are untouched';
end $$;

rollback;

\echo 'database tests passed'
