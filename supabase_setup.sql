-- ============================================================
--  Boat Note · Beat Manager — SECURITY setup (NON-destructive)
--
--  This script does NOT create, drop, alter or seed any table or
--  column. Your existing data in `artists`, `beats` and
--  `pipeline_state` is left completely untouched.
--
--  All it does is turn on Row Level Security and add a policy so
--  that ONLY the single logged-in admin (matched by email) can
--  read/write through the website. The render/pipeline backend
--  that uses the service_role key is unaffected (service_role
--  bypasses RLS).
--
--  ⚠️  PRODUCTION WARNING — READ BEFORE RUNNING ⚠️
--  These same tables are used by ANOTHER production system. Turning on
--  RLS changes access for EVERY client:
--    • Clients using the service_role key  -> unaffected (bypass RLS).
--    • Clients using the anon key WITHOUT a logged-in admin -> BLOCKED.
--  If the other system reads artists/beats with the anon key, running
--  this WILL break it. Only run this if you have confirmed the other
--  system uses the service_role key. The website itself works WITHOUT
--  running this (login still works); RLS only adds DB-level lockdown.
--  This script never creates/drops/alters tables or columns.
--
--  HOW TO RUN (only when you're sure):
--    Supabase Dashboard → SQL Editor → New query → paste → Run.
-- ============================================================

do $$
declare
  admin_email text := 'prodboatnoteadmin@gmail.com';   -- the admin login email
  t text;
begin
  if admin_email = 'CHANGE_ME@example.com' then
    raise exception 'Set admin_email to the real admin email before running.';
  end if;

  -- Protect the two tables the website uses.
  foreach t in array array['artists','beats'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin only" on public.%I', t);
    execute format(
      'create policy "admin only" on public.%I
         for all to authenticated
         using ((auth.jwt() ->> ''email'') = %L)
         with check ((auth.jwt() ->> ''email'') = %L)',
      t, admin_email, admin_email);
  end loop;
end $$;

-- ------------------------------------------------------------
--  OPTIONAL: also lock down pipeline_state the same way.
--  Only enable this if your render/pipeline backend talks to
--  Supabase with the service_role key (it bypasses RLS) and NOT
--  with the anon key. If unsure, leave this commented out.
-- ------------------------------------------------------------
-- do $$
-- declare admin_email text := 'prodboatnoteadmin@gmail.com';   -- same email
-- begin
--   alter table public.pipeline_state enable row level security;
--   drop policy if exists "admin only" on public.pipeline_state;
--   execute format(
--     'create policy "admin only" on public.pipeline_state
--        for all to authenticated
--        using ((auth.jwt() ->> ''email'') = %L)
--        with check ((auth.jwt() ->> ''email'') = %L)',
--     admin_email, admin_email);
-- end $$;

-- ============================================================
--  ADMIN LOGIN USER: already created (email pre-confirmed) as
--    prodboatnoteadmin@gmail.com
--  Change the password anytime in:
--    Supabase Dashboard → Authentication → Users → (user) → ...
--  This is the only account the policy above grants access to.
-- ============================================================
