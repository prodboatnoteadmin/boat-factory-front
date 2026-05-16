# Boat Note · Beat Manager

React + Vite frontend for the existing Supabase database
(`artists`, `beats`). Single admin login. Deploys to Netlify.

No tables or columns are created or changed. The app reads/writes the
data already in Supabase.

## 1. Login user — already done

The admin login already exists (email pre-confirmed):
`prodboatnoteadmin@gmail.com`. Change the password anytime in
Supabase → Authentication → Users. The app works as soon as the
keys (step 2) are set.

## 1b. Optional DB lockdown — read the warning

`supabase_setup.sql` turns on Row Level Security so only the admin
email can touch `artists`/`beats`. It creates/drops/alters **nothing**.

> ⚠️ These tables are shared with another production system. If that
> system uses the **anon** key, enabling RLS will break it. Only run
> `supabase_setup.sql` if the other system uses the **service_role**
> key (service_role bypasses RLS). The website does not require this
> to function.

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
