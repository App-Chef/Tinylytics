-- ============================================================================
-- DEVELOPMENT / DEMO DATA ONLY
--
-- Creates a local demo account and one demo site filled with 90 days of
-- synthetic traffic, so the dashboard has something to show during
-- development. None of these numbers describe real visitors.
--
--   Email:    demo@tinylytics.local
--   Password: tinylytics-demo
--
-- Applied automatically by `supabase db reset` (local development only).
-- Never run this against a production database.
-- ============================================================================

do $$
declare
  v_user uuid := '11111111-1111-4111-8111-111111111111';
  v_site uuid;
  v_public text := 'demoamazu001';
  v_day date;
  v_days integer := 90;
  v_visitors integer;
  v_now timestamptz := now();
  v_start timestamptz;
  v_at timestamptz;
  v_seed text;
  v_ref text;
  v_country text;
  v_device text;
  v_browser text;
  v_os text;
  v_pages integer;
  v_page text;
  r double precision;
  i integer;
  s integer;
  p integer;
begin
  perform setseed(0.42);

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_user, 'authenticated', 'authenticated',
    'demo@tinylytics.local', extensions.crypt('tinylytics-demo', extensions.gen_salt('bf')), now(),
    '{"provider": "email", "providers": ["email"]}', '{"name": "Demo"}', now(), now(),
    '', '', '', ''
  ) on conflict (id) do nothing;

  insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    v_user::text, v_user,
    jsonb_build_object('sub', v_user::text, 'email', 'demo@tinylytics.local', 'email_verified', true),
    'email', now(), now(), now()
  ) on conflict do nothing;

  insert into public.sites (user_id, public_id, name, domain, timezone)
  values (v_user, v_public, 'Amazu (demo data)', 'amazu.example', 'Africa/Kigali')
  on conflict (public_id) do nothing;
  select id into v_site from public.sites where public_id = v_public;

  -- A second, empty site to show the "waiting for first event" state.
  insert into public.sites (user_id, public_id, name, domain, timezone)
  values (v_user, 'demoempty001', 'Side project (demo, no data)', 'side-project.example', 'Europe/Berlin')
  on conflict (public_id) do nothing;

  for d in reverse (v_days - 1)..0 loop
    v_day := ((v_now at time zone 'Africa/Kigali')::date) - d;
    -- Gentle growth, a weekly rhythm, and some noise.
    v_visitors := greatest(5, round(
      (55 + (v_days - d) * 0.9)
      * (case extract(isodow from v_day) when 6 then 0.7 when 7 then 0.65 else 1.0 end)
      * (0.8 + random() * 0.4)
    )::integer);

    for i in 1..v_visitors loop
      v_seed := 'demo-' || v_day || '-' || i;

      r := random();
      v_ref := case
        when r < 0.40 then ''
        when r < 0.65 then 'Google'
        when r < 0.77 then 'GitHub'
        when r < 0.85 then 'X'
        when r < 0.91 then 'Reddit'
        when r < 0.96 then 'Hacker News'
        else 'dev.to' end;

      r := random();
      v_country := case
        when r < 0.35 then 'RW'
        when r < 0.57 then 'US'
        when r < 0.69 then 'KE'
        when r < 0.79 then 'GB'
        when r < 0.87 then 'DE'
        when r < 0.92 then 'NG'
        when r < 0.96 then 'FR'
        else 'IN' end;

      r := random();
      if r < 0.60 then
        v_device := 'desktop';
        r := random();
        v_browser := case when r < 0.62 then 'Chrome' when r < 0.78 then 'Safari' when r < 0.90 then 'Firefox' when r < 0.98 then 'Edge' else 'Other' end;
        v_os := case when v_browser = 'Safari' then 'macOS' when v_browser = 'Edge' then 'Windows'
                     else (case when random() < 0.55 then 'Windows' when random() < 0.6 then 'macOS' else 'Linux' end) end;
      elsif r < 0.95 then
        v_device := 'mobile';
        if random() < 0.55 then v_browser := 'Chrome'; v_os := 'Android';
        else v_browser := 'Safari'; v_os := 'iOS'; end if;
      else
        v_device := 'tablet';
        v_browser := 'Safari'; v_os := 'iOS';
      end if;

      -- Most visitors come once a day; some come back for a second session.
      for s in 1..(case when random() < 0.12 then 2 else 1 end) loop
        v_start := (v_day::timestamp at time zone 'Africa/Kigali')
          + make_interval(secs => (7 * 3600 + random() * 15 * 3600 + (s - 1) * 3 * 3600)::integer);
        continue when v_start > v_now;
        continue when (v_start at time zone 'Africa/Kigali')::date <> v_day;

        r := random();
        v_pages := case when r < 0.43 then 1 when r < 0.73 then 2 when r < 0.90 then 3 else 4 + floor(random() * 3)::integer end;

        for p in 1..v_pages loop
          r := random();
          v_page := case
            when p = 1 and r < 0.55 then '/'
            when p = 1 and r < 0.70 then '/blog/launching-amazu'
            when p = 1 and r < 0.85 then '/docs'
            when r < 0.30 then '/pricing'
            when r < 0.55 then '/docs'
            when r < 0.68 then '/docs/getting-started'
            when r < 0.80 then '/about'
            when r < 0.90 then '/'
            else '/contact' end;
          v_at := v_start + make_interval(secs => (p - 1) * (20 + floor(random() * 120))::integer);
          exit when v_at > v_now;
          perform public.tinylytics_ingest(
            v_public, 'amazu.example', v_page,
            case when s = 1 then v_ref else '' end,
            v_country, v_device, v_browser, v_os, v_seed, v_at
          );
        end loop;
      end loop;
    end loop;
  end loop;
end $$;
