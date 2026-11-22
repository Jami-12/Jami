# Store Storefront (`client`)

Next.js App Router frontend for the Store/JAMI commerce platform: a public storefront, customer account area, admin console, and super-admin back office. All catalog, cart, order, payment, and account data comes from the sibling Express + Prisma API at `http://localhost:4000/api/v1`. There is no mocked checkout or fake authentication.

---

## 1. Requirements

- Node.js `>=20.9.0` (declared in `package.json`)
- pnpm 9+ (`pnpm-lock.yaml`, `pnpm-workspace.yaml`)
- The sibling `server/` API running with CORS allowing the storefront origin

## 2. Local setup

```bash
# from D:\E commerce Shop\client
pnpm install
cp .env.example .env.local
pnpm dev
```

Open <http://localhost:3000>. A committed `.env` already contains local defaults (`NEXT_PUBLIC_STORE_NAME=JAMI`); `.env.local` overrides it and is the recommended place for local changes.

### Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint 9 flat config (`eslint.config.mjs`) |
| `pnpm typecheck` | `tsc --noEmit` |

Validation used for this project: `pnpm lint` and `pnpm build`.

## 3. Environment variables

From `.env.example` (all are public `NEXT_PUBLIC_*` values):

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api/v1` | Backend API base URL |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical storefront URL (SEO) |
| `NEXT_PUBLIC_STORE_NAME` | `Store` | Brand name |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `support@example.com` | Contact email |
| `NEXT_PUBLIC_CONTACT_PHONE` | `+880 1000 000000` | Contact phone |
| `NEXT_PUBLIC_STORE_ADDRESS` | `Dhaka, Bangladesh` | Contact address |
| `NEXT_PUBLIC_CURRENCY` | `BDT` | Display currency |
| `NEXT_PUBLIC_BASE_CURRENCY` | `BDT` | Base currency before conversion |
| `NEXT_PUBLIC_USD_TO_BDT` | `120` | USD → BDT display conversion rate |
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` | `1000` | Product subtotal at which shipping becomes free |
| `NEXT_PUBLIC_SHIPPING_FLAT_RATE` | `60` | Flat shipping charge below the threshold |

These must stay aligned with the server's `FREE_SHIPPING_THRESHOLD` and `SHIPPING_FLAT_RATE`. Shipping is always displayed as a separate line item and is never included in product prices or product subtotals.

## 4. Tech stack

| Area | Libraries |
| --- | --- |
| Framework | Next.js `16.4.5`, React `19.3.0`, TypeScript `5.9.3` |
| Styling | Tailwind CSS `4.3.4`, `@tailwindcss/turbopack`, `tw-animate-css` |
| UI | Radix/Base UI primitives, Shadcn-style wrappers in `src/components/ui`, Lucide icons |
| Server state | TanStack Query `^5.105.3` (30 s stale, 5 min gc, 1 retry, no refocus refetch) |
| Client state | Zustand `^5.0.8` (auth, cart, wishlist, recently viewed, UI flags) |
| Forms | React Hook Form `^7.91.0`, Zod `4.6.7` |
| HTTP | Axios `^1.21.0` with bearer token and refresh-on-401 |
| Animation | Framer Motion `14.9.1` |
| Charts | Recharts `3.8.0` |
| 3D | Three.js `0.187.0`, `@react-three/fiber` `9.8.2`, `@react-three/drei` `10.7.9` (lazy scenes, not mounted by default) |
| Payments | `@stripe/stripe-js`, `@stripe/react-stripe-js` |
| SEO | Metadata, `manifest.ts`, `robots.ts`, `sitemap.ts`, JSON-LD |

No AI/OpenAI SDK is used by the client.

## 5. Architecture

```text
Browser
 ├─ Server Components ── src/services/catalog.ts ── fetch ──> public API catalog
 ├─ Client Components ── TanStack Query ── src/lib/api/services.ts ── Axios ──> API
 ├─ Zustand stores ── localStorage (guest cart/wishlist, session, UI)
 └─ Express + Prisma API ── all writes and all account/admin data
```

- `src/app` — routes; `(auth)` and `(storefront)` are URL-less route groups.
- `src/components` — feature UI; `src/components/ui` — shared primitives.
- `src/lib/api` — typed Axios service objects; `src/services` — server-safe catalog reads.
- `src/stores` — persisted client state; `src/types` — API-aligned contracts.
- `src/lib/validations.ts` — shared Zod form schemas.
- Provider chain: `QueryClientProvider` → `ThemeProvider` → `SiteSettingsProvider` → `SessionSync` → `SoundProvider` → toasts.

Payment status polling for in-flight payments uses a 3 s interval and stops after 90 s (`src/lib/payments.ts`).

## 6. Routes

### Storefront

`/`, `/products`, `/products/[slug]`, `/cart`, `/checkout`, `/wishlist`

### Auth

`/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/callback`

### Customer account

`/account`, `/account/orders`, `/account/orders/[id]`, `/account/profile`, `/account/addresses`, `/account/wishlist`, `/account/notifications`, `/account/security`, `/account/notepad`

### Admin

`/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/categories` (+ `/new`, `/[id]/edit`), `/admin/brands` (+ `/new`, `/[id]/edit`), `/admin/banners` (+ `/new`, `/[id]/edit`), `/admin/coupons` (+ `/new`, `/[id]/edit`), `/admin/orders`, `/admin/inventory`, `/admin/customers`, `/admin/reviews`, `/admin/expenses`, `/admin/notifications`, `/admin/cash-collection`, `/admin/home-sections`, `/admin/notepad`, `/admin/receipt-settings`

### Super-admin

`/super-admin`, `/super-admin/analytics`, `/super-admin/accounting`, `/super-admin/transactions`, `/super-admin/users`, `/super-admin/expenses`, `/super-admin/discounts`, `/super-admin/investments`, `/super-admin/employees`, `/super-admin/salaries`, `/super-admin/notifications`, `/super-admin/audit`, `/super-admin/settings`, `/super-admin/notepad`

### Dashboard compatibility

`/dashboard` (role redirect), `/dashboard/orders/[id]` (payment-provider return)

## 7. Features

- Server-rendered catalog with search, filters, sorting, product detail, related products, and JSON-LD.
- Guest cart/wishlist stored locally and synchronized to the server after sign-in.
- Customer-only checkout with cash on delivery, bKash, Nagad, and Stripe card payments; payment status polling on the order page.
- Account area: orders with printable receipts, addresses, profile, notifications, security, notepad.
- Admin: catalog/banner/coupon CRUD, order management, COD collection, cash collection cards, inventory, customers, reviews, expenses, home-section visibility, receipt settings.
- Super-admin: analytics, accounting and ledger, users, discounts, investments, employees, salaries, audit, settings.
- Theme/currency toggles, responsive layouts from 360 px upward, SEO metadata and sitemap.

Money display keeps **Product Subtotal**, **Discount**, **Shipping**, and **Total** as distinct lines everywhere (cart, checkout, order detail, receipts). Coupons and discounts never alter shipping; the free-shipping threshold is based on the product subtotal, matching the server.

## 8. Deployment

This client is already deployed and is a standard Next.js application; no Vercel reconfiguration is part of this project. For a fresh deployment: set the environment variables above, use pnpm, build with `pnpm build`, and configure the host to run `pnpm start`. Point `NEXT_PUBLIC_API_URL` at the deployed backend, and make sure the backend's `CORS_ORIGIN` includes the deployed storefront origin.
