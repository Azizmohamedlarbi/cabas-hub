# CABAS HUB – Deep Project Analysis

This document is a line-by-line, file-by-file analysis of the **CABAS HUB** project (Next.js marketplace for Algerian micro-importers). It covers architecture, data flow, every major module, and identified issues.

---

## 1. Project overview

| Item | Value |
|------|--------|
| **Name** | temp-app (CABAS HUB) |
| **Stack** | Next.js 16.1.6 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase |
| **Purpose** | B2B/B2C marketplace connecting verified ANAE micro-importers with buyers in Algeria |
| **Locale** | French (Algeria – DZD, 58 wilayas) |

**Root layout:** `cabasHub/` contains `temp-app/` (the Next app), `CGU.md`, `MENTIONS_LEGALES.md`, `POLITIQUE_CONFIDENTIALITE.md`, and `Cabas_Hub_logo.png`.

---

## 2. Configuration & tooling

### 2.1 `package.json`
- **Scripts:** `dev`, `build`, `start`, `lint`.
- **Dependencies:** Next 16, React 19, Supabase JS, Zustand, React Hook Form + Zod, Framer Motion, Lucide, date-fns, react-markdown, Tailwind.
- **Path alias:** `@/*` → `./src/*` (used consistently).

### 2.2 `next.config.ts`
- Empty config; no custom rewrites, images, or env.

### 2.3 `tsconfig.json`
- Strict mode, ESNext, `paths` for `@/*`.
- Includes Next env and generated route types.

### 2.4 `postcss.config.mjs` / `eslint.config.mjs`
- PostCSS: Tailwind only.
- ESLint: Next core-web-vitals + TypeScript, with custom global ignores.

### 2.5 Environment
- **`.env.local`:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (gitignored).
- Supabase client is created with these; no fallback if missing (risk of runtime error if unset).

---

## 3. Source structure

```
src/
├── app/                    # App Router routes
│   ├── layout.tsx          # Root layout (Navbar, Footer, AuthProvider)
│   ├── page.tsx            # Home
│   ├── globals.css         # CSS variables, Tailwind, utilities
│   ├── auth/               # Login, register (buyer/seller), confirm, forgot-password
│   ├── admin/              # Admin: dashboard, users, products, orders, trips, photos, settings, subscriptions
│   ├── dashboard/          # Buyer & seller dashboards (layout + nested routes)
│   ├── products/           # Listing + [slug] detail
│   ├── sellers/            # Listing + [id] profile
│   ├── trips/              # Trips listing
│   ├── messages/           # In-app messaging
│   ├── notifications/      # Notifications list
│   ├── checkout/           # Checkout + success
│   ├── search/             # Redirect to /products?search=
│   ├── pricing/            # Plans (Free, Early Adopter, Pro)
│   ├── cgu/                # CGU (LegalDocument)
│   ├── mentions-legales/   # Legal (LegalDocument)
│   └── politique-confidentialite/  # Privacy (LegalDocument)
├── components/
│   ├── layout/             # Navbar, Footer, AdminSidebar, DashboardSidebar, DashboardHeader
│   ├── providers/          # AuthProvider
│   ├── dashboard/          # PendingVerification, SubscriptionStatus
│   ├── photos/             # PhotoUploadModal
│   ├── modals/             # ReviewModal
│   ├── ProductCard.tsx, TripCard.tsx, LegalDocument.tsx, PhotoRequestForm.tsx
├── lib/
│   ├── supabase.ts         # Supabase client (fetch override for AbortSignal)
│   ├── db.ts               # All DB access (categories, products, profiles, orders, trips, favorites, reviews, pre-orders, photo_requests, limits, subscriptions)
│   ├── admin.ts            # Admin-only operations (users, products, orders, trips, platform stats)
│   ├── messages.ts         # Chats, messages, send, markAsRead, getOrCreateConversation
│   ├── notifications.ts    # Notifications CRUD + unread count
│   ├── utils.ts            # cn, formatDZD, formatDate, formatRelativeDate, truncate, slugify, generateOrderNumber
│   └── mock-data.ts        # Static CATEGORIES, WILAYAS, IMPORT_COUNTRIES, SELLERS, PRODUCTS, TRIPS, REVIEWS, ORDERS, CONVERSATIONS (camelCase types) – used for Navbar categories dropdown and products filters only; rest is Supabase
├── store/
│   ├── auth.ts             # Zustand + persist: user, session, isLoading, initialize, login, signUp, logout, refreshProfile
│   └── cart.ts             # Zustand + persist: items, addItem, removeItem, updateQuantity, totalItems, totalPrice
└── types/
    └── index.ts            # Profile, Category, Product, Order, OrderItem, Trip, Review, SubscriptionPayment (snake_case from DB)
```

