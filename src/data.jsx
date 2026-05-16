// Supabase-backed data layer — mapped to the EXISTING database schema
// (public.artists, public.beats). No tables/columns are created here.
// The prototype UI keeps its `window.DATA` shape; this module translates
// between that shape and the real columns.
//
// Real schema (from Supabase):
//   artists(id uuid, name, tiktok_artist_hashtag text[], tiktok_a_tags text[],
//           tiktok_b_tags text[], tiktok_c_tags text[], youtube_keywords,
//           tiktok_profile, youtube_profile, spotify_profile,
//           instagram_profile, notes, created_at)
//   beats(id uuid, songtitle, artist_id uuid -> artists.id, pre_artist,
//         co_artists text[], year text, bpm int, key, title, collab,
//         co_collabs text[], status, queue_position int, category,
//         published_youtube bool, published_tiktok bool, upload_date date,
//         views int, youtube_link, beatstars_link, file_name, file_path,
//         description, notes, created_at, updated_at)
//   (There is no `jobs` table — publishing history is therefore empty.)

const KEYS = ['Cmin','C#min','Dmin','D#min','Emin','Fmin','F#min','Gmin','G#min','Amin','A#min','Bmin','Cmaj','C#maj','Dmaj','D#maj','Emaj','Fmaj','F#maj','Gmaj','G#maj','Amaj','A#maj','Bmaj'];

const sb = () => window.supabase;
const arrify = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

// ---- row (real schema) -> UI shape --------------------------------------
const mapArtist = (r) => ({
  id: r.id,
  name: r.name || '',
  tiktok: r.tiktok_profile || undefined,
  youtube: r.youtube_profile || undefined,
  spotify: r.spotify_profile || undefined,
  instagram: r.instagram_profile || undefined,
  aTags: arrify(r.tiktok_a_tags),
  bTags: arrify(r.tiktok_b_tags),
  cTags: arrify(r.tiktok_c_tags),
  artistHashtags: arrify(r.tiktok_artist_hashtag),
  youtubeKeywords: r.youtube_keywords || '',
  notes: r.notes || '',
  beatsCount: 0, // filled after beats load
});

const mapBeat = (r) => ({
  id: r.id,
  title: r.songtitle || r.title || '(uden titel)',
  artist: r.artist_id || '',
  preArtist: r.pre_artist || '',
  bpm: r.bpm ?? '',
  key: r.key || '',
  year: r.year ?? '',
  status: r.status || 'draft',
  category: r.category || '',
  uploadDate: r.upload_date || '',
  collab: r.collab || '',
  coCollabs: arrify(r.co_collabs),
  coArtists: arrify(r.co_artists),
  youtube: r.youtube_link || '',
  beatstars: r.beatstars_link || '',
  youtubeStatus: !!r.published_youtube,
  tiktokStatus: !!r.published_tiktok,
  fileName: r.file_name || '',
  filePath: r.file_path || '',
  views: r.views ?? 0,
  plays: 0, // no column in the real schema
  description: r.description || '',
  notes: r.notes || '',
  created: r.created_at || '',
  modified: r.updated_at || r.created_at || '',
  queuePosition: r.queue_position == null ? undefined : r.queue_position,
});

// ---- UI form -> row (real schema) ---------------------------------------
const uuid = () =>
  (window.crypto && window.crypto.randomUUID
    ? window.crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }));
const nowIso = () => new Date().toISOString();
const intOrNull = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
};

const beatFormToRow = (form) => ({
  songtitle: (form.title || '').trim(),
  artist_id: form.artist || null,
  bpm: intOrNull(form.bpm),
  key: form.key || null,
  year: form.year === '' || form.year == null ? null : String(form.year),
  status: form.status || 'draft',
  category: form.category || null,
  collab: form.collab || null,
  co_collabs: arrify(form.coCollabs),
  co_artists: arrify(form.coArtists),
  youtube_link: form.youtube || null,
  beatstars_link: form.beatstars || null,
  file_name: form.fileName || null,
  file_path: form.filePath || null,
  notes: form.notes || null,
  updated_at: nowIso(),
});

const artistFormToRow = (form) => ({
  name: (form.name || '').trim(),
  tiktok_profile: form.tiktok || null,
  youtube_profile: form.youtube || null,
  spotify_profile: form.spotify || null,
  instagram_profile: form.instagram || null,
});

// ---- Load everything ----------------------------------------------------
window.loadData = async function loadData() {
  const [artistsRes, beatsRes] = await Promise.all([
    sb().from('artists').select('*').order('name'),
    sb().from('beats').select('*'),
  ]);

  const firstErr = artistsRes.error || beatsRes.error;
  if (firstErr) {
    const e = new Error(firstErr.message || 'Kunne ikke hente data fra Supabase');
    e.detail = firstErr;
    throw e;
  }

  const ARTISTS = (artistsRes.data || []).map(mapArtist);
  const BEATS = (beatsRes.data || []).map(mapBeat);
  const JOBS = []; // no jobs table in this database

  const counts = {};
  BEATS.forEach((b) => { if (b.artist) counts[b.artist] = (counts[b.artist] || 0) + 1; });
  ARTISTS.forEach((a) => { a.beatsCount = counts[a.id] || 0; });

  window.DATA = { ARTISTS, BEATS, KEYS, JOBS };

  const beatById = (id) => BEATS.find((b) => b.id === id);

  // No jobs table → publishing history is empty everywhere.
  window.getBeatJobs = () => [];
  // Surface the beat's own YouTube link so the embed/indicators work.
  window.getFirstYouTubeLink = (beatId) => {
    const b = beatById(beatId);
    return b && b.youtube ? b.youtube : null;
  };
  // "Udgivet" date: published beats use their upload date (fallback modified).
  window.getLatestPublishDate = (beatId) => {
    const b = beatById(beatId);
    if (!b || b.status !== 'published') return null;
    return b.uploadDate || b.modified || null;
  };

  return window.DATA;
};

