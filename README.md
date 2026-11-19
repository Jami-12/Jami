# Aether Storefront (`client`)

A beginner-friendly guide to this Next.js application. This is the **frontend** for Aether/JAMI: a storefront, customer account area, admin console, and super-admin back office.

The client talks to the sibling Express + Prisma API (expected at `http://localhost:4000/api/v1`). Catalog, cart, orders, payments, addresses, users, banners, coupons, reviews, notifications, inventory, and accounting data are **live API data**. There is no mocked checkout and no fake authentication. The two intentional local-only exceptions are the newsletter form (local validation + simulated success) and editorial fallback artwork used when API data is empty.

---

## 1. Requirements

- **Node.js** `>=20.9.0` (declared in `package.json`)
- **pnpm 9+** (the repo has `pnpm-lock.yaml`)
- The sibling backend running on `http://localhost:4000`, with CORS allowing `http://localhost:3000`
- Optional: Cloudinary/Unsplash availability for remote product imagery; local fallback images are bundled in `public/`

## 2. Local setup

```bash
# from D:\E commerce Shop\client
pnpm install
cp .env.example .env.local
pnpm dev
```

Open <http://localhost:3000>.

`.env` already exists with local defaults (`NEXT_PUBLIC_STORE_NAME=JAMI`, while `.env.example` uses `Aether`). Next.js loads `.env.local` with higher priority than `.env`, so copying the example to `.env.local` is the normal way to make local overrides without editing committed files.

### Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the Next.js development server with Turbopack |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint (flat config in `eslint.config.mjs`) |
| `pnpm typecheck` | Run `tsc --noEmit` |

Useful first checks after cloning:

```bash
pnpm typecheck
pnpm lint
```

---

## 3. Tech stack

| Area | Library / version in `package.json` | Why it is here |
| --- | --- | --- |
| Framework | **Next.js 16.4.5**, React 19.3.0 | App Router, React Server Components, file-system routing, metadata, sitemap, image optimization |
| Language | TypeScript 5.9.3, strict mode | Typed API contracts and compile-time safety; `@/*` maps to `./src/*` |
| Styling | **Tailwind CSS 4.3.4**, `@tailwindcss/turbopack`, `tw-animate-css` | Utility-first design system compiled through the Turbopack CSS loader in `next.config.ts` |
| UI layer | **Shadcn UI** config (`components.json`, style `new-york`), Radix primitives, custom wrappers in `src/components/ui` | Buttons, inputs, dialogs, dropdowns, switches, tabs, tables, drawers, toasts |
| Server state | **TanStack Query 5** (`@tanstack/react-query`) | Caching, background refetching, mutations, pagination, optimistic updates |
| Client state | **Zustand 5** | Auth session, cart, wishlist, recently viewed, UI flags, sound, legacy theme preference |
| Forms & validation | React Hook Form 7, Zod 4.6.7, `@hookform/resolvers`, custom `formResolver` | Shared schemas for login, checkout, products, coupons, admin forms, etc. |
| HTTP | Axios 1.21 | `apiClient` with bearer token, refresh-on-401, typed `apiRequest<T>` envelope unwrapping |
| Animation | Framer Motion 14.9.1 | Drawers, modals, page/section motion |
| 3D | **Three.js 0.187.0**, `@react-three/fiber` 9.8.2, `@react-three/drei` 10.7.9 | Lazy WebGL scenes in `src/components/three` (present but not mounted by the current home page) |
| Charts | Recharts 3.10.1 | Admin/super-admin analytics and accounting dashboards |
| Carousel | Embla Carousel 8.6 | `src/components/ui/carousel.tsx` |
| Payments | `@stripe/stripe-js`, `@stripe/react-stripe-js` | Card payment dialog after backend payment initiation |
| Icons | Lucide React 1.68 | Icon system across the UI |
| Class helpers | `clsx`, `class-variance-authority`, `tailwind-merge` | `cn()` helper and variant-driven components |
| Notifications | Sonner 2 | Toast feedback via `src/components/ui/sonner.tsx` |
| SEO | Next metadata, `manifest.ts`, `robots.ts`, `sitemap.ts`, JSON-LD | Storefront indexing; dashboards/account/auth are `noindex` |

`shadcn` is installed as a CLI dependency, but most files in `src/components/ui` are hand-written wrappers that follow Shadcn conventions rather than generated files.

---

## 4. Architecture at a glance

```text
Browser
  │
  ├─ Server Components (RSC)
  │    ├─ src/app/(storefront)/page.tsx
  │    ├─ src/app/(storefront)/products/[slug]/page.tsx
  │    └─ src/app/sitemap.ts
  │         └─ src/services/catalog.ts ── fetch() ──> Express public catalog endpoints
  │
  ├─ Client Components
  │    ├─ TanStack Query hooks ──> src/lib/api/services.ts ──> apiClient (Axios)
  │    ├─ Zustand stores (persisted to localStorage)
  │    └─ UI primitives (src/components/ui)
  │
  └─ Express + Prisma API (all writes and all account/admin data)
```

### Layer responsibilities

| Layer | Folder | Rule of thumb |
| --- | --- | --- |
| Routing / pages | `src/app` | Route files set metadata and compose components. Route groups `(auth)` and `(storefront)` do **not** appear in URLs. |
| Feature UI | `src/components` | Behavior lives here, not in tiny route wrappers. |
| Server-safe reads | `src/services` | Plain `fetch` for RSC; safe fallbacks so public pages degrade gracefully. |
| Client API | `src/lib/api` | One Axios instance plus one typed service object per domain. |
| Server state cache | TanStack Query in hooks/components | `staleTime: 30s`, `gcTime: 5m`, `retry: 1`, no refetch on window focus. |
| Client state | `src/stores` | Persisted local state and optimistic guest behavior. |
| Contracts | `src/types` | API-aligned types, no backend schema duplication elsewhere. |
| Validation | `src/lib/validations.ts` | One Zod schema per form, reused between form and type inference. |

---

## 5. Complete folder/file map

Every source file is listed below. Empty/reserved directories are called out explicitly.

### 5.1 Repository root

| Path | Purpose |
| --- | --- |
| `.env.example` | Public environment template to copy into `.env.local` |
| `.env` | Committed local defaults; currently sets store name `JAMI` |
| `.gitignore` | Ignores `node_modules`, build output, local env overrides, etc. |
| `AGENTS.md` | Next.js-generated agent guidance; recreated by `next dev` |
| `components.json` | Shadcn UI config: `new-york` style, RSC, TSX, Lucide, `@/` aliases, CSS in `src/app/globals.css` |
| `eslint.config.mjs` | ESLint 9 flat config using `eslint-config-next` core-web-vitals + TypeScript |
| `next-env.d.ts` | Next-generated TypeScript declarations |
| `next.config.ts` | Strict mode, no `X-Powered-By`, remote image patterns, AVIF/WebP, Turbopack Tailwind loader, security headers |
| `package.json` | Scripts, dependencies, engines |
| `pnpm-lock.yaml` | Deterministic dependency lockfile |
| `pnpm-workspace.yaml` | pnpm build/release allow-list for this repo |
| `README.md` | This guide |
| `tsconfig.json` | Strict TS config, bundler resolution, `@/* → ./src/*` |
| `tsconfig.tsbuildinfo` | Incremental TypeScript cache (generated) |
| `.git/`, `.next/`, `node_modules/` | VCS metadata, Next build output, installed packages |
| `public/` | Static assets |
| `scripts/` | Empty/reserved helper directory |
| `src/` | Application source |