---

## 4. Core layers (detailed)

### 4.1 `src/lib/supabase.ts`
- Builds Supabase client with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Critical override:** `global.fetch` strips `AbortSignal` from requests and uses `cache: 'no-store'` to avoid Next.js soft-navigation aborting Supabase and leaving the auth mutex locked (which caused “infinite loading” / hang).
- Auth: `persistSession`, `autoRefreshToken`.
- No guard if env vars are undefined (client can throw at runtime).

### 4.2 `src/lib/db.ts`
- Single `db` object used by almost all pages.
- **Categories:** `getCategories()` – fetches all, then per-category product count (active only).
- **Products:** `getProducts(filters)`, `getProductBySlug(slug)`, `getAllProducts`, `updateProductStatus`.
- **Profiles:** `getSellers(limit?)`, `getProfile(id)`, `getEarlyAdopterStats()` (counts by plan + user_type).
- **Trips:** `getTrips(sellerId?)`, `createTrip`.
- **Orders:** `getOrders(userId, type)`, `getAllOrders`, `createOrder(order, items)`, `updateOrderStatus`.
- **Reviews:** `getReviews(productId)`, `leaveReview`, `getReviewCount`.
- **Favorites:** `getFavorites(userId)`, `toggleFavorite`.
- **Pre-orders:** `createPreOrder`, `getPreOrdersForTrip`, `getBuyerPreOrders`, `updatePreOrderStatus`.
- **Platform:** `getPlatformSetting`, `updatePlatformSetting`.
- **Photo requests:** `createPhotoRequest` (self URL vs email path), `getMyPhotoRequests`, `getAllPhotoRequests`, `approvePhotoRequest`, `rejectPhotoRequest`, `canChangeProductImages`.
- **Monetization:** `checkUserLimits(userId, action)`, `submitSubscriptionPayment`, `getEarlyAdopterCount`, `getPendingSubscriptions`, `updateSubscriptionStatus`.
- **Search:** `getSearchSuggestions(query)` – products (title ilike), sellers (first_name, last_name, business_name or), categories (name ilike); returns `{ type, label, slug?, id? }`. Sellers select uses aliases `firstName:first_name` etc.; filters use snake_case (`first_name.ilike`).
- All errors go through `logError`; most methods throw on Supabase error. Homepage and list pages rely on try/catch and `finally` to set loading false.

### 4.3 `src/lib/admin.ts`
- Standalone functions (no default export): `getUsers`, `updateUserType`, `updateUserPlan`, `updateUserFounderStatus`, `verifySeller`, `updateProfileStatus`, `getAdminProducts`, `updateProductStatus`, `getAdminOrders`, `releaseEscrow`, `getAdminTrips`, `getPlatformStats`.
- Used only by `/admin/*` pages.

### 4.4 `src/lib/messages.ts`
- **Tables:** `chats` (user1_id, user2_id, last_message, last_message_at), `chat_messages`.
- `getConversations(userId)` – list chats with unread count per chat.
- `getConversation(chatId, userId)` – one chat + messages.
- `sendMessage` – uses **raw fetch** to POST to `/rest/v1/chat_messages` with JWT and 5s timeout to avoid Supabase client queue deadlocks.
- `markAsRead` – PATCH via raw fetch.
- `getOrCreateConversation(currentUserId, targetUserId)` – calls RPC `get_or_create_chat_v2(other_user_id)`.
- Caches JWT in `cachedJwtToken` (set on client from `getSession` / `onAuthStateChange`).

### 4.5 `src/lib/notifications.ts`
- `notificationsApi`: getNotifications, markAsRead, sendNotification, getUnreadCount.
- Table: `notifications` (user_id, type, title, message, link, is_read, created_at).

