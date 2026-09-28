-- Tinylytics initial schema.
--
-- Overview
--   profiles          one row per auth user
--   sites             tracked websites, owned by a user
--   sessions          one row per visit (30 min inactivity window)
--   events            raw event log (page_view, session_start)
--   daily_stats       per site, per local day totals
--   daily_pages       per site, per local day, per page
--   daily_breakdowns  per site, per local day, per dimension value
--   private.salts     daily random salts used to hash visitors (deleted after ~2 days)
--
-- All writes to analytics tables go through public.tinylytics_ingest(), which only
-- the service role may execute. Dashboard reads go through RLS-protected SQL
-- functions that run with the caller's privileges.

create schema if not exists private;
revoke all on schema private from public;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Short, unambiguous public identifier used in the tracking snippet.
create or replace function public.tinylytics_public_id()
returns text
language sql
volatile
set search_path = ''
as $$
  select string_agg(substr('abcdefghjkmnpqrstuvwxyz23456789ab', (get_byte(b, i) % 32) + 1, 1), '')
  from (select uuid_send(gen_random_uuid()) as b) s,
       unnest(array[0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14]) as i;
$$;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text check (name is null or char_length(name) <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_touch before update on public.profiles
  for each row execute function private.touch_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', ''), 100), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function private.handle_user_email_change();

-- ---------------------------------------------------------------------------
-- Sites
-- ---------------------------------------------------------------------------

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  public_id text not null unique default public.tinylytics_public_id()
    check (public_id ~ '^[a-z0-9]{8,32}$'),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  domain text not null check (
    char_length(domain) <= 253
    and domain ~ '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{0,61}[a-z0-9]$'
  ),
  timezone text not null default 'UTC',
  -- Set by the ingest function the first time a valid event arrives.
  first_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, domain)
);

create index sites_user_id_idx on public.sites (user_id);

create or replace function private.validate_site()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'Unknown timezone: %', new.timezone using errcode = '22023';
  end if;
  new.name := btrim(new.name);
  new.domain := lower(btrim(new.domain));
  return new;
end;
$$;

create trigger sites_validate before insert or update of timezone, name, domain on public.sites
  for each row execute function private.validate_site();

create trigger sites_touch before update on public.sites
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Sessions and events
-- ---------------------------------------------------------------------------

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  -- Truncated SHA-256 of (daily salt, site, request fingerprint). Not reversible
  -- once the salt is deleted, and different for the same person on another day.
  visitor_id bytea not null,
  -- Local calendar day (site timezone) the session started on.
  day date not null,
  started_at timestamptz not null,
  last_seen_at timestamptz not null,
  entry_page text not null,
  exit_page text not null,
  pageviews integer not null default 0,
  referrer text not null default '',
  country text not null default '',
  device_type text not null default '',
  browser text not null default '',
  os text not null default ''
);

create index sessions_visitor_idx on public.sessions (site_id, visitor_id, last_seen_at desc);
create index sessions_site_last_seen_idx on public.sessions (site_id, last_seen_at);
create index sessions_started_at_idx on public.sessions (started_at);

create table public.events (
  id bigint generated always as identity primary key,
  site_id uuid not null references public.sites (id) on delete cascade,
  event_type text not null check (event_type in ('page_view', 'session_start')),
  "timestamp" timestamptz not null default now(),
  page text not null,
  referrer text not null default '',
  country text not null default '',
  device_type text not null default '',
  browser text not null default '',
  os text not null default '',
  session_id uuid not null,
  visitor_id bytea not null
);

create index events_site_time_idx on public.events (site_id, "timestamp");
create index events_visitor_page_idx on public.events (site_id, visitor_id, page);
create index events_time_idx on public.events ("timestamp");