### 5.2 `public/`

| Path | Purpose |
| --- | --- |
| `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Framework/boilerplate SVG assets left in the template |
| `icon.svg` | App icon and manifest icon |
| `og.svg` | Open Graph / Twitter social preview image |
| `product-fallback.svg` | Fallback used by `SmartImage` when a product image is missing/invalid |
| `showcase/detail-fold.webp`, `detail-rust.webp`, `detail-tee.webp` | Close-up/detail editorial photography |
| `showcase/editorial-rust.webp`, `editorial-tee.webp`, `editorial-wine.webp` | Editorial campaign imagery |
| `showcase/rail-rust-1.webp` … `rail-rust-3.webp` | Rust-colored hanging-rail gallery images |
| `showcase/rail-tee-1.webp` … `rail-tee-3.webp` | Tee-colored hanging-rail gallery images |
| `showcase/rail-wine-1.webp`, `rail-wine-3.webp` | Wine-colored hanging-rail gallery images (no `rail-wine-2.webp` in this repo) |

Remote images are allowed from `images.unsplash.com`, `res.cloudinary.com`, `*.cloudinary.com`, and `lh3.googleusercontent.com` via `next.config.ts`.

### 5.3 `src/app/` — routes

#### Root app files

| File | Purpose |
| --- | --- |
| `layout.tsx` | Root HTML shell, global metadata/viewport, Geist font variable, Google Fonts link, theme boot script, skip link, `AppProviders` |
| `globals.css` | Tailwind v4 theme tokens, base styles, utility classes such as `container-page` and `skip-link` |
| `error.tsx` | Global client error boundary |
| `loading.tsx` | Root suspense/loading fallback |
| `not-found.tsx` | 404 page |
| `manifest.ts` | PWA web app manifest |
| `robots.ts` | Allows public pages; disallows `/dashboard`, `/api`, `/checkout`, `/account` |
| `sitemap.ts` | Static routes plus up to 100 active product slugs from the catalog API; revalidates hourly |
| `favicon.ico` | Browser favicon |

#### Storefront — `src/app/(storefront)/`

| File | URL | Purpose |
| --- | --- | --- |
| `layout.tsx` | all public pages | Promo bar, `Navbar`, `<main id="main">`, `Footer`, `CartDrawer` |
| `page.tsx` | `/` | Home RSC; `revalidate = 120`; parallel catalog fetch and section composition |
| `loading.tsx` | `/` | Storefront loading skeleton |
| `products/page.tsx` | `/products` | Parses `searchParams` with `productQuerySchema`, server-fetches filtered products, renders facets/grid, emits ItemList JSON-LD |
| `products/loading.tsx` | `/products` | Catalog loading skeleton |
| `products/[slug]/page.tsx` | `/products/:slug` | Fetches product + related products, emits Product JSON-LD, renders `ProductDetail` and recently viewed |
| `products/[slug]/loading.tsx` | `/products/:slug` | Detail loading skeleton |
| `cart/page.tsx` | `/cart` | Metadata wrapper for `CartView` |
| `checkout/page.tsx` | `/checkout` | Metadata wrapper for `CheckoutView` |
| `wishlist/page.tsx` | `/wishlist` | Metadata wrapper for `WishlistView` |

#### Auth — `src/app/(auth)/`

| File | URL | Purpose |
| --- | --- | --- |
| `login/page.tsx` | `/login` | Reads `?next=`, renders `AuthShell` + `LoginForm` |
| `register/page.tsx` | `/register` | Reads `?next=`, renders `AuthShell` + `RegisterForm` |
| `forgot-password/page.tsx` | `/forgot-password` | Support-email instructions; no API call |
| `reset-password/page.tsx` | `/reset-password` | Placeholder: always reports “No reset token found” |
| `auth/callback/page.tsx` | `/auth/callback` | Suspense wrapper for Google OAuth token handoff |

#### Customer account — `src/app/account/`

All account routes are `noindex` and share `layout.tsx` → `AccountLayout` → `CustomerShell` → `RoleGuard(["CUSTOMER"])`.

| File | URL | Purpose |
| --- | --- | --- |
| `layout.tsx` | all `/account/*` | Account shell |
| `page.tsx` | `/account` | `AccountOverview` stats, recent orders, notifications |
| `orders/page.tsx` | `/account/orders` | `OrdersList` with tabs, search, pagination |
| `orders/[id]/page.tsx` | `/account/orders/:id` | `OrderDetailView` + payment-return status hint |
| `profile/page.tsx` | `/account/profile` | `ProfileForm` |
| `addresses/page.tsx` | `/account/addresses` | `AddressBook` |
| `wishlist/page.tsx` | `/account/wishlist` | Reuses storefront `WishlistView` |
| `notifications/page.tsx` | `/account/notifications` | `NotificationsView` |
| `security/page.tsx` | `/account/security` | `SecurityForm` password change |

#### Admin — `src/app/admin/`

All admin routes are `noindex`. Route files are intentionally thin wrappers; behavior is in `src/components/admin`.

| File | URL | Renders |
| --- | --- | --- |
| `layout.tsx` | all `/admin/*` | `AdminLayout` → `AdminShell` → `RoleGuard(["ADMIN", "SUPER_ADMIN"])` |
| `page.tsx` | `/admin` | `AdminOverview` |
| `products/page.tsx` | `/admin/products` | `ProductsAdmin` |
| `products/new/page.tsx` | `/admin/products/new` | `ProductForm` (create) |
| `products/[id]/edit/page.tsx` | `/admin/products/:id/edit` | `ProductForm` (edit) |
| `categories/page.tsx` | `/admin/categories` | `CategoriesAdmin` |
| `categories/new/page.tsx` | `/admin/categories/new` | `CategoryForm` (create) |
| `categories/[id]/edit/page.tsx` | `/admin/categories/:id/edit` | `CategoryForm` (edit) |
| `brands/page.tsx` | `/admin/brands` | `BrandsAdmin` |
| `brands/new/page.tsx` | `/admin/brands/new` | `BrandForm` (create) |
| `brands/[id]/edit/page.tsx` | `/admin/brands/:id/edit` | `BrandForm` (edit) |
| `banners/page.tsx` | `/admin/banners` | `BannersAdmin` |
| `banners/new/page.tsx` | `/admin/banners/new` | `BannerForm` (create) |
| `banners/[id]/edit/page.tsx` | `/admin/banners/:id/edit` | `BannerForm` (edit) |
| `coupons/page.tsx` | `/admin/coupons` | `CouponsAdmin` |
| `coupons/new/page.tsx` | `/admin/coupons/new` | `CouponForm` (create) |
| `coupons/[id]/edit/page.tsx` | `/admin/coupons/:id/edit` | `CouponForm` (edit) |
| `orders/page.tsx` | `/admin/orders` | `OrdersAdmin` |
| `inventory/page.tsx` | `/admin/inventory` | `InventoryAdmin` |
| `customers/page.tsx` | `/admin/customers` | `CustomersAdmin` |
| `reviews/page.tsx` | `/admin/reviews` | `ReviewsAdmin` |
| `expenses/page.tsx` | `/admin/expenses` | `ExpensesAdmin` (create-only; no self-approval) |
| `notifications/page.tsx` | `/admin/notifications` | Shared `NotificationsView` |

#### Super admin — `src/app/super-admin/`

| File | URL | Renders |
| --- | --- | --- |
| `layout.tsx` | all `/super-admin/*` | `SuperAdminLayout` → `SuperAdminShell` → `RoleGuard(["SUPER_ADMIN"])` |
| `page.tsx` | `/super-admin` | `SuperOverview` |
| `analytics/page.tsx` | `/super-admin/analytics` | `AnalyticsView` |
| `accounting/page.tsx` | `/super-admin/accounting` | `AccountingView` |
| `transactions/page.tsx` | `/super-admin/transactions` | `TransactionsView` |
| `users/page.tsx` | `/super-admin/users` | `UsersView` |
| `expenses/page.tsx` | `/super-admin/expenses` | `ExpensesAdmin canApprove` |
| `discounts/page.tsx` | `/super-admin/discounts` | `DiscountsView` |
| `investments/page.tsx` | `/super-admin/investments` | `InvestmentsView` |
| `employees/page.tsx` | `/super-admin/employees` | `EmployeesView` |
| `salaries/page.tsx` | `/super-admin/salaries` | `SalariesView` |
| `notifications/page.tsx` | `/super-admin/notifications` | Shared `NotificationsView` |
| `audit/page.tsx` | `/super-admin/audit` | `AuditView` |

#### Dashboard compatibility routes

| File | URL | Purpose |
| --- | --- | --- |
| `src/app/dashboard/page.tsx` | `/dashboard` | `DashboardRedirect` sends the user to `/admin`, `/super-admin`, or `/account` by role |
| `src/app/dashboard/orders/[id]/page.tsx` | `/dashboard/orders/:id` | Payment-provider return route; passes Stripe/bKash/Nagad query values to `PaymentReturnView`; `noindex` |

### 5.4 `src/components/` — UI by feature

#### `account/`

| File | Purpose |
| --- | --- |
| `account-overview.tsx` | Order counts, pending payments, shipments, wishlist count, recent notifications |
| `address-book.tsx` | Address CRUD, default address, `ConfirmDialog` delete |
| `notifications-view.tsx` | Shared inbox: list/unread tabs, mark read, mark all read, delete, pagination; reused in admin areas |
| `order-detail.tsx` | Order timeline, payment status, retry payment, cancel order, and `ReceiptDialog` HTML/print receipt |
| `orders-list.tsx` | Debounced search, status tabs, `DataTable`, pagination |
| `payment-return-view.tsx` | Reconciles Stripe once per `paymentIntent`, then renders `OrderDetailView` |
| `profile-form.tsx` | Profile edit, avatar upload via `uploadsApi.uploadImage(file, "avatar")`, 5 MB client check |
| `security-form.tsx` | Password change; hides current-password field for Google-only accounts |

#### `admin/`

| File | Purpose |
| --- | --- |
| `accounting-view.tsx` | Financial dashboard, date-range summary, reports, order profit |
| `admin-form-page.tsx` | Shared add/edit page header: back link, eyebrow, title, description, badge |
| `admin-overview.tsx` | Admin KPI cards, recent activity, quick links |
| `analytics-view.tsx` | Revenue, orders, payments, and catalog charts |
| `audit-view.tsx` | Privileged action/audit log with filters |
| `customers-admin.tsx` | Read-only customer directory |
| `discounts-view.tsx` | Product discount campaigns; uses `useQueries` to fetch details for active-only list results |
| `employees-view.tsx` | Employee roster with create/update/deactivate |
| `expenses-admin.tsx` | Shared expense list/create; `canApprove` prop enables super-admin status/approval controls |
| `inventory-admin.tsx` | Stock overview, low-stock filter, adjustments, movement history |
| `investments-view.tsx` | Capital investments and summaries |
| `reviews-admin.tsx` | Approve/unpublish/delete reviews; search filters the current page only |
| `salaries-view.tsx` | Salary records, mark paid, payroll summaries |
| `super-overview.tsx` | Business-wide super-admin landing dashboard |
| `transactions-view.tsx` | Full ledger with filters/export |
| `users-view.tsx` | User list, create admin, role/status updates |

`admin/banners/`

| File | Purpose |
| --- | --- |
| `banner-form.tsx` | Add/edit banner: title, subtitle, link, slot (`HERO`/`PROMO`), sort order, active flag, image or URL |
| `banners-admin.tsx` | Banner list, active toggle, delete |
| `index.ts` | Barrel export |

`admin/brands/`, `admin/categories/`

| File | Purpose |
| --- | --- |
| `brand-form.tsx` / `category-form.tsx` | Thin wrappers around `TaxonomyForm` with `mode="brands"` / `"categories"` |
| `brands-admin.tsx` / `categories-admin.tsx` | Thin wrappers around `TaxonomyAdmin` with the same mode |
| `index.ts` | Barrel exports |

`admin/coupons/`

| File | Purpose |
| --- | --- |
| `coupon-form.tsx` | Add/edit coupon: code, percent **or** fixed amount, min spend, max discount, usage limit, description, start/end dates, active flag |
| `coupons-admin.tsx` | Coupon list, active toggle, delete |
| `index.ts` | Barrel export |

`admin/orders/`

| File | Purpose |
| --- | --- |
| `orders-admin.tsx` | Order list, filters, status transitions from `ORDER_TRANSITIONS`, detail dialog |
| `order-detail-dialog.tsx` | Items, totals, customer/address, payment and fulfillment status |
| `cash-collection-dialog.tsx` | Marks COD payment as `PAID` and posts income to the ledger; does not change fulfillment status |
| `index.ts` | Barrel exports |

`admin/products/`

| File | Purpose |
| --- | --- |
| `product-form.tsx` | Large create/edit form; creates a `DRAFT` first on new items, uploads images, reorders images, then applies final status |
| `products-admin.tsx` | Product table, search/filters, status + featured toggles, delete, image management |
| `product-columns.tsx` | Table column definitions for the product list |
| `product-images-dialog.tsx` | Gallery manager; at most 10 files per upload, 5 MB each |
| `product-media-field.tsx` | Media field used by the form; 5 MB each, up to 20 images per product |
| `index.ts` | Barrel exports |

`admin/shared/` and `admin/taxonomy/`

| File | Purpose |
| --- | --- |
| `shared/image-upload-field.tsx` | Reusable validated image picker for categories/brands/banners; 5 MB limit, JPEG/JPG/PNG/WebP/GIF/AVIF |
| `taxonomy/taxonomy-admin.tsx` | Shared category/brand list: debounced search, active toggle, delete |
| `taxonomy/taxonomy-form.tsx` | Shared category/brand form: name, optional slug with auto-slug, description, image/logo |
| `taxonomy/index.ts` | Barrel export |

#### `auth/`

| File | Purpose |
| --- | --- |
| `auth-shell.tsx` | Two-column editorial layout for auth pages |
| `login-form.tsx` | Email/password login, `setSession`, guest-state adoption, role-based redirect |
| `register-form.tsx` | Name/email/phone/password/confirm/terms registration |
| `forgot-password-form.tsx` | Prepares a support email link; explicitly states automated reset emails are unavailable |
| `google-auth-button.tsx` | Full-page link to backend `GET /auth/google` |
| `auth-callback-view.tsx` | Stores OAuth tokens from query string, verifies with `authApi.me()`, redirects by role |
| `role-guard.tsx` | Redirects unauthenticated users to `/login?next=...`; renders a 403 card for wrong roles |
| `dashboard-redirect.tsx` | `/dashboard` role router |

#### `dashboard/`

| File | Purpose |
| --- | --- |
| `dashboard-layouts.tsx` | `AccountLayout`, `AdminLayout`, `SuperAdminLayout`; maps pathname to title/subtitle |
| `shells.tsx` | `CustomerShell`, `AdminShell`, `SuperAdminShell`; attaches the right `RoleGuard` and nav |
| `dashboard-shell.tsx` | Sidebar/mobile nav, header, unread notification badge, Storefront link, sign out |
| `data-table.tsx` | Generic table with loading/empty states |
| `page-section.tsx` | Section/card wrapper for dashboard pages |
| `stat-card.tsx` | KPI tile used across dashboards |

#### `footer/`

| File | Purpose |
| --- | --- |
| `footer.tsx` | Composes brand, links, bottom bar; `id="contact"` |
| `footer-brand.tsx` | Brand mark, contact details, social links from `SITE` |
| `footer-links.tsx` | Renders `FOOTER_NAV` groups |
| `footer-bottom.tsx` | Payment badges, copyright, legal/contact links |
| `index.ts` | Exports `Footer` |

#### `home/`

| File | Purpose |
| --- | --- |
| `hero-banner.tsx` | Client-side product showcase with search, category chips, featured/in-stock filters and sorting over the server-provided products |
| `category-grid.tsx` | Client category tabs plus TanStack Query preview of 4 products for the active category |
| `new-arrivals.tsx` | Server section wrapping `ProductGrid` with an empty state and “View all new” link |
| `brand-showcase.tsx` | Renders up to 8 brands from the server with links to `/products?brand=...` |
| `promo-banners.tsx` | Renders `HERO`/`PROMO` banner cards safely (external link detection, `SmartImage`) |
| `newsletter-section.tsx` | Editorial wrapper around `NewsletterForm` |
| `index.ts` | Barrel exports for all home sections |

#### `layout/`

| File | Purpose |
| --- | --- |
| `brand.tsx` | Inline SVG mark + wordmark, used in header/footer/auth shell |
| `cart-drawer.tsx` | `useUiStore.cartOpen` drawer with cart lines, free-shipping progress, subtotal, checkout CTA |
| `currency-toggle.tsx` | BDT/USD display toggle backed by `useUiStore` |
| `search-dialog.tsx` | Cmd/Ctrl+K product search; debounced API query, keyboard navigation, shortcut links |
| `theme-toggle.tsx` | Hydrated light/dark toggle backed by the active `ThemeProvider` |

#### `navbar/`

| File | Purpose |
| --- | --- |
| `navbar.tsx` | Sticky header, scroll shrink, Cmd/Ctrl+K binding, cart/wishlist counts, desktop/mobile composition |
| `desktop-actions.tsx` | Sound/currency/theme controls plus wishlist, account/dashboard, and bag buttons |
| `mobile-nav.tsx` | Left drawer with nav, categories, controls, and account links |
| `categories-menu.tsx` | Category dropdown using `useNavCategories()` with hardcoded fallback |
| `brands-menu.tsx` | Brand dropdown from `brandsApi.list()`, first 8 brands |
| `nav-search.tsx` | Compact header search; 250 ms debounce, 2-character minimum |
| `sound-toggle.tsx` | `useSoundStore` toggle with click-sound opt-out |
| `use-nav-categories.ts` | Cached nav-category query and `FALLBACK_CATEGORIES` |
| `index.ts` | Exports `Navbar`, `NavSearch`, `SoundToggle` |

#### `payments/`

| File | Purpose |
| --- | --- |
| `stripe-payment-dialog.tsx` | Stripe `Elements` dialog using backend `clientSecret` and publishable key; themed by `useTheme()` |

#### `providers/`

| File | Purpose |
| --- | --- |
| `app-providers.tsx` | `QueryClientProvider` → `ThemeProvider` → `SessionSync` + `SoundProvider` + children + `ThemedToaster`; revalidates session and syncs cart/wishlist on load |
| `theme-provider.tsx` | Active light/dark theme system, `aether-theme` localStorage key, `THEME_SCRIPT` to avoid flash |
| `sound-provider.tsx` | Delegated pointer-down click sounds with reduced-motion and `data-sound-off` handling |

#### `storefront/`

| File | Purpose |
| --- | --- |
| `product-card.tsx` | Reusable product tile with SmartImage dual views, price, badges, quick-add/wishlist/quick-view actions |
| `product-grid.tsx` | Responsive grid, skeletons, empty state, image priority control |
| `product-detail.tsx` | Gallery, derived color/size selectors, quantity, add-to-cart, wishlist, review form/list |
| `product-filters.tsx` | Sidebar filters for category, brand, price, color, stock, featured/sale |
| `quick-view-dialog.tsx` | Fast product preview modal |
| `cart-view.tsx` | Full cart page: quantities, remove, clear, subtotal, shipping hint, checkout CTA |
| `checkout-view.tsx` | Customer-only checkout: address, coupon, payment method, order creation, payment handoff |
| `wishlist-view.tsx` | Persisted wishlist IDs → product queries; remove/clear; reused at `/account/wishlist` |
| `review-form.tsx` | Authenticated review submission |
| `review-list.tsx` | Rating breakdown and review cards |
| `recently-viewed.tsx` | Persisted recent product IDs → product cards |
| `newsletter-form.tsx` | Local Zod validation and simulated success timeout; **no API call** |
| `hero.tsx` | Editorial hero variation; not mounted by the current home page |
| `category-grid.tsx` | Editorial category presentation; not mounted by the current home page |
| `featured-collections.tsx` | Editorial collection showcase; currently unused |
| `best-sellers.tsx` | Editorial best-seller section; currently unused |
| `hanging-showcase.tsx` | Hanging-rail visual section; currently unused |
| `wardrobe-rail.tsx` | Wardrobe rail presentation; currently unused |
| `tilt-card.tsx` | Interactive tilt card used by editorial experiments |
| `journal-section.tsx` | Editorial journal using `JOURNAL_POSTS`; currently unused |
| `offer-banner.tsx` | Promotional banner variation; currently unused |
| `trust-strip.tsx` | Trust/returns badges using `TRUST_POINTS`; currently unused |
| `vendor-panel.tsx` | Vendor/maker editorial panel; currently unused |

#### `three/`

| File | Purpose |
| --- | --- |
| `hero-canvas.tsx` | Dynamic import + WebGL support gate + 2D fallback and skeleton for the hero scene |
| `hero-scene.tsx` | React Three Fiber floating sculpture scene; pauses animation for reduced motion |
| `product-wall-scene.tsx` | R3F wall of product panels with hover; not mounted by default |

These Three.js components are available as a foundation, but the live home page currently uses the 2D `HeroBanner` instead.

#### `ui/`

| File | Purpose |
| --- | --- |
| `button.tsx` | `Button`, `buttonVariants`; variants primary/secondary/outline/ghost/danger/subtle/link, sizes, `loading`, `asChild` |
| `input.tsx` | `Input`, `Textarea`, `Select`, `Label`, `FieldError`, `FieldHint`, `FormField` |
| `card.tsx` | `Card` family with optional glass style; also exports a `SectionHeading` variant |
| `badge.tsx` | Tonal `Badge` with optional dot |
| `avatar.tsx` | Initials fallback avatar with sizes |
| `dialog.tsx` | Custom portal `Dialog` and `ConfirmDialog` with Escape/scroll-lock/focus handling |
| `drawer.tsx` | Framer Motion side drawer, left/right, focus trap, optional footer |
| `modal.tsx` | Framer Motion centered modal with focus trap |
| `dropdown-menu.tsx` | Radix dropdown wrappers |
| `tabs.tsx` | Controlled pill tab list with optional counts |
| `switch.tsx` | Radix switch wrapper with loading state |
| `table.tsx` | Styled native table primitives |
| `carousel.tsx` | Embla carousel context and controls |
| `pagination.tsx` | Callback mode or href/link mode; hides for one page |
| `sonner.tsx` | Themed Sonner toaster (top-center, 4.2s, max 3) |
| `smart-image.tsx` | `next/image` for optimizable URLs, plain `<img>` otherwise, fallback to `/product-fallback.svg` |
| `skeleton.tsx` | `Skeleton` and `ProductCardSkeleton` |
| `section-heading.tsx` | Standalone section header with eyebrow/description/action |
| `rating-stars.tsx` | Fractional star display |
| `quantity-stepper.tsx` | Controlled min/max quantity control |
| `price.tsx` | Currency-aware price using `useUiStore` and `displayAmount` |
| `empty-state.tsx` | Icon/title/description/action placeholder |
| `status-badge.tsx` | `OrderStatusBadge`, `PaymentStatusBadge`, `ProductStatusBadge`, `RoleBadge` |

There is no `src/components/ui/index.ts` barrel; import primitives from their individual files.

Empty/reserved component folders: `src/components/checkout/` and `src/components/product/`.

### 5.5 Data, hooks, lib, services, stores, types

| Path | Purpose |
| --- | --- |
| `src/data/visuals.ts` | Curated Unsplash URLs, category visuals, testimonials, journal posts, trust points |
| `src/hooks/use-catalog.ts` | Query keys and hooks for products, product by slug, categories, brands, reviews |
| `src/hooks/use-debounced-value.ts` | Generic debounce hook used by searches/filters |
| `src/hooks/use-focus-trap.ts` | Focus trapping for dialogs/drawers |
| `src/hooks/use-hydrated.ts` | Mount detection to avoid SSR/client mismatch |
| `src/hooks/use-media-query.ts` | `useMediaQuery` and `usePrefersReducedMotion` |

`src/lib/`

| File | Purpose |
| --- | --- |
| `api/client.ts` | Axios `apiClient`, bearer token from auth store, single-flight 401 refresh, `apiRequest<T>`, `ApiClientError`, `isUnauthorized`, `isForbidden` |
| `api/index.ts` | Re-exports client + services |
| `api/services.ts` | Typed endpoint wrappers: auth, users, customers, categories, brands, products, images, discounts, reviews, cart, wishlist, addresses, orders, payments, coupons, notifications, inventory, analytics, accounting, expenses, investments, employees, salaries, audit, uploads, banners |
| `auth-client.ts` | `adoptGuestState()` merges local guest cart/wishlist into the server after sign-in |
| `auth-routing.ts` | `safeNextPath()` open-redirect guard and `roleHome()` role router |
| `click-sound.ts` | Web Audio click sounds; respects reduced motion |
| `constants.ts` | `SITE`, `API_BASE_URL`, currency/shipping values, nav arrays, status enums/labels, order transitions |
| `form-resolver.ts` | Adapter that makes the Zod 4 schema compatible with React Hook Form |
| `payments.ts` | Online-payment helpers, 5 s polling interval, 2 min timeout, redirect URL safety checks |
| `product-options.ts` | Derives color swatches and size runs from product copy because the catalog has no variant model |
| `slug.ts` | `slugify()` and SKU generation |
| `utils.ts` | `cn()`, currency/number/date/relative-time formatting, initials, error extraction, image optimization check, query builder |
| `validations.ts` | Zod schemas for auth, account, checkout, review, product query, and all admin forms |

| Path | Purpose |
| --- | --- |
| `src/services/catalog.ts` | Server-safe public fetch layer with per-request revalidate and safe empty fallbacks; used by RSC pages and sitemap |
| `src/services/products.ts` | Thin wrappers around `productsApi.list` for search/list; currently not imported by any route |

`src/stores/` — Zustand persist keys

| File | localStorage key | Purpose |
| --- | --- | --- |
| `auth-store.ts` | `aether-auth` | Access/refresh tokens, user, session setters, `clearSession`, role helpers |
| `cart-store.ts` | `aether-cart` | Guest cart lines; calls `cartApi` for signed-in customers; `syncFromServer` |
| `wishlist-store.ts` | `aether-wishlist` | Persisted product IDs; server sync after auth; toggle/clear |
| `recently-viewed-store.ts` | `aether-recently-viewed` | Persisted product ID history |
| `ui-store.ts` | `aether-ui` | Search dialog, cart drawer, display currency |
| `sound-store.ts` | `aether-sound` | UI sound enabled flag |
| `theme-store.ts` | `aether-theme` | Legacy `light / dark / system` theme store; active UI uses `ThemeProvider` instead |

`src/types/`

| File | Purpose |
| --- | --- |
| `api.ts` | All backend-aligned enums, entities, inputs, pagination envelopes, orders, payments, analytics, finance, banners |
| `ui.ts` | Product sort/query types and helpers such as `productName`, `productPrimaryImage`, `hasDiscount`, `mapSort` |
| `index.ts` | Re-exports API + UI types |

---

## 6. Home page data flow

`src/app/(storefront)/page.tsx` is a **Server Component** with `export const revalidate = 120`.

### Step-by-step

1. It calls six functions from `src/services/catalog.ts` in parallel with `Promise.all`:
   - `getFeaturedProducts(8)`
   - `getTrendingProducts(8)`
   - `getNewArrivals(8)`
   - `getCategories()`
   - `getBrands()`
   - `getActiveBanners()`
2. `catalog.ts` issues plain `fetch()` calls against the public Express endpoints and unwraps `{ success, data }` envelopes. If an endpoint fails, each getter returns `[]` so the home page still renders.
3. The page derives:
   - `heroProducts = featured || trending || newArrivals`
   - `newArrivalItems = first 8 new arrivals, otherwise first 8 featured`
   - `promoBanners = banners where placement === "PROMO"`
4. It emits `Organization` JSON-LD from `SITE`, then passes plain arrays into presentational sections.

### Section-by-section

| Section | Input | Client/server | Behavior |
| --- | --- | --- | --- |
| `HeroBanner` | `products: Product[]` | Client | Derives its own category chips from the passed products; local search, category, featured, in-stock, and sort state; no extra API call; renders product cards with `SmartImage` and `Price` |
| `CategoryGrid` | `categories: Category[]` | Client | Keeps categories with `productCount > 0`, shows first 6 as tabs; on tab change runs `productsApi.list({ category, inStock: true, limit: 4, sortBy: "soldCount" })` via TanStack Query; skeleton/error/retry states; links to `/products` |
| `NewArrivals` | `products: Product[]` | Server | `SectionHeading` + `ProductGrid`; link to `/products?sort=newest`; custom empty copy |
| `BrandShowcase` | `brands: Brand[]` | Server | First 8 brands, `SmartImage` logo/cover, links to `/products?brand=<slug>` |
| `PromoBanners` | filtered `Banner[]` | Server | Splits internally by `HERO`/`PROMO`, checks external URLs, renders `SmartImage` cards; returns `null` when empty |
| `NewsletterSection` | none | Server + client form | Editorial copy around `NewsletterForm` |

**Important nuance:** admin banners can use `HERO` or `PROMO` placement, but the home page only passes `PROMO` banners to `PromoBanners`; `HeroBanner` is product-driven and does not consume `HERO` banners.

---

## 7. Core storefront flows

### Product details

1. `/products/[slug]` fetches the product with `catalog.productBySlug()` and related products with `catalog.products()`.
2. It emits `Product` JSON-LD and renders `ProductDetail`.
3. `ProductDetail` is a client component:
   - Builds gallery thumbnails from product images.
   - Calls `productColors()` and `productSizes()` from `src/lib/product-options.ts`.
   - Requires a color and/or size selection before allowing add-to-cart when options exist.
   - Clamps quantity to stock.
   - Calls `useCartStore.addItem(product, quantity)` and `useWishlistStore.toggle(product.id, name)`.
   - “Buy now” adds to cart then pushes `/checkout`.
   - Records the product in the persisted recently-viewed store, renders `ReviewForm` and `ReviewList`, and the route renders the `RecentlyViewed` row underneath.
4. `addItem` writes directly to the server cart for signed-in `CUSTOMER` users and to the persisted local cart for guests.

### Cart

- `CartView` reads `useCartStore.items`.
- Guests get a local persisted cart in `aether-cart`; signed-in customers get server cart lines via `cartApi`.
- Quantity changes, removals, and clear all go through the store, which branches on customer role.
- `CartDrawer` is the header drawer version; it also shows progress toward `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD`.
- Checkout is customer-only; the cart page itself can be used by guests.

### Wishlist

- `WishlistView` reads persisted IDs from `useWishlistStore`.
- Each ID is fetched with `productsApi.get(id)` via TanStack Query.
- Removal updates the store (and server wishlist for signed-in customers); “Clear all” uses a `ConfirmDialog`.
- The same component is reused at `/account/wishlist`.

### Checkout

`CheckoutView` is gated: a user must be hydrated, signed in, and have the `CUSTOMER` role.

1. Loads addresses (`addressesApi.list`), payment providers (`paymentsApi.providers`), and the current cart lines.
2. Supports creating a new address inline via `addressesApi.create`.
3. Validates coupon codes with `couponsApi.validate`.
4. Checks provider availability before allowing online payment; card also requires a backend publishable key.
5. Calls `ordersApi.checkout({ addressId, paymentMethod, couponCode, notes })`.
6. Resets the cart and invalidates `["orders"]` / `["notifications"]`.
7. Branches by payment method:
   - **Cash on delivery** → order is complete; redirect to `/account/orders/:id`.
   - **Card** → use `clientSecret` in `StripePaymentDialog`; if already processing, go to order page.
   - **bKash / Nagad** → validate redirect URL with `getSafePaymentRedirectUrl()` and navigate to the gateway.
   - If initiation fails, the order is still saved and the user is sent to the order page to retry.
8. `/account/orders/:id` polls pending online payments every 5 seconds for up to 2 minutes, handles Stripe reconciliation through `/dashboard/orders/:id`, supports cancellation in allowed states, and offers an HTML/print receipt.

---

## 8. Auth and account flows

- **Login/register** use React Hook Form + Zod, call `authApi.login/register`, persist the session with `setSession()`, merge guest cart/wishlist via `adoptGuestState()`, then redirect with `safeNextPath(next, roleHome(role))`.
- **Google OAuth** is backend-driven: `GoogleAuthButton` navigates to `${API_BASE_URL}/auth/google`; `/auth/callback` receives `accessToken`/`refreshToken` in the query string, verifies with `authApi.me()`, and redirects by role.
- **Session sync** in `AppProviders` calls `authApi.me()` on load when a token exists; failures clear the session. Cart/wishlist are re-synced for customers.
- **Token refresh** happens once per 401 via a shared `refreshPromise`; auth endpoints are excluded from refresh.
- **Role guards** protect account/admin/super-admin screens in the browser. The backend remains the real authorization boundary.
- **Password reset is intentionally manual.** `/forgot-password` prepares a support email; `/reset-password` is a placeholder. Signed-in users can change passwords at `/account/security`.
- **Currency** is a display-only conversion: amounts arrive in BDT; USD uses the static `NEXT_PUBLIC_USD_TO_BDT` rate.

---

## 9. Admin and super-admin

### Common admin pattern

Almost every admin screen follows this recipe:

1. Thin route file renders a component from `src/components/admin`.
2. `RoleGuard` checks the user role.
3. TanStack Query loads lists/details from `src/lib/api/services.ts`.
4. React Hook Form + a Zod schema from `src/lib/validations.ts` drives add/edit forms.
5. Mutations show `sonner` toasts, invalidate query keys, and often use optimistic cache updates with rollback.
6. Destructive actions use `ConfirmDialog`.
7. Uploads go through `uploadsApi.uploadImage(file, folder)` or product-image endpoints.

### Required CRUD areas

| Area | List | Add | Edit | Notes |
| --- | --- | --- | --- | --- |
| Products | `/admin/products` → `ProductsAdmin` | `/admin/products/new` | `/admin/products/:id/edit` | `ProductForm` handles title, slug, SKU, category, brand, descriptions, pricing, stock, status, featured flag, optional 3D model URL, and images. New products are created as `DRAFT`, images uploaded, then final status applied. |
| Categories | `/admin/categories` → `CategoriesAdmin` | `/admin/categories/new` | `/admin/categories/:id/edit` | Shared `TaxonomyForm`; name, slug, description, image; active toggle and delete |
| Brands | `/admin/brands` → `BrandsAdmin` | `/admin/brands/new` | `/admin/brands/:id/edit` | Same shared taxonomy form with logo upload; active toggle and delete |
| Banners | `/admin/banners` → `BannersAdmin` | `/admin/banners/new` | `/admin/banners/:id/edit` | Title, subtitle, destination, `HERO`/`PROMO` slot, sort order, active flag, image or URL; active toggle and delete |
| Coupons | `/admin/coupons` → `CouponsAdmin` | `/admin/coupons/new` | `/admin/coupons/:id/edit` | Exactly one of percent/fixed discount, usage/minimum/maximum rules, date range, active flag; validate, toggle, delete |
| Orders | `/admin/orders` → `OrdersAdmin` | — | — | Status transitions from `ORDER_TRANSITIONS`, `OrderDetailDialog`, COD `CashCollectionDialog`, receipt, admin list filters |

### Other admin pages

| Route | Purpose |
| --- | --- |
| `/admin` | KPI overview and recent activity |
| `/admin/inventory` | Stock overview, low-stock filter, adjustments, movement history |
| `/admin/customers` | Read-only customer directory |
| `/admin/reviews` | Approve/unpublish/delete customer reviews |
| `/admin/expenses` | Create operating expenses; admins cannot self-approve |
| `/admin/notifications` | Shared notification inbox |

### Super-admin pages

| Route | Purpose |
| --- | --- |
| `/super-admin` | Business-wide overview |
| `/super-admin/analytics` | Sales, orders, payments, catalog charts |
| `/super-admin/accounting` | Profit, expenses, reports, order profit |
| `/super-admin/transactions` | Full ledger with export |
| `/super-admin/users` | User list, create admin, role/status changes |
| `/super-admin/expenses` | Same expense screen with `canApprove` enabled |
| `/super-admin/discounts` | Product discount campaigns and schedules |
| `/super-admin/investments` | Capital investments |
| `/super-admin/employees` | Team roster |
| `/super-admin/salaries` | Payroll records and mark-paid flow |
| `/super-admin/notifications` | Shared notification inbox |
| `/super-admin/audit` | Immutable privileged-action log |

Admin and super-admin layouts set `robots: { index: false, follow: false }`.

---

## 10. Environment reference

Only `NEXT_PUBLIC_*` values belong in this frontend. They are compiled into the browser bundle. Payment secrets and database credentials belong in the backend.

| Variable | Example / default | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api/v1` | Axios `baseURL` and server-side catalog `fetch()` base |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Metadata base, canonical URLs, sitemap, auth redirects |
| `NEXT_PUBLIC_STORE_NAME` | `Aether` (example) / `JAMI` (`.env`) | Storefront identity in constants |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `support@example.com` | Footer, support links, forgot-password mailto |
| `NEXT_PUBLIC_CONTACT_PHONE` | `+880 1000 000000` | Storefront contact details |
| `NEXT_PUBLIC_STORE_ADDRESS` | `Dhaka, Bangladesh` | Storefront/footer copy |
| `NEXT_PUBLIC_CURRENCY` | `BDT` | Default display currency (`BDT` or `USD`) |
| `NEXT_PUBLIC_BASE_CURRENCY` | `BDT` | Backend base currency label |
| `NEXT_PUBLIC_USD_TO_BDT` | `120` | Static FX conversion used by the header toggle |
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` | `1000` | Free-shipping progress and checkout messaging |
| `NEXT_PUBLIC_SHIPPING_FLAT_RATE` | `60` | Displayed shipping estimate |

Shipping and currency values must match backend configuration. Google OAuth also requires the backend to be configured for the client origin.

---

## 11. Roadmap / known next features

### 1. Dynamic category-wise product sections with admin toggles

**Current state:** the home page requests featured/trending/new-arrival products globally. `CategoryGrid` shows up to six categories with `productCount > 0` and fetches four preview products for whichever tab the visitor selects. There is no admin control over which category sections appear, their order, their titles, or their product limits.

**Planned shape:**

- Add an admin-managed “home sections” model: category, section title/eyebrow, product limit, sort order, visibility toggle, and display order.
- Expose it through a `homeApi` service and a `/admin/home-sections` screen with add/edit/reorder/toggle controls.
- Have the home RSC fetch enabled sections and render one product row per configured category.
- Keep the existing safe fallback behavior so an empty configuration still renders a useful storefront.

### 2. Real product size/color variants before add-to-cart and checkout

**Current state:** `src/lib/product-options.ts` infers colors from product title/description/image alt text and infers generic size runs from category/title text. `ProductDetail` requires a selection when options exist, but the chosen values are not stored in the cart line, do not affect SKU/stock/price, and do not reach checkout/order items.

**Planned shape:**

- Add real backend variants: `id`, `productId`, `sku`, `color`, `size`, `priceAdjustment`, `stock`, and optional variant images.
- Update admin product forms so variants are created and maintained explicitly instead of inferred from copy.
- Change cart lines to carry `variantId`; validate stock and price on the server at add-to-cart and checkout.
- Show the selected size/color in the cart drawer, cart page, checkout summary, order detail, and receipts.
- Require a valid variant selection before a customer can add an item or proceed to checkout.

---

## 12. Mutation conventions

Every write must update the UI automatically — a successful action should never
require a manual browser refresh. **Never call `window.location.reload()`.**
`router.refresh()` is reserved for form pages that navigate away, where it
refreshes server-rendered page data; it is not a substitute for cache
invalidation.

### Central keys

Build every `queryKey` from `src/lib/query-keys.ts`. The factories cover lists,
details, counts, stats and analytics, so invalidating `queryKeys.orders.all`
also refreshes `queryKeys.orders.mine(params)` and every nested order query.
`relatedKeys(domain)` returns the whole group of caches affected by a domain
(e.g. a product delete refreshes products, admin products, discounts, inventory
and analytics).

### The shared helper

Use `useOptimisticMutation` from `src/hooks/use-optimistic-mutation.ts` for new
mutations and when refactoring existing ones. It enforces this order:

1. `onMutate` — cancel in-flight fetches, snapshot caches, apply the optimistic
   patch immediately.
2. `onError` — restore the snapshot, show an error toast.
3. `onSuccess` — show a success toast, then run caller callbacks (close the
   dialog, navigate, reset local state).
4. `onSettled` — invalidate all related keys, including notifications and
   analytics, so counts and badges reconcile with the server.

```tsx
const mutation = useOptimisticMutation({
  mutationFn: (coupon: Coupon) => couponsApi.updateStatus(coupon.id, !coupon.isActive),
  optimisticKeys: [queryKeys.coupons.list({ search: debounced, filter })],
  applyOptimistic: (current, coupon) =>
    (current as Coupon[] | undefined)?.map((row) =>
      row.id === coupon.id ? { ...row, isActive: !row.isActive } : row,
    ),
  invalidateKeys: relatedKeys("coupons"),
  successMessage: (_, coupon) => (coupon.isActive ? "Coupon disabled" : "Coupon enabled"),
  errorMessage: "Could not update the coupon",
});
```

Server-first mutations can adopt the helper with only `mutationFn`,
`invalidateKeys` and `successMessage` — optimism is opt-in.

### Rules

- **Related caches:** include list + detail + count + stat + notifications +
  analytics keys. Notification-producing actions (orders, payments) must
  invalidate `queryKeys.notifications.all` **and**
  `queryKeys.notifications.unreadCount()` so the header badge updates.
- **Pagination:** after deleting the last row on a page, clamp the page with
  `clampPage(page, totalItems, pageSize)` so the list does not go blank.
- **Zustand stores:** update local state synchronously, then reconcile with the
  server response in `onSettled`. Roll back the snapshot on error (cart `clear`
  must restore its items if the API call fails).
- **Buttons and dialogs:** every mutation button uses `loading={mutation.isPending}`
  and is disabled while pending; `ConfirmDialog` closes in `onSuccess`.
- **Toasts:** show errors via `getErrorMessage(error, fallback)`; never swallow a
  failed write silently.
- **Auth/OAuth:** session changes still call `router.refresh()` after the
  navigation because they change server-rendered layout data.

The implementation inventory and checklist live in `docs/redesign-audit.md`.

---

## 13. Honest caveats / gotchas

- **Newsletter is simulated.** `NewsletterForm` validates with Zod and waits 650 ms before showing success; no subscription API exists yet.
- **Password reset is manual.** There are no reset-token endpoints; support verifies ownership and resets out of band.
- **Three.js is not in the live home path.** `HeroCanvas`, `HeroScene`, and `ProductWallScene` exist but are not imported by current pages. The live hero is the 2D, product-driven `HeroBanner`.
- **Password reset page is a placeholder.** It ignores query parameters and always shows “No reset token found”.
- **Image limits differ by component.** Product gallery dialog allows 10 files per upload; product media field allows 20 images per product; shared entity image field allows 5 MB per file. Keep these in mind when changing upload UX.
- **Reviews search is page-local.** `ReviewsAdmin` filters only the current server page, not all reviews.
- **Discounts view does extra queries.** Because the product list exposes only active discounts, `DiscountsView` fetches details per visible product to include scheduled/expired campaigns.
- **Theme code is duplicated.** `ThemeProvider` (`light`/`dark`) is active; `src/stores/theme-store.ts` with `light | dark | system` is legacy/unused by current components.
- **`SectionHeading` is exported twice**, from `ui/card.tsx` and `ui/section-heading.tsx`, with slightly different prop types.
- **Role guards are UX only.** Always enforce authorization in the API.
- **OAuth tokens pass through the client URL** at `/auth/callback`; backend OAuth configuration is required.
- **Currency conversion is static**, not a live FX feed.
- **Notification badge depends on `notificationsApi.list({ limit: 1 })`** succeeding in `DashboardShell`.
- **Banners with `HERO` placement are currently not rendered on the home page**, even though admins can create them.

---

## 14. Where to make common changes

| Task | Start here |
| --- | --- |
| Change home sections or their order | `src/app/(storefront)/page.tsx`, `src/components/home/`, `src/services/catalog.ts` |
| Add/adjust storefront filters | `src/app/(storefront)/products/page.tsx`, `src/components/storefront/product-filters.tsx`, `src/lib/validations.ts` |
| Change product form fields | `src/components/admin/products/product-form.tsx`, `src/lib/validations.ts`, `src/lib/api/services.ts` |
| Change checkout or payment behavior | `src/components/storefront/checkout-view.tsx`, `src/lib/payments.ts`, `src/components/payments/stripe-payment-dialog.tsx`, `src/components/account/order-detail.tsx` |
| Add an admin CRUD screen | Copy the pattern in `src/components/admin/taxonomy/` or `admin/banners/`, add a thin route in `src/app/admin/`, and add services in `src/lib/api/services.ts` |
| Change navigation | `src/lib/constants.ts` (`MAIN_NAV`, `ADMIN_NAV`, etc.), `src/components/navbar/`, `src/components/dashboard/` |
| Change currency/shipping/contact defaults | `.env.local` (or `.env`), then verify backend values match |
| Add a Shadcn-style primitive | `components.json` for aliases/style, then add a wrapper in `src/components/ui/` |
| Add a new public image host | `images.remotePatterns` in `next.config.ts` |

---

## 15. Mental model for new contributors

1. **Pages are thin.** Most behavior lives in `src/components`.
2. **Public reads on the server use `catalog.ts`**; everything else uses `apiClient` through `services.ts`.
3. **TanStack Query owns server data**; Zustand owns guest/local UI state.
4. **All writes hit the Express API.** The browser never talks directly to Prisma or payment secrets.
5. **Forms share Zod schemas** with the admin/account layers.
6. **The backend is the source of truth** for authorization, stock, totals, coupons, and payment status. The client can be optimistic, but it must always reconcile with the API response.