### 4.6 `src/store/auth.ts`
- Zustand with `persist` (key: `cabas-auth`; only `isLoggedIn` partialized).
- State: `user`, `session`, `isLoggedIn`, `isLoading` (starts `true`).
- **initialize():** `getSession()` → if session, load profile from `profiles` and set user; then `set({ isLoading: false })`; then subscribes to `onAuthStateChange` and updates state on login/logout.
- User shape: id, userType, firstName, lastName, email, phone, profilePhoto, anaeVerified, businessName, ratingAverage, ratingCount, plan, isFounder, planExpiresAt (camelCase).
- Login/signUp map `profiles` snake_case to this user shape. Cart is cleared when there is no session.

### 4.7 `src/store/cart.ts`
- Persisted as `cabas-cart`.
- Items: `{ product, quantity, priceType }`. `totalPrice()` uses `price_wholesale` or `price_retail` from Product.

---

## 5. App routes (concise)

- **Layout:** Root layout wraps everything in `AuthProvider`, then Navbar + main + Footer.
- **Home (`page.tsx`):** Client. Fetches products (8), sellers (6), trips, categories, earlyAdopterStats in one `Promise.all`. Hero search uses `getSearchSuggestions` (debounced 300ms). Renders hero, Early Adopter banner (with stats), stats bar, categories, featured products, how-it-works, top sellers, trips, CTA. Section loaders only for categories/products; loading is per-section, not full-page.
- **Auth:** Login (demo buttons, redirect by userType), Register seller (multi-step + ANAE), Register buyer (steps + buyerType), Confirm (OTP/session + success UI), Forgot-password (UI only; submit does not call Supabase reset).
- **Products:** List with URL params search/category; filters (category, price, country, wholesale); sort; grid/list; data from `getCategories` + `getProducts()` then client-side filter/sort.
- **Product [slug]:** `getProductBySlug`, `getReviews`, favorites if logged in; add to cart, contact seller (getOrCreateConversation → messages).
- **Sellers:** List from `getSellers` + `getCategories`; client-side filter/sort.
- **Seller [id]:** `getProfile`, `getProducts({ sellerId })`, `getTrips(sellerId)`; tabs Products/Trips; contact button.
- **Trips:** `getTrips()`, filter by country (client).
- **Messages:** Conversations list + active thread; real-time subscription on `chat_messages` INSERT; send via `sendMessage`; mark as read.
- **Checkout:** Steps Cart → Address → Payment; groups cart by seller; creates one order per seller via `db.createOrder`; then redirect to success.
- **Search:** Redirects `?q=` to `/products?search=`.
- **Pricing:** Plans (Free / Early Adopter / Pro); upgrade opens modal; proof submitted via `db.submitSubscriptionPayment`.
- **Legal (CGU, mentions, politique):** Server components that render `<LegalDocument title="..." filePath="..." />`.

---

## 6. Components (high level)

- **Navbar:** Search suggestions (db), categories dropdown from **mock-data** `CATEGORIES`, cart count, messages link, profile menu (role-based links), login/register.
- **Footer:** Logo, links (marketplace, vendeurs, contact), legal links.
- **AuthProvider:** Calls `useAuthStore().initialize()` in `useEffect` once.
- **ProductCard:** Image, badges, favorite (local state only; detail page uses DB), seller link, add to cart.
- **TripCard:** Trip info + PreOrder modal (calls `db.createPreOrder`).
- **LegalDocument:** **Uses `fs.readFileSync(filePath, 'utf8')`** and renders markdown with ReactMarkdown. Server-only; paths in legal pages are **absolute Windows paths** (e.g. `c:/Users/IT7/cabasHub/CGU.md`). Fails on other machines or in serverless; path is not portable.

---

## 7. Data & types

- **DB shape:** Snake_case (profiles, products, orders, etc.). Types in `src/types/index.ts` match DB (Profile, Product, Order, Trip, Review, etc.).
- **Auth store:** CamelCase user (firstName, userType, etc.); mapping from `profiles` in auth and auth-related code.
- **Mock data:** `mock-data.ts` uses camelCase (Seller, Product, Trip, etc.) and is used only for Navbar categories and product filters (IMPORT_COUNTRIES, WILAYAS); the rest of the app uses Supabase and `@/types`.

---

## 8. Issues & risks (by file/area)

