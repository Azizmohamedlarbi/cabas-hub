# Héberger CABAS HUB (étapes rapides)

## 1. Déployer sur Vercel

1. **Ouvrez** : [vercel.com/new](https://vercel.com/new)  
2. **Connectez-vous** avec GitHub si demandé.  
3. **Import Git Repository** : cherchez et sélectionnez **`Azizmohamedlarbi/cabas-hub`**.  
4. **Configure** :
   - **Root Directory** : laisser vide (tout le repo = projet Next.js).
   - **Framework Preset** : Next.js (détecté automatiquement).
5. **Environment Variables** — cliquez **Add** et ajoutez **avant** de déployer :

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase (Supabase → Settings → API → Project URL) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé **anon public** (Supabase → Settings → API → Project API keys → anon public) |

6. Cliquez **Deploy**. Attendez la fin du build (1–3 min).  
7. **Notez l’URL** du site (ex. `https://cabas-hub.vercel.app` ou `https://cabas-hub-xxx.vercel.app`).

---

## 2. Configurer Supabase (auth)

1. Allez sur [supabase.com](https://supabase.com) → votre projet.  
2. **Authentication** → **URL Configuration**.  
3. Renseignez :
   - **Site URL** : l’URL Vercel de l’étape 1 (ex. `https://cabas-hub.vercel.app`).
   - **Redirect URLs** : ajoutez la même URL (ex. `https://cabas-hub.vercel.app/**`).  
4. **Save**.

Après ça, connexion, inscription et reset mot de passe fonctionneront sur le site en ligne.

---

## 3. Vérifier

- Ouvrir l’URL Vercel : page d’accueil, recherche, catégories.  
- Tester **Connexion** / **Inscription** (après étape 2).  
- Vérifier les pages légales : `/cgu`, `/mentions-legales`, `/politique-confidentialite`.

---

## Mises à jour plus tard

À chaque modification de code :

```bash
git add .
git commit -m "Votre message"
git push
```

Vercel redéploiera automatiquement (si le projet a été importé depuis GitHub).
