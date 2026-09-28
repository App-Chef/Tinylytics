-- Minimal stand-in for the parts of Supabase that the Tinylytics schema relies on.
-- Only used when running the database tests against a plain PostgreSQL server.
-- Mirrors Supabase's default grants, so revokes in the migrations are exercised.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end $$;

create schema if not exists auth;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

create table if not exists auth.identities (
  provider_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  identity_data jsonb not null,
  provider text not null,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  unique (provider_id, provider)
);

-- Columns Supabase Auth has that the seed file writes to.
alter table auth.users
  add column if not exists instance_id uuid,
  add column if not exists aud text,
  add column if not exists role text,
  add column if not exists encrypted_password text,
  add column if not exists email_confirmed_at timestamptz,
  add column if not exists raw_app_meta_data jsonb,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz,
  add column if not exists confirmation_token text,
  add column if not exists recovery_token text,
  add column if not exists email_change_token_new text,
  add column if not exists email_change text;

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claim.sub', true),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    ),
    ''
  )::uuid
$$;

grant usage on schema auth, public to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