### 8.1 Legal documents (`LegalDocument.tsx`, `cgu/page.tsx`, `mentions-legales/page.tsx`, `politique-confidentialite/page.tsx`)
- **Absolute paths:** `filePath="c:/Users/IT7/cabasHub/CGU.md"` (and same for MENTIONS_LEGALES, POLITIQUE_CONFIDENTIALITE). Breaks on other OS or when deployed; serverless has no guarantee of that path.
- **Recommendation:** Use paths relative to project root (e.g. `process.cwd()` or `path.join(process.cwd(), 'CGU.md')`) and ensure markdown files live in the app (e.g. `temp-app/public` or `temp-app/content`) or are deployed with the app.

### 8.2 Forgot password (`auth/forgot-password/page.tsx`)
- Form only sets local state `sent`; it does **not** call `supabase.auth.resetPasswordForEmail(email)`. Users never receive a reset link.

### 8.3 Supabase env (`lib/supabase.ts`)
- If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing, the client can throw when creating the client or on first request. No fallback or early check.

### 8.4 Product detail (`products/[slug]/page.tsx`)
- Imports `REVIEWS` from `@/lib/mock-data` but never uses it; reviews come from `db.getReviews`. Dead import.

### 8.5 Homepage loading / LCP
- If Supabase is slow or unreachable, `fetchHomeData` still sets `loading = false` in `finally`, so the page eventually shows (with empty sections). LCP is dominated by the hero (static h1); the 201s LCP you saw was likely from running Lighthouse in the background or before the tab was focused. No full-page loader blocks the initial paint.

### 8.6 Search suggestions (`db.getSearchSuggestions`)
- Sellers query uses `.select('firstName:first_name, lastName:last_name, businessName:business_name, id')`. PostgREST returns these with the alias keys (firstName, etc.); code uses `s.businessName`, `s.firstName`, `s.lastName` – correct. No bug found here.

### 8.7 Dashboard seller layout
- Unverified sellers (no `anaeVerified`) are forced to see `PendingVerification` except on `/dashboard/seller/settings`. Layout does not render `DashboardHeader` in the main branch (only in the unverified branch); child pages that expect a header must add it themselves (e.g. DashboardHeader in each page or in a shared wrapper).

### 8.8 Admin layout
- There is **no** `app/admin/layout.tsx`. Each admin page (e.g. `admin/page.tsx`) includes `<AdminSidebar />` and its own main content. Works but duplicates layout logic.

---

## 9. Security & RLS

- Schema enables RLS on profiles, categories, products, orders, order_items, trips, favorites, reviews.
- Policies in `supabase_schema.sql` define public read for profiles/categories/trips, and “active” for products; writes are authenticated and often scoped by user/seller. Admin operations in `admin.ts` rely on Supabase client with the same anon key; actual admin enforcement depends on RLS (e.g. only admin profiles allowed to update certain tables) or a separate service role in backend. The codebase does not show a service role; admin actions are done with the same client as the rest of the app.

---

## 10. Performance notes

- Home runs 5 parallel requests (products, sellers, trips, categories, earlyAdopterStats); categories then does N extra count queries. Could be optimized with a single RPC or a view.
- Products list loads all products then filters in memory; for large catalogs, server-side filtering (query params → Supabase filters) would scale better.
- Messaging uses raw fetch + 5s timeout and real-time subscription; good to avoid client queue issues.
- Supabase fetch override (no AbortSignal) prevents navigation-induced hangs but means in-flight requests are not cancelled on route change.

---

## 11. Summary table

| Area | Status | Note |
|------|--------|------|
| App Router & layout | OK | Clear structure, AuthProvider at root |
| Supabase client | OK | AbortSignal fix applied |
| Auth store | OK | Initialize + onAuthStateChange, loading cleared |
| DB layer | OK | Centralized, errors handled; getSearchSuggestions correct |
| Messaging | OK | Raw fetch + realtime, RPC for get/create chat |
| Cart & checkout | OK | Persisted, multi-seller orders |
| Legal pages | **Fix** | Use relative/portable paths; avoid absolute Windows path |
| Forgot password | **Fix** | Call Supabase reset email |
| Env vars | **Harden** | Validate or provide clear error if missing |
| Product [slug] | **Cleanup** | Remove unused REVIEWS import |
| Admin layout | Optional | Add admin layout.tsx for sidebar + wrapper |
| Dashboard header | Optional | Decide if layout should render DashboardHeader for seller |

---

This analysis was generated from a full read-through of the codebase. For any specific file or flow, you can refer to the section above or ask for a targeted deep-dive.
