import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey || anonKey.includes('PASTE_YOUR')) {
  // Shown in the browser console + a friendly screen (see main.jsx)
  console.error(
    'Supabase is not configured. Set VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY (Supabase Dashboard → Project Settings → API).'
  );
}

export const supabaseConfigured = Boolean(
  url && anonKey && !String(anonKey).includes('PASTE_YOUR')
);

export const supabase = createClient(url || 'http://localhost', anonKey || 'public-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'boatnote-beat-manager-auth',
  },
});
