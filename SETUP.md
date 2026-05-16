# Boat Note · Beat Manager

React + Vite frontend for the existing Supabase database
(`artists`, `beats`). Single admin login. Deploys to Netlify.

No tables or columns are created or changed. The app reads/writes the
data already in Supabase.

## 1. Supabase — security (one time)

1. Open `supabase_setup.sql`, set `admin_email` to the email you will
   log in with.
2. Supabase Dashboard → SQL Editor → paste it → Run.
   (Turns on Row Level Security so only that admin email has access.
   Non-destructive: no data is touched.)
3. Supabase Dashboard → Authentication → Users → **Add user**:
   same email + a password, tick **Auto Confirm User**.

## 2. Get the keys

Supabase Dashboard → Project Settings → API:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon / public** key → `VITE_SUPABASE_ANON_KEY`

> Use the **anon/public** key only. Never put the `service_role`
> key in the frontend.

## 3. Run locally

```bash
cp .env.example .env.local      # then paste the URL + anon key
npm install
npm run dev
```

## 4. Deploy to Netlify

- New site from this Git repo (build settings come from `netlify.toml`:
  build `npm run build`, publish `dist`).
- Site settings → Environment variables → add
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Deploy. Log in with the admin user from step 1.

## Notes

- There is no `jobs` table in the database, so the per-beat
  "publishing history" is empty by design; a beat's YouTube link
  still drives its embed/indicator.
- Creating/editing beats & artists and reordering the queue write
  straight to Supabase.
