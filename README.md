# MatchAfro

Application Vite + React pour MatchAfro, plateforme de reservation beaute afro avec profils professionnels, reservations, tableau de bord, panneau admin, Supabase Database et Supabase Storage.

## Lancer le projet

```bash
npm install
npm run dev
```

Vite affiche l'URL locale, en general `http://localhost:5173`.

## Build production

```bash
npm run build
npm run preview
```

## Configuration

Copier `.env.example` vers `.env.local`, puis remplir :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`
- `VITE_FOUNDER_LIMIT`
- `VITE_ADMIN_PWD`

## Supabase

Executer `supabase-schema.sql` dans le SQL Editor Supabase. Ce schema cree les tables utilisees par l'application et le bucket Storage public `matchafro-photos`.

Le fichier `src/data/supabase-schema.sql` est un ancien brouillon et ne doit pas etre utilise pour la production.

## Structure active

```text
src/
  App.jsx                 # routes React Router
  main.jsx                # entree Vite
  context/AppContext.jsx  # etat app + synchronisation Supabase
  lib/
    db.js                 # acces Supabase Database
    storage.js            # uploads Supabase Storage
    smartTimeEngine.js    # logique Smart Time
  pages/                  # pages routees
  components/             # composants UI
```
