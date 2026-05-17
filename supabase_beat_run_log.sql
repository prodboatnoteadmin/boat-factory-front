-- ============================================================================
--  beat_run_log  —  ADDITIVE ONLY.  Run this in the Supabase SQL editor.
-- ----------------------------------------------------------------------------
--  PRODUCTION / SHARED DATABASE NOTICE
--  This database is shared with another production system. This script is
--  deliberately *additive only*:
--    * It CREATES ONE NEW TABLE (public.beat_run_log).
--    * It DOES NOT alter, rename, or drop any existing table or column.
--    * It DOES NOT touch public.beats other than referencing beats(id) in a
--      foreign key. The FK is validated instantly because the new table is
--      empty; it adds NO columns to beats and changes NO existing data.
--    * Safe to re-run (IF NOT EXISTS / idempotent policy + grants).
--  To undo completely:  DROP TABLE public.beat_run_log;
-- ============================================================================

create table if not exists public.beat_run_log (
  id                uuid primary key default gen_random_uuid(),
  beat_id           uuid,          -- relation to public.beats(id) (see note below)
  date              date,          -- when the run (kørsel) happened
  youtube_title     text,
  artist            text,
  songname          text,
  youtube_link      text,
  upload_to_youtube date,
  file_folder       text,
  created_at        timestamptz not null default now()
);

-- Fast per-beat lookups; youtube_link index supports matching by link too.
create index if not exists beat_run_log_beat_id_idx      on public.beat_run_log (beat_id);
create index if not exists beat_run_log_youtube_link_idx  on public.beat_run_log (youtube_link);

-- Row Level Security: the website signs in as the admin user (role
-- `authenticated`) and only READS this table. The render/writer process
-- should use the service_role key, which bypasses RLS automatically.
alter table public.beat_run_log enable row level security;

drop policy if exists "beat_run_log read for authenticated" on public.beat_run_log;
create policy "beat_run_log read for authenticated"
  on public.beat_run_log
  for select
  to authenticated
  using (true);

grant select on public.beat_run_log to authenticated;
grant all    on public.beat_run_log to service_role;

-- ----------------------------------------------------------------------------
--  OPTIONAL: enforce the relation with a real foreign key.
--  Left OUT by default on purpose: adding an FK that references the SHARED
--  public.beats table briefly takes a lock on beats (to install the
--  referential trigger), which can momentarily block writes to beats on the
--  other production system. The app does not need the constraint — beat_id +
--  the index above is a sufficient logical relation and the UI matches on it.
--  Run this line ONLY during a quiet window if you want hard referential
--  integrity:
--
--  alter table public.beat_run_log
--    add constraint beat_run_log_beat_id_fkey
--    foreign key (beat_id) references public.beats(id) on delete set null;
-- ----------------------------------------------------------------------------
