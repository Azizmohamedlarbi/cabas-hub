# CABAS HUB

Marketplace B2B/B2C pour micro-importateurs algériens. Next.js, Supabase, déploiement Vercel.

- **Site** : [cabashub.dz](https://cabashub.dz) (après déploiement)
- **Repo** : [github.com/Azizmohamedlarbi/cabas-hub](https://github.com/Azizmohamedlarbi/cabas-hub)

---

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Variables d’environnement : créer `.env.local` avec `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## Structure du dépôt

```
├── src/                    # Application Next.js (App Router)
│   ├── app/                # Pages et layouts
│   ├── components/         # Composants réutilisables
│   └── lib/                # DB, auth, messages, etc.
├── content/                # Contenu markdown (CGU, mentions légales, confidentialité)
├── public/                 # Assets statiques
├── docs/                   # Documentation projet
│   ├── CABAS_HUB_CAHIER_DES_CHARGES.md
│   └── PROJECT_ANALYSIS.md
├── supabase/               # Scripts SQL Supabase
│   ├── schema/             # Schéma principal, monétisation, photos, pré-commandes
│   └── messaging/          # Migrations messagerie
├── DEPLOY.md               # Guide de déploiement (Vercel, GitHub, Supabase)
└── push-to-github.ps1      # Script pour pousser vers GitHub (PowerShell)
```

---

## Déploiement

Voir **[DEPLOY.md](./DEPLOY.md)** pour :

- Déploiement direct (Vercel CLI) ou via GitHub + Vercel
- Variables d’environnement et configuration Supabase

---

## Stack

- **Next.js** (App Router), **React**, **TypeScript**
- **Supabase** (auth, DB, realtime)
- **Zustand** (état client), **Tailwind**, **Framer Motion**
