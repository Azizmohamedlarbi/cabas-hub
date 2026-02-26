# CABAS HUB — Déploiement

---

## Mises à jour (à chaque fois)

Une fois le projet connecté à Vercel, **chaque push sur la branche connectée déclenche un déploiement automatique**. Pas de re-configuration, pas d’upload manuel.

```bash
git add .
git commit -m "Description de la modification"
git push
```

Vercel rebuild et met le site en ligne en quelques minutes. C’est tout.

---

## Première fois uniquement

À faire une seule fois : dépôt Git + projet Vercel + variables d’environnement.

### 1. Créer le dépôt et pousser le code

À la racine du projet (dossier `temp-app`) :

```bash
cd temp-app
git init
git add .
git commit -m "Initial commit - CABAS HUB"
git branch -M main
git remote add origin https://github.com/VOTRE_UTILISATEUR/cabas-hub.git
git push -u origin main
```

Ne pas commiter `.env.local` (déjà dans `.gitignore`). Les secrets seront ajoutés sur Vercel.

### 2. Créer le projet sur Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. **Import** le dépôt GitHub (autoriser Vercel si demandé).
3. **Root Directory** : si le repo = uniquement le code de `temp-app`, laisser vide. Si le repo = `cabasHub` avec un sous-dossier `temp-app`, mettre **temp-app**.
4. **Environment Variables** (avant de déployer) :

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (Settings → API) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé **anon public** Supabase |

5. **Deploy**. À la fin, noter l’URL (ex. `https://cabas-hub.vercel.app`).

### 3. Configurer Supabase

Dans Supabase : **Authentication** → **URL Configuration**  
- **Site URL** : l’URL Vercel du site  
- **Redirect URLs** : ajouter la même URL (pour connexion / inscription / reset mot de passe)

Sauvegarder.

### 4. Vérifier

Ouvrir l’URL Vercel, tester la home, la recherche, la connexion et les pages légales (`/cgu`, `/mentions-legales`, `/politique-confidentialite`).

---

## Résumé

| Quand | Action |
|-------|--------|
| **Première fois** | Git init + push → Vercel : import repo, env vars, Deploy → Supabase : Site URL + Redirect URLs |
| **Chaque mise à jour** | `git add .` → `git commit -m "..."` → `git push` (Vercel déploie automatiquement) |

Domaine perso : **Vercel** → projet → **Settings** → **Domains** (Vercel indique les DNS à configurer).
