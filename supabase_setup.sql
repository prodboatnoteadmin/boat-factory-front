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
--  HOW TO RUN:
--    Supabase Dashboard → SQL Editor → New query → paste → Run.
--
--  >>> STEP 1: put the admin's email here (the one you log in with):
-- ============================================================

do $$
declare
  admin_email text := 'CHANGE_ME@example.com';   -- <-- EDIT THIS
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
-- declare admin_email text := 'CHANGE_ME@example.com';   -- same email
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
--  STEP 2: create the single admin login user.
--  Easiest + safest: Supabase Dashboard → Authentication → Users
--  → "Add user" → enter the SAME email as above + a password,
--  and tick "Auto Confirm User". That's the only account that
--  will have access (because of the policy above).
-- ============================================================
