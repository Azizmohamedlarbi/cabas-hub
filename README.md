# CABAS HUB — La Marketplace des Micro-Importateurs Algériens

![Cabas Hub](public/Cabas_Hub_logo.png)

## 🌟 À Propos de Cabas Hub
**Cabas Hub** est la première marketplace algérienne dédiée exclusivement aux micro-importateurs (les "cabas"). 
La plateforme connecte des vendeurs certifiés ANAE (Agence Nationale de l'Auto-Entrepreneur) à des acheteurs professionnels (B2B) et des particuliers (B2C), garantissant des transactions transparentes, organisées et sécurisées.

- **Site Web** : [cabashub.dz](https://cabashub.dz)
- **Code Source** : [github.com/Azizmohamedlarbi/cabas-hub](https://github.com/Azizmohamedlarbi/cabas-hub)

---

## ✨ Fonctionnalités Principales

### Pour les Acheteurs (Clients finaux & Commerçants)
- 🔒 **Achats Sécurisés** : Tous les vendeurs "Pro" et "Fondateurs" sont vérifiés manuellement par l'équipe d'administration (Vérification carte ANAE).
- 💰 **Prix de Gros & Détail** : Profitez de prix adaptés avec des commandes en volume (grossistes) ou à l'unité (détail).
- ✈️ **Pré-commandes sur Voyages** : Réservez des produits avant même le retour du vendeur de l'étranger (Chine, Turquie, France, Dubaï, etc.).
- 💬 **Messagerie Intégrée en Temps Réel** : Discutez, négociez et posez des questions directement aux vendeurs.
- 📦 **Commandes Centralisées** : Suivez vos expéditions sur 58 wilayas et gérez votre historique d'achats.

### Pour les Vendeurs (Micro-Importateurs)
- 🏪 **Boutique Numérique Pro** : Exposez vos produits importés avec un catalogue clair (catégories, images multiples, badges).
- 🛫 **Gestion de Voyages** : Annoncez vos prochaines destinations et la capacité de votre valise pour prendre des pré-commandes.
- 💎 **Monétisation & Abonnements** : Accédez au plan `Pro` ou sécurisez votre statut restreint `Early Adopter` pour bénéficier d'avantages à vie (mise en avant SEO, baisse de la commission, statut vérifié).
- 📊 **Dashboard Complet** : Statistiques de vente, gestion des stocks, traitement des commandes et gestion des expéditions.

---

## 🛠 Architecture & Tech Stack
L'architecture de Cabas Hub est moderne, performante, réactive et SEO-friendly.

- **Frontend Core** : Next.js 16 (App Router), React 19, TypeScript
- **Styling & UI** : TailwindCSS v4, Framer Motion (animations fluides), Lucide Icons
- **State Management** : Zustand (avec persistance via localStorage), React Hook Form, Zod
- **Backend & Database** : Supabase (PostgreSQL, Storage pour les images, Authentication, abonnements Realtime pour la messagerie)
- **Déploiement & Hébergement** : Vercel (Frontend CI/CD automatiques)

---

## 🚀 Démarrage Rapide

### Pré-requis
- Node.js (v18+)
- Un compte [Supabase](https://supabase.com/) actif (URL & Anon Key)

### Installation Locale

1. **Cloner le projet**
   ```bash
   git clone https://github.com/Azizmohamedlarbi/cabas-hub.git
   cd cabas-hub/temp-app
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env.local` à la racine de `temp-app` et ajoutez vos clés Supabase :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   Rendez-vous sur [http://localhost:3000](http://localhost:3000) pour voir l'application tourner localement.

---

## 📖 Structure du Projet (`temp-app/`)

```text
├── src/
│   ├── app/                # Routes Next.js (Admin, Dashboard, Produits, Auth, Voyages, Messages)
│   ├── components/         # Composants réutilisables (UI, Layouts, Cards)
│   ├── lib/                # Config Supabase, utilitaires, mocks, db helpers
│   ├── store/              # Stores Zustand (Auth, Panier)
│   └── types/              # Définitions TypeScript
├── public/                 # Assets statiques (Logos, placeholders)
├── docs/                   # Documentation d'analyse et cahier des charges
├── supabase/               # Schémas SQL pour initialiser la DB et RLS policies
├── DEPLOY.md               # Guide détaillé pour le déploiement sur Vercel
└── HOST-NOW.md             # Guide rapide d'hébergement
```

---

## 📦 Déploiement

Le projet est préconfiguré pour un **déploiement CI/CD fluide sur Vercel**.  
Chaque `git push` vers la branche `main` de GitHub déclenche une nouvelle compilation sur Vercel. 

👉 Consultez le guide complet **[DEPLOY.md](./DEPLOY.md)** ou **[HOST-NOW.md](./HOST-NOW.md)** pour toutes les étapes de mise en production et de configuration DNS.

---
*© 2026 CABAS HUB. Tous droits réservés.*
