# CABAS HUB — Déploiement

---

## Déjà fait pour vous

- **Git** et **GitHub CLI** (`gh`) installés.
- **Dépôt Git** initialisé dans `temp-app`, tout le code est commité sur la branche `main` (`.env.local` n’est pas commité).

---

## À faire de votre côté (une fois)

### Option A — Déployer tout de suite (sans GitHub)

Dans un terminal, à la racine du projet :

```powershell
cd c:\Users\IT7\cabasHub\temp-app
npx vercel login
```

Ouvrez le lien affiché, connectez-vous à Vercel, puis :

```powershell
npx vercel --prod
```

Répondez aux questions (nom du projet, etc.). À la fin, **ajoutez les variables d’environnement** dans le dashboard Vercel (projet → **Settings** → **Environment Variables**) :

- `NEXT_PUBLIC_SUPABASE_URL` = votre URL Supabase  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = votre clé anon Supabase  

Puis **redeployez** (onglet Deployments → ⋮ sur le dernier → Redeploy) pour que le build prenne en compte les variables.

### Option B — GitHub + Vercel (auto-deploy à chaque push)

**GitHub CLI est installé.** Suivez ces étapes dans l’ordre.

#### Étape 1 — Connexion à GitHub (une seule fois)

Dans un terminal :

```powershell
gh auth login
```

- Choisissez **GitHub.com** → **HTTPS** → **Login with a web browser**.
- Copiez le code affiché, validez, puis dans le navigateur collez le code et autorisez.

#### Étape 2 — Donner les droits « repo » et pousser le code

Le dépôt **cabas-hub** est déjà créé sur votre compte : https://github.com/Azizmohamedlarbi/cabas-hub  

Pour pouvoir pousser, il faut autoriser la permission **repo** (une fois) :

1. Dans un terminal PowerShell, exécutez :
   ```powershell
   cd c:\Users\IT7\cabasHub\temp-app
   gh auth refresh -h github.com -s repo
   ```
2. Une page GitHub va s’ouvrir avec un **code à saisir** (ex. `22E4-79F6`). Entrez ce code sur la page, puis validez en autorisant l’accès **repo**.
3. Une fois l’autorisation faite, poussez le code :
   ```powershell
   git push -u origin main
   ```

**Ou** exécutez le script en une fois (il fait l’étape 1 puis le push) :

```powershell
cd c:\Users\IT7\cabasHub\temp-app
.\push-to-github.ps1
```

Quand le navigateur s’ouvre, entrez le code affiché et autorisez. À la fin, le code sera sur GitHub.

#### Étape 3 — Connecter Vercel au dépôt

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous (avec GitHub si possible).
2. **Add New** → **Project**.
3. Dans la liste, sélectionnez le dépôt **cabas-hub** (ou le nom que vous avez utilisé).
4. **Root Directory** : laissez vide (le repo est déjà le projet Next.js).
5. **Environment Variables** : ajoutez avant de lancer le déploiement :
   - `NEXT_PUBLIC_SUPABASE_URL` = URL de votre projet Supabase  
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = clé anon Supabase (Settings → API dans Supabase)
6. Cliquez sur **Deploy**.

#### Étape 4 — Configurer Supabase

Dans **Supabase** → **Authentication** → **URL Configuration** :
- **Site URL** : l’URL de votre site Vercel (ex. `https://cabas-hub.vercel.app`)
- **Redirect URLs** : ajoutez la même URL

Sauvegardez.

---

**Sans GitHub CLI** (création manuelle du dépôt) : créez un repo vide sur [github.com/new](https://github.com/new) (ex. `cabas-hub`), puis dans `temp-app` :

```powershell
cd c:\Users\IT7\cabasHub\temp-app
git remote add origin https://github.com/VOTRE_UTILISATEUR/cabas-hub.git
git push -u origin main
```

Ensuite, faites les **Étapes 3 et 4** ci-dessus.

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