// ---- Writes -------------------------------------------------------------
const throwIf = (error, msg) => {
  if (error) {
    const e = new Error(error.message || msg);
    e.detail = error;
    throw e;
  }
};

window.DB = {
  async createBeat(form) {
    const id = uuid();
    const row = { id, ...beatFormToRow(form), created_at: nowIso() };
    const { data, error } = await sb().from('beats').insert(row).select('id');
    throwIf(error, 'Kunne ikke oprette beat');
    if (!data || !data.length) {
      throw new Error('Beatet blev ikke gemt — tjek rettigheder (RLS) i Supabase.');
    }
    return id;
  },

  async updateBeat(id, form) {
    const { data, error } = await sb()
      .from('beats')
      .update(beatFormToRow(form))
      .eq('id', id)
      .select('id');
    throwIf(error, 'Kunne ikke gemme beat');
    if (!data || !data.length) {
      throw new Error('Ændringen blev ikke gemt — tjek rettigheder (RLS) i Supabase.');
    }
  },

  async deleteBeat(id) {
    const { error } = await sb().from('beats').delete().eq('id', id);
    throwIf(error, 'Kunne ikke slette beat');
  },

  async createArtist(form) {
    const id = uuid();
    const { error } = await sb().from('artists').insert({ id, ...artistFormToRow(form), created_at: nowIso() });
    throwIf(error, 'Kunne ikke oprette artist');
    return id;
  },

  async updateArtist(id, form) {
    const { data, error } = await sb()
      .from('artists')
      .update(artistFormToRow(form))
      .eq('id', id)
      .select('id');
    throwIf(error, 'Kunne ikke gemme artist');
    if (!data || !data.length) {
      throw new Error('Ændringen blev ikke gemt — tjek rettigheder (RLS) i Supabase.');
    }
  },

  async updateArtistKeywords(id, keywords) {
    const { error } = await sb()
      .from('artists')
      .update({ youtube_keywords: keywords || null })
      .eq('id', id);
    throwIf(error, 'Kunne ikke gemme YouTube keywords');
  },

  // fields: any subset of tiktok_artist_hashtag / tiktok_a_tags /
  //         tiktok_b_tags / tiktok_c_tags  (each a string[])
  async updateArtistTags(id, fields) {
    const { error } = await sb().from('artists').update(fields).eq('id', id);
    throwIf(error, 'Kunne ikke gemme tags');
  },

  // Persist the publish queue.
  //
  // We must NOT upsert: upsert tries to INSERT rows whose id doesn't
  // match, which fails the NOT NULL constraint on songtitle. Plain
  // UPDATE only ever touches the columns we send, so it's safe.
  //
  // To stay fast we only UPDATE the beats whose position/status
  // actually changed, and run those updates in parallel chunks. A beat
  // in the queue is, by definition, pending publication, so we force
  // status='pending' (otherwise it's filtered out of the queue on the
  // next load).
  async persistQueue(queueIds) {
    const ids = Array.isArray(queueIds) ? queueIds : [];
    const stamp = nowIso();

    const { data: current, error: selErr } = await sb()
      .from('beats')
      .select('id, queue_position, status')
      .not('queue_position', 'is', null);
    throwIf(selErr, 'Kunne ikke læse køen');
    const curMap = new Map((current || []).map(r => [r.id, r]));

    // Only the beats whose position or status differs need an update.
    const ops = [];
    ids.forEach((id, i) => {
      const pos = i + 1;
      const c = curMap.get(id);
      if (!c || c.queue_position !== pos || c.status !== 'pending') {
        ops.push(
          sb().from('beats')
            .update({ queue_position: pos, status: 'pending', updated_at: stamp })
            .eq('id', id)
        );
      }
    });

    const queueSet = new Set(ids);
    const removed = (current || []).map(r => r.id).filter(id => !queueSet.has(id));

    // Run position/status updates in parallel chunks.
    for (let i = 0; i < ops.length; i += 25) {
      const results = await Promise.all(ops.slice(i, i + 25));
      for (const r of results) throwIf(r.error, 'Kunne ikke gemme køen');
    }

    // Clear the position for beats that left the queue (batched).
    for (let i = 0; i < removed.length; i += 100) {
      const chunk = removed.slice(i, i + 100);
      const { error } = await sb()
        .from('beats')
        .update({ queue_position: null, updated_at: stamp })
        .in('id', chunk);
      throwIf(error, 'Kunne ikke opdatere køen');
    }
  },

  async publishBeat(id) {
    const { error } = await sb()
      .from('beats')
      .update({ status: 'published', queue_position: null, updated_at: nowIso() })
      .eq('id', id);
    throwIf(error, 'Kunne ikke udgive beat');
  },
};
