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
    const { error } = await sb().from('beats').insert(row);
    throwIf(error, 'Kunne ikke oprette beat');
    return id;
  },

  async updateBeat(id, form) {
    const { error } = await sb().from('beats').update(beatFormToRow(form)).eq('id', id);
    throwIf(error, 'Kunne ikke gemme beat');
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
    const { error } = await sb().from('artists').update(artistFormToRow(form)).eq('id', id);
    throwIf(error, 'Kunne ikke gemme artist');
  },

  async updateArtistKeywords(id, keywords) {
    const { error } = await sb()
      .from('artists')
      .update({ youtube_keywords: keywords || null })
      .eq('id', id);
    throwIf(error, 'Kunne ikke gemme YouTube keywords');
  },

  // Persist the publish queue: queueIds in order, pendingIds get no position.
  async persistQueue(queueIds, pendingIds) {
    const updates = [];
    queueIds.forEach((id, i) => updates.push({ id, queue_position: i + 1 }));
    (pendingIds || []).forEach((id) => updates.push({ id, queue_position: null }));
    for (const u of updates) {
      const { error } = await sb()
        .from('beats')
        .update({ queue_position: u.queue_position, updated_at: nowIso() })
        .eq('id', u.id);
      throwIf(error, 'Kunne ikke gemme køen');
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