-- ---------------------------------------------------------------------------
-- Rollups (all days are in the site's timezone at the time of the event)
-- ---------------------------------------------------------------------------

create table public.daily_stats (
  site_id uuid not null references public.sites (id) on delete cascade,
  day date not null,
  visitors integer not null default 0,
  pageviews integer not null default 0,
  sessions integer not null default 0,
  -- Sessions with exactly one page view.
  bounces integer not null default 0,
  primary key (site_id, day)
);

create table public.daily_pages (
  site_id uuid not null references public.sites (id) on delete cascade,
  day date not null,
  page text not null,
  pageviews integer not null default 0,
  visitors integer not null default 0,
  primary key (site_id, day, page)
);

create table public.daily_breakdowns (
  site_id uuid not null references public.sites (id) on delete cascade,
  day date not null,
  dimension text not null check (dimension in ('referrer', 'country', 'device_type', 'browser', 'os')),
  value text not null,
  visitors integer not null default 0,
  sessions integer not null default 0,
  pageviews integer not null default 0,
  primary key (site_id, day, dimension, value)
);

-- ---------------------------------------------------------------------------
-- Salts
-- ---------------------------------------------------------------------------

create table private.salts (
  day date primary key,
  salt bytea not null
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.sessions enable row level security;
alter table public.events enable row level security;
alter table public.daily_stats enable row level security;
alter table public.daily_pages enable row level security;
alter table public.daily_breakdowns enable row level security;

-- Anonymous visitors never read or write anything directly.
revoke all on public.profiles, public.sites, public.sessions, public.events,
  public.daily_stats, public.daily_pages, public.daily_breakdowns from anon;

-- Authenticated users: read their own data, manage their own sites and profile.
revoke all on public.profiles, public.sites, public.sessions, public.events,
  public.daily_stats, public.daily_pages, public.daily_breakdowns from authenticated;

grant select on public.profiles, public.sites, public.sessions, public.events,
  public.daily_stats, public.daily_pages, public.daily_breakdowns to authenticated;
grant update (name) on public.profiles to authenticated;
grant insert (name, domain, timezone) on public.sites to authenticated;
grant update (name, domain, timezone, public_id) on public.sites to authenticated;
grant delete on public.sites to authenticated;

create policy "Users read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Users update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Users read own sites" on public.sites
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Users create own sites" on public.sites
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Users update own sites" on public.sites
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Users delete own sites" on public.sites
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "Users read own sessions" on public.sessions
  for select to authenticated
  using (site_id in (select id from public.sites where user_id = (select auth.uid())));
create policy "Users read own events" on public.events
  for select to authenticated
  using (site_id in (select id from public.sites where user_id = (select auth.uid())));
create policy "Users read own daily stats" on public.daily_stats
  for select to authenticated
  using (site_id in (select id from public.sites where user_id = (select auth.uid())));
create policy "Users read own daily pages" on public.daily_pages
  for select to authenticated
  using (site_id in (select id from public.sites where user_id = (select auth.uid())));
create policy "Users read own daily breakdowns" on public.daily_breakdowns
  for select to authenticated
  using (site_id in (select id from public.sites where user_id = (select auth.uid())));

-- ---------------------------------------------------------------------------
-- Ingestion
-- ---------------------------------------------------------------------------

-- Records one page view. Called by POST /api/collect with the service role.
--
-- p_visitor_seed is a hash computed by the API from (IP, user agent, site). The
-- raw IP never reaches the database. Here it is combined with a random salt for
-- the site's current local day, so the stored visitor_id cannot be linked to a
-- person or across days once the salt is deleted.
--
-- Returns one of: 'ok', 'duplicate', 'unknown_site', 'domain_mismatch'.
create or replace function public.tinylytics_ingest(
  p_public_id text,
  p_hostname text,
  p_page text,
  p_referrer text,
  p_country text,
  p_device_type text,
  p_browser text,
  p_os text,
  p_visitor_seed text,
  p_now timestamptz default now()
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_site public.sites%rowtype;
  v_day date;
  v_salt bytea;
  v_visitor bytea;
  v_session public.sessions%rowtype;
  v_new_session boolean := false;
  v_seen_visitor boolean;
  v_seen_referrer boolean;
  v_seen_country boolean;
  v_seen_device boolean;
  v_seen_browser boolean;
  v_seen_os boolean;
  v_seen_page boolean;
  v_referrer text := coalesce(p_referrer, '');
  v_country text := coalesce(p_country, '');
  v_device text := coalesce(p_device_type, '');
  v_browser text := coalesce(p_browser, '');
  v_os text := coalesce(p_os, '');
begin
  select * into v_site from public.sites where public_id = p_public_id;
  if not found then
    return 'unknown_site';
  end if;

  -- Accept the site's domain and any of its subdomains. A missing hostname is
  -- accepted because some browsers and proxies strip Origin/Referer headers.
  if p_hostname is not null and p_hostname <> ''
     and lower(p_hostname) <> v_site.domain
     and right(lower(p_hostname), char_length(v_site.domain) + 1) <> '.' || v_site.domain then
    return 'domain_mismatch';
  end if;

  v_day := (p_now at time zone v_site.timezone)::date;

  select salt into v_salt from private.salts where day = v_day;
  if v_salt is null then
    -- Rotate: salts older than yesterday (UTC) are no longer needed by any timezone.
    delete from private.salts where day < (now() at time zone 'UTC')::date - 1 and day <> v_day;
    insert into private.salts (day, salt)
    values (v_day, uuid_send(gen_random_uuid()) || uuid_send(gen_random_uuid()))
    on conflict (day) do nothing;
    select salt into v_salt from private.salts where day = v_day;
  end if;

  v_visitor := substring(sha256(v_salt || convert_to(v_site.id::text || ':' || p_visitor_seed, 'UTF8')) from 1 for 16);

  -- Serialize concurrent requests from the same visitor so they share a session.
  perform pg_advisory_xact_lock(hashtextextended(encode(v_visitor, 'hex'), 0));

  select * into v_session
  from public.sessions
  where site_id = v_site.id
    and visitor_id = v_visitor
    and last_seen_at > p_now - interval '30 minutes'
  order by last_seen_at desc
  limit 1
  for update;

  if found then
    -- The same page reported twice within 2 seconds is a client-side duplicate.
    if v_session.exit_page = p_page and v_session.last_seen_at > p_now - interval '2 seconds' then
      return 'duplicate';
    end if;
  else
    v_new_session := true;

    -- What has this visitor already been counted under today?
    select
      count(*) > 0,
      coalesce(bool_or(referrer = v_referrer), false),
      coalesce(bool_or(country = v_country), false),
      coalesce(bool_or(device_type = v_device), false),
      coalesce(bool_or(browser = v_browser), false),
      coalesce(bool_or(os = v_os), false)
    into v_seen_visitor, v_seen_referrer, v_seen_country, v_seen_device, v_seen_browser, v_seen_os
    from public.sessions
    where site_id = v_site.id and visitor_id = v_visitor;

    insert into public.sessions (
      site_id, visitor_id, day, started_at, last_seen_at, entry_page, exit_page,
      pageviews, referrer, country, device_type, browser, os
    ) values (
      v_site.id, v_visitor, v_day, p_now, p_now, p_page, p_page,
      0, v_referrer, v_country, v_device, v_browser, v_os
    )
    returning * into v_session;

    insert into public.events (site_id, event_type, "timestamp", page, referrer, country, device_type, browser, os, session_id, visitor_id)
    values (v_site.id, 'session_start', p_now, p_page, v_referrer, v_country, v_device, v_browser, v_os, v_session.id, v_visitor);
  end if;

  select exists (
    select 1 from public.events
    where site_id = v_site.id and visitor_id = v_visitor and page = p_page and event_type = 'page_view'
  ) into v_seen_page;

  insert into public.events (site_id, event_type, "timestamp", page, referrer, country, device_type, browser, os, session_id, visitor_id)
  values (v_site.id, 'page_view', p_now, p_page, v_session.referrer, v_session.country, v_session.device_type,
          v_session.browser, v_session.os, v_session.id, v_visitor);

  update public.sessions
  set pageviews = pageviews + 1, last_seen_at = p_now, exit_page = p_page
  where id = v_session.id;

  -- Daily totals. Sessions, bounces and visitors are attributed to the day the
  -- session started; page views to the day they happened.
  insert into public.daily_stats as d (site_id, day, visitors, pageviews, sessions, bounces)
  values (
    v_site.id, v_day,
    case when v_new_session and not v_seen_visitor then 1 else 0 end,
    1,
    case when v_new_session then 1 else 0 end,
    case when v_new_session then 1 else 0 end
  )
  on conflict (site_id, day) do update set
    visitors = d.visitors + excluded.visitors,
    pageviews = d.pageviews + 1,
    sessions = d.sessions + excluded.sessions,
    bounces = d.bounces + excluded.bounces;

  -- A session's second page view means it is no longer a bounce.
  if not v_new_session and v_session.pageviews = 1 then
    update public.daily_stats set bounces = greatest(bounces - 1, 0)
    where site_id = v_site.id and day = v_session.day;
  end if;

  insert into public.daily_pages as d (site_id, day, page, pageviews, visitors)
  values (v_site.id, v_day, p_page, 1, case when v_seen_page then 0 else 1 end)
  on conflict (site_id, day, page) do update set
    pageviews = d.pageviews + 1,
    visitors = d.visitors + excluded.visitors;

  insert into public.daily_breakdowns as d (site_id, day, dimension, value, visitors, sessions, pageviews)
  select v_site.id, v_day, dim, val, vis, ses, 1
  from (values
    ('referrer', v_session.referrer, case when v_new_session and not v_seen_referrer then 1 else 0 end),
    ('country', v_session.country, case when v_new_session and not v_seen_country then 1 else 0 end),
    ('device_type', v_session.device_type, case when v_new_session and not v_seen_device then 1 else 0 end),
    ('browser', v_session.browser, case when v_new_session and not v_seen_browser then 1 else 0 end),
    ('os', v_session.os, case when v_new_session and not v_seen_os then 1 else 0 end)
  ) as b(dim, val, vis),
  lateral (select case when v_new_session then 1 else 0 end as ses) s
  on conflict (site_id, day, dimension, value) do update set
    visitors = d.visitors + excluded.visitors,
    sessions = d.sessions + excluded.sessions,
    pageviews = d.pageviews + 1;

  if v_site.first_event_at is null then
    update public.sites set first_event_at = p_now where id = v_site.id and first_event_at is null;
  end if;

  return 'ok';
end;
$$;

revoke all on function public.tinylytics_ingest(text, text, text, text, text, text, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.tinylytics_ingest(text, text, text, text, text, text, text, text, text, timestamptz) to service_role;

-- ---------------------------------------------------------------------------
-- Retention
-- ---------------------------------------------------------------------------

-- Deletes raw events and sessions older than the retention window, and any
-- visitor salts that are no longer needed. Daily rollups are kept, so charts and
-- totals for older periods keep working after raw data is removed.
create or replace function public.tinylytics_prune(p_retention_days integer default 395)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cutoff timestamptz := now() - make_interval(days => greatest(p_retention_days, 2));
  v_events bigint;
  v_sessions bigint;
begin
  delete from public.events where "timestamp" < v_cutoff;
  get diagnostics v_events = row_count;
  delete from public.sessions where last_seen_at < v_cutoff;
  get diagnostics v_sessions = row_count;
  delete from private.salts where day < (now() at time zone 'UTC')::date - 1;
  return jsonb_build_object('events_deleted', v_events, 'sessions_deleted', v_sessions);
end;
$$;

revoke all on function public.tinylytics_prune(integer) from public, anon, authenticated;
grant execute on function public.tinylytics_prune(integer) to service_role;

-- ---------------------------------------------------------------------------
-- Dashboard queries
--
-- These run with the caller's privileges (security invoker), so RLS decides
-- which rows they can see. Querying another user's site returns no data.
-- Date arguments are inclusive local days in the site's timezone.
-- ---------------------------------------------------------------------------

create or replace function public.tinylytics_summary(p_site_id uuid, p_from date, p_to date)
returns table (visitors bigint, pageviews bigint, sessions bigint, bounces bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce(sum(visitors), 0)::bigint,
    coalesce(sum(pageviews), 0)::bigint,
    coalesce(sum(sessions), 0)::bigint,
    coalesce(sum(bounces), 0)::bigint
  from public.daily_stats
  where site_id = p_site_id and day between p_from and p_to;
$$;

create or replace function public.tinylytics_daily_series(p_site_id uuid, p_from date, p_to date)
returns table (day date, visitors bigint, pageviews bigint, sessions bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    g.day::date,
    coalesce(d.visitors, 0)::bigint,
    coalesce(d.pageviews, 0)::bigint,
    coalesce(d.sessions, 0)::bigint
  from generate_series(p_from::timestamp, p_to::timestamp, interval '1 day') as g(day)
  left join public.daily_stats d on d.site_id = p_site_id and d.day = g.day::date
  where p_to - p_from <= 400
  order by 1;
$$;

-- Hourly series for a single local day, computed from raw events.
create or replace function public.tinylytics_hourly_series(p_site_id uuid, p_day date)
returns table (hour integer, visitors bigint, pageviews bigint, sessions bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  with site as (
    select id, timezone from public.sites where id = p_site_id
  ),
  bounds as (
    select id, timezone,
      (p_day::timestamp at time zone timezone) as start_at,
      ((p_day + 1)::timestamp at time zone timezone) as end_at
    from site
  ),
  e as (
    select extract(hour from (ev."timestamp" at time zone b.timezone))::integer as hour,
           ev.event_type, ev.visitor_id
    from public.events ev
    join bounds b on ev.site_id = b.id
    where ev."timestamp" >= b.start_at and ev."timestamp" < b.end_at
  )
  select
    h.hour,
    count(distinct e.visitor_id) filter (where e.event_type = 'page_view'),
    count(*) filter (where e.event_type = 'page_view'),
    count(*) filter (where e.event_type = 'session_start')
  from generate_series(0, 23) as h(hour)
  left join e on e.hour = h.hour
  group by h.hour
  order by h.hour;
$$;

create or replace function public.tinylytics_top_pages(p_site_id uuid, p_from date, p_to date, p_limit integer default 10)
returns table (page text, pageviews bigint, visitors bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select page, sum(pageviews)::bigint, sum(visitors)::bigint
  from public.daily_pages
  where site_id = p_site_id and day between p_from and p_to
  group by page
  order by 2 desc, 1
  limit least(greatest(p_limit, 1), 100);
$$;

create or replace function public.tinylytics_breakdown(
  p_site_id uuid, p_dimension text, p_from date, p_to date, p_limit integer default 10
)
returns table (value text, visitors bigint, sessions bigint, pageviews bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select value, sum(visitors)::bigint, sum(sessions)::bigint, sum(pageviews)::bigint
  from public.daily_breakdowns
  where site_id = p_site_id and dimension = p_dimension and day between p_from and p_to
  group by value
  order by 2 desc, 3 desc, 1
  limit least(greatest(p_limit, 1), 100);
$$;

-- Distinct visitors with activity in the last 5 minutes.
create or replace function public.tinylytics_active_now(p_site_id uuid)
returns bigint
language sql
stable
security invoker
set search_path = ''
as $$
  select count(distinct visitor_id)
  from public.sessions
  where site_id = p_site_id and last_seen_at > now() - interval '5 minutes';
$$;

revoke all on function
  public.tinylytics_summary(uuid, date, date),
  public.tinylytics_daily_series(uuid, date, date),
  public.tinylytics_hourly_series(uuid, date),
  public.tinylytics_top_pages(uuid, date, date, integer),
  public.tinylytics_breakdown(uuid, text, date, date, integer),
  public.tinylytics_active_now(uuid)
from public, anon;

grant execute on function
  public.tinylytics_summary(uuid, date, date),
  public.tinylytics_daily_series(uuid, date, date),
  public.tinylytics_hourly_series(uuid, date),
  public.tinylytics_top_pages(uuid, date, date, integer),
  public.tinylytics_breakdown(uuid, text, date, date, integer),
  public.tinylytics_active_now(uuid)
to authenticated;

revoke all on function public.tinylytics_public_id() from public, anon;
grant execute on function public.tinylytics_public_id() to authenticated, service_role;
