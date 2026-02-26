# 📋 CABAS HUB - CAHIER DES CHARGES EXHAUSTIF
## Document Technique Complet pour Développement AI

**Version** : 1.0 MVP  
**Date** : 13 Février 2026  
**Projet** : Marketplace B2B/B2C pour Micro-Importateurs Algériens

---

## 🎯 RÉSUMÉ EXÉCUTIF

**Problème** : Les micro-importateurs algériens (carte ANAE 080100) n'ont pas de plateforme dédiée pour vendre leurs produits et trouver des acheteurs.

**Solution** : CABAS HUB - Une marketplace qui connecte micro-importateurs avec acheteurs B2B et B2C, avec paiement sécurisé, vérification identité, messagerie, et calendrier voyages.

**Objectif MVP** : 
- 50 vendeurs actifs
- 100 transactions en 3 mois  
- 5M DA de GMV
- Temps de développement : 3-4 mois

---

## 📚 TABLE DES MATIÈRES

1. [CONTEXTE & VISION](#1-contexte-vision)
2. [UTILISATEURS CIBLES](#2-utilisateurs-cibles)
3. [FONCTIONNALITÉS MVP](#3-fonctionnalités-mvp)
4. [ARCHITECTURE TECHNIQUE](#4-architecture-technique)
5. [BASE DE DONNÉES](#5-base-de-données)
6. [API ENDPOINTS](#6-api-endpoints)
7. [INTERFACE UTILISATEUR](#7-interface-utilisateur)
8. [SÉCURITÉ](#8-sécurité)
9. [PAIEMENTS](#9-paiements)
10. [NOTIFICATIONS](#10-notifications)
11. [TESTS](#11-tests)
12. [DÉPLOIEMENT](#12-déploiement)

---

## 1. CONTEXTE & VISION

### Le Statut Auto-Entrepreneur en Algérie

**Réglementation** :
- Loi n° 22-23 (Décembre 2022)
- Décret 25-170 (Juin 2025) pour micro-importation
- Géré par l'ANAE (Agence Nationale de l'Auto-Entrepreneur)
- Site : www.anae.dz

**Avantages** :
- Fiscalité : 0,5% du CA (IFU)
- Plafond CA : 5M DA/an
- Pas de local commercial requis
- Inscription 100% en ligne

**Micro-Importation (Code 080100)** :
- Plafond : 1,8M DA par voyage
- Maximum : 2 voyages/mois
- Droits douane : 5%
- Taxe unique : 0,5%
- Compte devises obligatoire (BEA)

### Opportunité Marché

**Chiffres** :
- ~42 000 auto-entrepreneurs inscrits (2025)
- Objectif gouvernement : 500 000
- Croissance e-commerce Algérie : +35%/an
- Marché import informel : ~2 milliards €/an

**Pain Points Actuels** :
1. Manque de visibilité (vente via WhatsApp/Facebook)
2. Absence de confiance (pas de vérification)
3. Paiements non sécurisés
4. Gestion manuelle chronophage
5. Pas de réseau professionnel

---

## 2. UTILISATEURS CIBLES

### Persona 1 : Karim - Micro-Importateur

**Démographie** :
- Âge : 28 ans
- Localisation : Alger
- Statut : Auto-entrepreneur ANAE
- Revenus : 200-500k DA/mois

**Comportement** :
- 2 voyages/mois en Turquie
- Importe : électronique, textile, cosmétiques
- Vend : 60% B2B, 40% B2C
- Utilise : Facebook, Instagram, WhatsApp

**Objectifs** :
- Trouver plus de clients pros
- Sécuriser paiements
- Gagner du temps
- Professionnaliser image

### Persona 2 : Salima - Commerçante B2B

**Démographie** :
- Âge : 35 ans
- Localisation : Oran
- Statut : Propriétaire boutique
- Budget : 100-300k DA/mois

**Besoins** :
- Fournisseurs fiables vérifiés
- Comparer prix facilement
- Commander en ligne
- Économiser temps/argent

### Persona 3 : Amine - Particulier B2C

**Démographie** :
- Âge : 24 ans
- Revenus : 60k DA/mois
- Profil : Employé tech-savvy

**Besoins** :
- Produits authentiques bon prix
- Avis clients vérifiés
- Paiement sécurisé
- Livraison rapide

---

## 3. FONCTIONNALITÉS MVP

### Module 1 : Authentification

**Inscription Vendeur** :
```
Champs requis :
- Prénom, Nom
- Email (unique)
- Téléphone +213XXXXXXXXX (unique)
- Password (min 8 car, 1 maj, 1 min, 1 chiffre)
- Adresse complète (rue, ville, wilaya, code postal)
- Numéro carte ANAE (format: XXXX-XXXX-XXXX)
- Photo carte ANAE (JPG/PNG, max 5MB)
- Spécialités produits (multi-select)
- Pays d'importation (multi-select)
- Acceptation CGU + Politique confidentialité

Process :
1. Validation frontend (React Hook Form + Zod)
2. POST /api/v1/auth/register
3. Hash password (bcrypt)
4. Upload carte ANAE → S3
5. Créer user (status: pending_verification)
6. Envoi email vérification
7. Envoi SMS OTP
8. Vérification manuelle carte par admin
```

**Inscription Acheteur** :
```
Champs requis :
- Prénom, Nom, Email, Phone, Password
- Adresse
- Type : B2B ou B2C
- Si B2B : Nom entreprise, NIF (optionnel)

Process : Similaire vendeur sans vérification ANAE
```

**Connexion** :
```
Input : Email ou Téléphone + Password
Output : 
- Access Token JWT (exp: 1h)
- Refresh Token (exp: 7j, HttpOnly cookie)
- User data
```

**Vérifications** :
- Email : Lien avec JWT (exp 24h)
- Téléphone : Code OTP 6 chiffres (Redis, TTL 5min)
- ANAE : Manuelle par admin (Phase 1), API auto (Phase 2)

---

### Module 2 : Produits

**Créer Produit** :
```
Endpoint : POST /api/v1/products
Auth : Bearer Token (vendeur vérifié)

Payload :
{
  title: string (10-200 car),
  description: string (50-5000 car),
  category_id: int,
  subcategory_id: int,
  price_wholesale: decimal,
  price_retail: decimal,
  quantity: int,
  min_order_quantity: int (défaut: 1),
  origin_country: string,
  origin_city: string,
  images: [url1, url2, ...] (1-10 images),
  specifications: {
    brand, model, colors[], sizes[], ...
  },
  wholesale_only: bool,
  retail_only: bool,
  negotiable: bool,
  pre_order: bool,
  shipping_included: bool,
  shipping_cost: decimal,
  wilaya_coverage: [string],
  delivery_time: string,
  tags: [string] (max 10),
  status: "draft" | "active"
}

Validation :
- Prix retail >= wholesale
- Si shipping_included=false → shipping_cost requis
- Images : upload séparé via POST /api/v1/upload/product-images
- Génération slug SEO auto
- Index full-text search (PostgreSQL tsvector)
```

**Lister Produits** :
```
Endpoint : GET /api/v1/products
Query Params :
- page, limit (pagination)
- category_id, subcategory_id
- price_min, price_max
- wilaya, origin_country
- wholesale_only, retail_only, in_stock
- sort: newest|price_asc|price_desc|popular|rating
- q: recherche full-text

Response : {products[], pagination{}}
```

**Recherche Full-Text** :
```
PostgreSQL tsvector :
- Index sur title + description + tags
- Langue : french
- Endpoint : GET /api/v1/search?q=airpods
- Auto-complétion : GET /api/v1/search/suggest?q=air
```

**Upload Images** :
```
Endpoint : POST /api/v1/upload/product-images
Input : multipart/form-data, 1-10 images
Process :
1. Validation (JPG/PNG/WEBP, < 5MB)
2. Compression côté client (max 1200px)
3. Upload S3 : cabashub-products/
4. Génération variants :
   - original: 1200x1200
   - large: 800x800
   - medium: 400x400
   - thumb: 150x150
5. Return URLs
```

---

### Module 3 : Commandes

**Créer Commande** :
```
Endpoint : POST /api/v1/orders
Auth : Bearer Token (acheteur)

Payload :
{
  items: [
    {product_id, quantity, price_type: "wholesale|retail"}
  ],
  shipping_address: {street, city, wilaya, postal_code, phone},
  notes: string,
  payment_method: "cib" | "cash_on_delivery"
}

Process :
1. Valider stock disponible
2. Calculer totaux :
   - Subtotal items
   - Frais livraison (par vendeur)
   - Total
3. Créer order (status: pending)
4. Décrémenter stock (réservation)
5. Si CIB :
   - Créer escrow transaction
   - Générer lien paiement Satim
   - Return payment_url
6. Notifier vendeur(s)
```

**Statuts Commande** :
```
pending → paid → confirmed → preparing → shipped → 
in_transit → delivered → completed

Ou : cancelled, refunded, disputed
```

**Système Escrow** :
```
Concept : Argent bloqué jusqu'à livraison confirmée

Table escrow_transactions :
- order_id
- amount
- status: held | released | refunded
- payment_reference (Satim)
- held_at, released_at

Cycle :
1. Paiement → Escrow (status: held)
2. Livraison → Timer 48h
3. Si OK → Escrow released → Fonds au vendeur
4. Si litige → Investigation manuelle
```

---

### Module 4 : Messages (Chat)

**Architecture** :
```
Techno : WebSocket (Socket.IO)
Backend : Python Socket.IO ou FastAPI WebSocket

Events :
- send_message
- user_typing
- mark_read
- new_message (receive)
```

**Créer Conversation** :
```
Endpoint : POST /api/v1/conversations
Payload : {recipient_id, product_id}

Si existe déjà : Return existing
Sinon : Créer nouvelle
```

**Envoyer Message** :
```
WebSocket Event : send_message
Payload : {conversation_id, message, attachments[]}

Process :
1. Sauvegarder en DB
2. Broadcast au recipient si online
3. Push notification si offline
4. Update conversation.last_message_at
```

---

### Module 5 : Avis (Reviews)

**Laisser Avis** :
```
Endpoint : POST /api/v1/reviews
Auth : Acheteur (order delivered)

Payload :
{
  order_id,
  product_id,
  rating: 1-5,
  comment: string (10-1000 car),
  images: [url] (max 5)
}

Validation :
- Order status = delivered ou completed
- Buyer = current_user
- Pas déjà d'avis pour ce product+order

Process :
1. Créer review
2. Recalculer product.rating_average
3. Recalculer seller.rating_average
4. Notifier vendeur
```

**Répondre à Avis** :
```
Endpoint : POST /api/v1/reviews/{id}/reply
Auth : Vendeur (propriétaire)

Payload : {reply: string}
```

---

### Module 6 : Calendrier Voyages

**Créer Voyage** :
```
Endpoint : POST /api/v1/trips
Auth : Vendeur

Payload :
{
  destination_country,
  destination_city,
  departure_date,
  return_date,
  budget_available: max 1800000 DA,
  accept_pre_orders: bool,
  notes
}

Validation :
- return_date > departure_date
- departure_date > aujourd'hui
- budget <= 1.8M DA
```

**Pré-Commander** :
```
Endpoint : POST /api/v1/trips/{id}/pre-orders
Auth : Acheteur

Payload :
{
  product_request: string,
  quantity,
  target_price,
  notes
}

Process :
1. Créer pre_order (status: pending)
2. Notifier vendeur
3. Vendeur peut : accepter, négocier, refuser
```

---

### Module 7 : Profil & Favoris

**Modifier Profil** :
```
Endpoint : PUT /api/v1/users/me
Payload : {first_name, bio, phone, address, ...}
```

**Changer Avatar** :
```
Endpoint : POST /api/v1/users/me/avatar
Input : Image file
Output : S3 URL (variants 200x200, 100x100, 50x50)
```

**Favoris** :
```
POST /api/v1/favorites {product_id}
GET /api/v1/favorites
DELETE /api/v1/favorites/{product_id}
```

---

## 4. ARCHITECTURE TECHNIQUE

### Stack Recommandé

**Frontend** :
```
Framework : Next.js 14+ (React, TypeScript)
Styling : Tailwind CSS
UI Components : shadcn/ui (Radix UI)
State : Zustand
Forms : React Hook Form + Zod
Hosting : Vercel
```

**Backend** :
```
Framework : FastAPI (Python 3.11+)
ORM : SQLAlchemy
Validation : Pydantic
Tasks Async : Celery + Redis
WebSocket : Socket.IO ou FastAPI native
Hosting : Railway.app, Render, ou Fly.io
```

**Base de Données** :
```
Principal : PostgreSQL 15+
Cache : Redis
File Storage : AWS S3 ou DigitalOcean Spaces
CDN : Cloudflare
```

**Paiements** :
```
Gateway : Satim (CIB - Carte Interbancaire)
Future : PayPal (diaspora)
```

### Architecture Système

```
[Navigateur] 
    ↓ HTTPS
[Cloudflare CDN]
    ↓
    ├→ [Vercel - Next.js Frontend]
    └→ [Railway - FastAPI Backend]
         ↓
         ├→ [PostgreSQL]
         ├→ [Redis]
         └→ [S3 Storage]
```

---

## 5. BASE DE DONNÉES

### Schéma PostgreSQL

**Table : users**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_type VARCHAR(10) CHECK (user_type IN ('seller', 'buyer')),
    
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_wilaya VARCHAR(100),
    address_postal_code VARCHAR(10),
    
    business_name VARCHAR(200),
    specialties TEXT[],
    import_countries TEXT[],
    
    anae_card_number VARCHAR(20),
    anae_card_photo_url VARCHAR(500),
    anae_verified BOOLEAN DEFAULT false,
    
    buyer_type VARCHAR(10) CHECK (buyer_type IN ('b2b', 'b2c')),
    
    profile_photo_url VARCHAR(500),
    cover_photo_url VARCHAR(500),
    bio TEXT,
    
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    
    status VARCHAR(20) DEFAULT 'active',
    
    total_sales INT DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```

**Table : products**
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category_id INT REFERENCES categories(id),
    subcategory_id INT REFERENCES categories(id),
    
    price_wholesale DECIMAL(12,2) NOT NULL,
    price_retail DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'DZD',
    
    quantity INT NOT NULL DEFAULT 0,
    min_order_quantity INT DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'pièce',
    
    origin_country VARCHAR(100) NOT NULL,
    origin_city VARCHAR(100),
    
    images JSONB NOT NULL,
    specifications JSONB,
    
    wholesale_only BOOLEAN DEFAULT false,
    retail_only BOOLEAN DEFAULT false,
    negotiable BOOLEAN DEFAULT false,
    pre_order BOOLEAN DEFAULT false,
    
    shipping_included BOOLEAN DEFAULT false,
    shipping_cost DECIMAL(10,2),
    wilaya_coverage TEXT[],
    delivery_time VARCHAR(100),
    
    tags TEXT[],
    search_vector tsvector,
    
    status VARCHAR(20) DEFAULT 'active',
    
    views INT DEFAULT 0,
    favorites_count INT DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_products_search ON products USING gin(search_vector);
```

**Table : orders**
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES users(id),
    
    status VARCHAR(20) DEFAULT 'pending',
    
    shipping_address JSONB NOT NULL,
    
    subtotal DECIMAL(12,2) NOT NULL,
    shipping_total DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    
    payment_method VARCHAR(20),
    payment_status VARCHAR(20),
    payment_reference VARCHAR(100),
    
    buyer_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP,
    delivered_at TIMESTAMP,
    completed_at TIMESTAMP
);
```

**Table : order_items**
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    seller_id UUID REFERENCES users(id),
    
    product_title VARCHAR(200) NOT NULL,
    product_image VARCHAR(500),
    
    quantity INT NOT NULL,
    price_unit DECIMAL(12,2) NOT NULL,
    price_type VARCHAR(20),
    price_total DECIMAL(12,2) NOT NULL,
    
    shipping_cost DECIMAL(10,2),
    tracking_number VARCHAR(100)
);
```

**Tables Additionnelles** :
- categories
- conversations
- messages
- reviews
- trips
- trip_pre_orders
- favorites
- notifications
- escrow_transactions

---

## 6. API ENDPOINTS

### Auth
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/verify-email?token=
POST   /api/v1/auth/verify-phone
```

### Users
```
GET    /api/v1/users/me
PUT    /api/v1/users/me
POST   /api/v1/users/me/avatar
GET    /api/v1/sellers/{id}
```

### Products
```
POST   /api/v1/products
GET    /api/v1/products
GET    /api/v1/products/{id}
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}
GET    /api/v1/search?q=
POST   /api/v1/upload/product-images
```

### Orders
```
POST   /api/v1/orders
GET    /api/v1/orders/buyer/me
GET    /api/v1/orders/seller/me
GET    /api/v1/orders/{id}
POST   /api/v1/orders/{id}/confirm
POST   /api/v1/orders/{id}/ship
POST   /api/v1/orders/{id}/cancel
```

### Messages
```
POST   /api/v1/conversations
GET    /api/v1/conversations
GET    /api/v1/conversations/{id}/messages
POST   /api/v1/messages
WS     /ws/chat
```

### Reviews
```
POST   /api/v1/reviews
GET    /api/v1/reviews?product_id=
POST   /api/v1/reviews/{id}/reply
POST   /api/v1/reviews/{id}/helpful
```

### Trips
```
POST   /api/v1/trips
GET    /api/v1/trips
GET    /api/v1/trips/{id}
POST   /api/v1/trips/{id}/pre-orders
```

### Favorites
```
POST   /api/v1/favorites
GET    /api/v1/favorites
DELETE /api/v1/favorites/{product_id}
```

---

## 7. INTERFACE UTILISATEUR

### Design System

**Couleurs** :
```css
Primary (Vert) : #22c55e
Secondary (Bleu) : #3b82f6
Accent (Orange) : #f97316
Error : #ef4444
Success : #22c55e
```

**Typographie** :
```css
Font Family : 'Inter', sans-serif
Font Arabic : 'Cairo', sans-serif
Sizes : 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px
```

### Pages Principales

1. **Homepage** : Hero + Recherche + Catégories + Nouveautés + Vendeurs + Voyages
2. **Liste Produits** : Filtres + Grille produits + Pagination
3. **Détail Produit** : Carousel images + Infos + Vendeur + Avis
4. **Profil Vendeur** : Cover + Stats + Produits + Avis + Voyages
5. **Dashboard Vendeur** : Stats + Commandes + Produits + Messages + Voyages
6. **Dashboard Acheteur** : Commandes + Favoris + Messages
7. **Checkout** : Panier + Adresse + Paiement
8. **Chat** : Liste conversations + Messages real-time

---

## 8. SÉCURITÉ

### Authentication
```
- JWT Access Token (1h expiration)
- Refresh Token HttpOnly cookie (7j)
- Password : bcrypt hash (cost factor 12)
- Rate limiting : 5 login attempts / 15min
```

### API Security
```
- HTTPS obligatoire
- CORS configuré (whitelist domains)
- CSRF tokens
- XSS protection (sanitize inputs)
- SQL Injection prevention (parameterized queries)
- Rate limiting : 100 req/min par IP
```

### Data Protection
```
- Encryption at rest (S3, PostgreSQL)
- Encryption in transit (TLS 1.3)
- PII data minimization
- GDPR-compliant (droit à l'oubli)
- Logs anonymized
```

---

## 9. PAIEMENTS

### Intégration Satim (CIB)

**Flow** :
```
1. User clique "Payer par CIB"
2. Backend → POST Satim API (créer transaction)
3. Satim return payment_url
4. Redirect user → Satim page
5. User entre carte bancaire
6. Satim process paiement
7. Callback → /api/v1/payments/callback
8. Vérifier signature Satim
9. Update order → status: paid
10. Créer escrow transaction
11. Notifier vendeur + acheteur
```

**Sandbox Testing** :
```
URL : https://test.satim.dz
Test Card : 9999 9999 9999 9999
CVV : 123
Exp : 12/25
```

---

## 10. NOTIFICATIONS

### Canaux
```
- In-app (cloche)
- Email (SendGrid ou Brevo)
- SMS (Twilio ou Vonage)
```

### Types
```
- new_order
- order_confirmed
- order_shipped
- order_delivered
- new_message
- new_review
- pre_order_accepted
- low_stock
- payment_received
```

---

## 11. TESTS

### Tests Unitaires
```
Backend : pytest
Coverage : > 80%
Tests : CRUD operations, validations, business logic
```

### Tests Intégration
```
API endpoints
Database transactions
Third-party integrations (Satim, S3)
```

### Tests E2E
```
Tool : Playwright ou Cypress
Scenarios :
- Register → Login → Create Product
- Browse → Add to Cart → Checkout → Pay
- Send Message → Receive Reply
```

---

## 12. DÉPLOIEMENT

### Environnements
```
Development : Local
Staging : staging.cabashub.dz
Production : www.cabashub.dz
```

### CI/CD
```
Git : GitHub
CI/CD : GitHub Actions
Pipeline :
1. Push code
2. Run tests
3. Build Docker image
4. Deploy to staging (auto)
5. Deploy to prod (manual approval)
```

### Monitoring
```
Errors : Sentry
Analytics : Google Analytics + Mixpanel
Uptime : UptimeRobot
Logs : Better Stack (Logtail)
```

---

## 📝 CHECKLIST DÉVELOPPEMENT MVP

### Phase 1 : Setup (Semaine 1-2)
- [ ] Init repo GitHub
- [ ] Setup Next.js project
- [ ] Setup FastAPI project
- [ ] Setup PostgreSQL + Redis
- [ ] Setup S3 bucket
- [ ] Configure Vercel + Railway
- [ ] Design system Figma

### Phase 2 : Auth (Semaine 3-4)
- [ ] Register seller
- [ ] Register buyer
- [ ] Login / Logout
- [ ] Email verification
- [ ] Phone OTP
- [ ] Password reset
- [ ] JWT tokens

### Phase 3 : Products (Semaine 5-7)
- [ ] Create product
- [ ] List products (filters, sort, pagination)
- [ ] Product detail
- [ ] Edit / Delete product
- [ ] Upload images
- [ ] Search full-text
- [ ] Categories

### Phase 4 : Orders (Semaine 8-10)
- [ ] Create order
- [ ] List orders (buyer/seller)
- [ ] Order detail
- [ ] Confirm order (seller)
- [ ] Ship order
- [ ] Cancel order
- [ ] Escrow system

### Phase 5 : Chat (Semaine 11)
- [ ] WebSocket setup
- [ ] Create conversation
- [ ] Send message
- [ ] Real-time updates
- [ ] Notifications

### Phase 6 : Reviews (Semaine 12)
- [ ] Leave review
- [ ] List reviews
- [ ] Reply to review
- [ ] Helpful votes

### Phase 7 : Trips (Semaine 13)
- [ ] Create trip
- [ ] List trips
- [ ] Pre-orders

### Phase 8 : Paiements (Semaine 14-15)
- [ ] Satim integration
- [ ] Escrow logic
- [ ] Payment callbacks
- [ ] Refunds

### Phase 9 : Polish (Semaine 16)
- [ ] Notifications email/SMS
- [ ] Admin dashboard (basic)
- [ ] Tests E2E
- [ ] Performance optimization
- [ ] SEO metadata
- [ ] Docs API

---

## 🚀 LANCEMENT

### Pre-Launch
```
1. Beta test avec 10 vendeurs
2. Collect feedback
3. Fix bugs critiques
4. Prepare marketing (landing page, social media)
5. Contact ANAE pour partenariat
```

### Launch
```
1. Announce sur Facebook/LinkedIn
2. Email aux beta users
3. Outreach marchés physiques (El Hamiz)
4. Press release (TSA, El Khabar)
5. Support live 24/7 (première semaine)
```

### Post-Launch
```
1. Monitor analytics daily
2. Respond to user feedback
3. Fix bugs rapidement
4. Iterate features
5. Plan Phase 2
```

---

## 📞 SUPPORT DÉVELOPPEMENT

**Questions techniques ?**
- Architecture : Référer à ce document section 4
- Database : Schémas SQL section 5
- API : Endpoints section 6
- UI/UX : Design system section 7

**Ressources externes :**
- FastAPI docs : https://fastapi.tiangolo.com
- Next.js docs : https://nextjs.org/docs
- shadcn/ui : https://ui.shadcn.com
- PostgreSQL : https://www.postgresql.org/docs

---

**FIN DU DOCUMENT**

*Version 1.0 - Février 2026*
*CABAS HUB - Votre passerelle vers le monde*
