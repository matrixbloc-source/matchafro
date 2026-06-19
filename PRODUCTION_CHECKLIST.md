# MatchAfro V4 — Checklist de Production

## ✅ BUGS CORRIGÉS (cette session)

- [x] `DEMO_REVIEWS` : champs unifiés (`author`, `comment`, `createdAt`) — cohérence avec ProProfilePage
- [x] `addReview()` : stocke `createdAt` au lieu de `date`
- [x] `DashboardPage` : `b.cancelled` → `b.status === 'cancelled'`
- [x] `BecomeProPage` : filtre groupe pays (`'France'`, `'Outre-mer'`, `'Afrique'`) — case-sensitivity
- [x] `SearchEngine` : connecté à AppContext pros (+ fallback MOCK_PROS pour démo)
- [x] `SearchEngine` : cartes cliquables → navigation vers `/pro/:slug`
- [x] `Footer` : lien "Devenir professionnel" → `/devenir-professionnel` (Link interne)
- [x] `Footer` : ancres href corrigées (`/#recherche`, `/#categories`, etc.)
- [x] `AppContext` : `currentPro` résolu comme objet complet (sync updatePro)
- [x] `AppContext` : `isAdmin` exposé, `avgRating` retourne `0` au lieu de `null`
- [x] `DashboardPage` : sidebar responsive mobile (hamburger menu)
- [x] `index.html` : meta OG, Twitter Card, SEO complet, Inter weight 800/900
- [x] `vercel.json` : SPA rewrites + cache headers assets + sécurité headers
- [x] `.env.example` : template variables Supabase
- [x] `src/lib/supabase.js` : client Supabase lazy-init (fallback localStorage)

---

## 🔴 AVANT MISE EN PRODUCTION (obligatoire)

### Infrastructure
- [ ] Créer compte Vercel — connecter repo GitHub
- [ ] Créer projet Supabase — copier URL + anon key dans `.env.local`
- [ ] Exécuter `supabase-schema.sql` dans Supabase SQL Editor
- [ ] Activer Supabase Auth (email + Google OAuth)
- [ ] Vérifier Supabase Storage bucket `matchafro-photos` (créé par `supabase-schema.sql`)
- [ ] Mettre en production : `vercel --prod` ou push sur main

### Sécurité
- [ ] Changer le mot de passe admin `'matchafro2025'` → variable d'env `VITE_ADMIN_PWD`
- [ ] Activer RLS sur toutes les tables Supabase (déjà dans le schema)
- [ ] Vérifier les policies RLS avec des tests manuels
- [ ] Ajouter `VITE_ADMIN_PWD` dans les variables Vercel

### Contenu
- [ ] Créer vraie image OG (`public/og-image.jpg`, 1200×630px)
- [ ] Créer favicon (`public/favicon.ico` + `public/favicon.svg`)
- [ ] Remplacer `href="#"` des réseaux sociaux dans Footer par les vrais profils
- [ ] Remplacer `href="#"` des liens CGU / Confidentialité par les vraies pages
- [ ] Ajouter vrai domaine dans `og:url` et `canonical`

---

## 🟡 AMÉLIORATIONS RECOMMANDÉES (avant premier utilisateur réel)

### Uploads photos (BecomeProPage)
- [x] Intégrer Supabase Storage pour l'upload fichier
- [x] Valider le format et taille (max 10MB, JPEG/PNG/WebP/GIF/AVIF)
- [ ] Générer miniatures via Supabase Image Transformations

### Paiement / Monétisation
- [ ] Intégrer Stripe pour la future offre Premium payante
- [ ] Webhook Stripe → mise à jour `subscriptions` table

### Email transactionnel
- [ ] Branchement Resend ou SendGrid pour :
  - Confirmation de réservation (client + pro)
  - Rappel 24h avant RDV
  - Bienvenue nouveau pro

### SEO dynamique
- [ ] Ajouter `react-helmet-async` pour meta title/description par page
- [ ] Générer sitemap.xml dynamique (pages pros)
- [ ] Schema.org `LocalBusiness` JSON-LD sur ProProfilePage

### Performance
- [ ] Code splitting par route (`lazy` + `Suspense`)
- [ ] Optimiser images Unsplash → utiliser paramètres `?w=400&q=80`
- [ ] Ajouter skeleton loaders pendant le chargement

---

## 🟢 FONCTIONNALITÉS OPÉRATIONNELLES (prêtes à tester)

| Fonctionnalité | Route | État |
|---|---|---|
| Page d'accueil animée | `/` | ✅ |
| Moteur de recherche avec filtres | `/#recherche` | ✅ |
| Localisation (France + DOM-TOM + Afrique) | — | ✅ |
| Inscription professionnel (5 étapes) | `/devenir-professionnel` | ✅ |
| Profil public pro | `/pro/:slug` | ✅ |
| Calendrier de réservation | dans `/pro/:slug` | ✅ |
| Tableau de bord pro | `/dashboard` | ✅ |
| Gestion disponibilités | `/dashboard` → Disponibilités | ✅ |
| Panneau admin | `/admin` | ✅ |
| Système fondateurs (50 places) | auto à l'inscription | ✅ |
| Avis clients | dans `/pro/:slug` | ✅ |
| Persistance localStorage | — | ✅ |
| Navigation mobile responsive | — | ✅ |

---

## 🚀 DÉPLOIEMENT VERCEL (step by step)

```bash
# 1. Initialiser git (si pas encore fait)
git init
git add .
git commit -m "MatchAfro V4 — production ready"

# 2. Créer repo GitHub et pousser
git remote add origin https://github.com/VOTRE_USER/matchafro.git
git push -u origin main

# 3. Sur vercel.com
# → "New Project" → importer le repo GitHub
# → Framework: Vite (auto-détecté)
# → Ajouter les variables d'environnement :
#     VITE_SUPABASE_URL = ...
#     VITE_SUPABASE_ANON_KEY = ...
# → Deploy

# 4. Domaine custom
# → Settings → Domains → ajouter matchafro.fr
```

---

## 🔌 CONNEXION SUPABASE (step by step)

```bash
# 1. Installer le SDK
npm install @supabase/supabase-js

# 2. Créer .env.local
cp .env.example .env.local
# Remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# 3. Exécuter le schéma SQL
# → Supabase Dashboard → SQL Editor → Coller supabase-schema.sql → Run

# 4. Verifier dans la console que l'hydratation Supabase se termine sans erreur
```

---

## 📊 SCORES ESTIMÉS LIGHTHOUSE (build prod actuel)

| Métrique | Score estimé |
|---|---|
| Performance | 75-85 (bundle 444KB non splitté) |
| Accessibilité | 70-80 (à améliorer : contrastes, aria) |
| Bonnes pratiques | 90+ |
| SEO | 90+ (meta complètes, lang=fr) |

**Principal facteur de baisse performance : bundle JS de 444KB (131KB gzippé)**  
→ Fix : code splitting avec `React.lazy()` sur chaque page

---

*Généré le 17/06/2026 — MatchAfro V4*
