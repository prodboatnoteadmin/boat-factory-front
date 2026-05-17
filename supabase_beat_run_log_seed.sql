-- ============================================================================
--  beat_run_log — seed the FIRST run record for every beat.
-- ----------------------------------------------------------------------------
--  Run this in the Supabase SQL editor, AFTER supabase_beat_run_log.sql
--  (which creates the table).
--
--  Safe for the shared production database:
--    * Reads only from existing public.beats / public.artists.
--    * Writes ONLY into the new public.beat_run_log.
--    * Idempotent: inserts a row only for beats that do not already have one,
--      so exactly one "first record" per beat and safe to re-run (no dupes).
--
--  Field mapping (from the beat's own data):
--    date              = beats.upload_date          (same as upload_to_youtube)
--    youtube_title     = beats.title                (full YouTube title)
--    artist            = artists.name               (via beats.artist_id)
--    songname          = beats.songtitle
--    youtube_link      = beats.youtube_link
--    upload_to_youtube = beats.upload_date
--    file_folder       = beats.file_path WITHOUT the trailing filename
-- ============================================================================

insert into public.beat_run_log
  (beat_id, date, youtube_title, artist, songname, youtube_link, upload_to_youtube, file_folder)
select
  b.id,
  b.upload_date,
  b.title,
  a.name,
  b.songtitle,
  b.youtube_link,
  b.upload_date,
  case
    when b.file_path is null then null
    when b.file_path ~ '/[^/]+\.[^/.]+$'
      then regexp_replace(b.file_path, '/[^/]+\.[^/.]+$', '')  -- drop /filename.ext
    else b.file_path                                            -- already a folder
  end
from public.beats b
left join public.artists a on a.id = b.artist_id
where b.youtube_link is not null and b.youtube_link <> ''
  and not exists (                       -- key is the YouTube link, not the beat
    select 1 from public.beat_run_log r where r.youtube_link = b.youtube_link
  );
