# Aether Storefront

A production-oriented Next.js storefront and back office for **Aether**, a design-led commerce house. The UI is built with the App Router, TypeScript, Tailwind CSS, TanStack React Query, Zustand, React Hook Form + Zod, Framer Motion, and a lazy-loaded React Three Fiber hero with 2D and reduced-motion fallbacks.

This client talks to the Express + Prisma API in the sibling `server` workspace. All catalogue, order, payment, accounting and user data comes from the live API — there is no mocked checkout or fake authentication.

## Requirements

- Node.js 20.9+
- pnpm 9+
- The backend running at `http://localhost:4000` (API base `http://localhost:4000/api/v1`)

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Only `NEXT_PUBLIC_*` values are read by the frontend. Payment secrets and database credentials stay in the backend environment.

### Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run `tsc --noEmit` |

## What is included

### Storefront

- Home page with live featured/trending products, category grid, editorial journal and testimonials
- Catalogue with search, category/brand filters, price range, sorting, pagination and SEO metadata
- Product pages with an interactive gallery, 3D presentation, related products, reviews and JSON-LD
- Cart and wishlist with local guest state that is adopted into the server state after sign-in
- Checkout with saved-address selection, address creation, coupon validation, shipping estimates and bKash, Nagad, card (Stripe) and cash-on-delivery flows
- Honest payment-return handling through `/dashboard/orders/[id]` and `/account/orders/[id]`
- Google OAuth callback handling at `/auth/callback`
- Responsive, keyboard-accessible navigation, empty/loading/error states and destructive-action confirmations

### Customer account

`/account` — overview, orders and order detail, profile, address book, wishlist, notifications and security (password change).

### Admin

`/admin` — overview, products and image uploads, orders, inventory adjustments and history, categories, brands, coupons, reviews and expenses. Admins can create expenses but cannot self-approve them.

### Super admin

`/super-admin` — business overview, analytics, accounting reports, the full transaction ledger (CSV export), user and role management, expense approvals, investments, employees, payroll and the audit trail. These areas are protected by a super-admin role guard.

## Architecture

```
src/
  app/                 App Router routes and metadata
  components/
    storefront/        Catalogue, product, cart, checkout and home sections
    account/           Customer dashboard views
    admin/             Admin and super-admin views
    dashboard/         Role shells, navigation, tables and shared cards
    three/             Lazy 3D hero with WebGL detection
    ui/                Buttons, dialogs, inputs, prices, pagination, etc.
  hooks/               Query hooks, debounce, hydration, media queries
  lib/
    api/               Axios client and the typed API service layer
    constants.ts       Site config, enums, labels, navigation, transitions
    validations.ts     Zod schemas shared by auth and back-office forms
  services/            Server-safe catalogue fetchers for RSC pages
  stores/              Persisted auth, cart, wishlist and UI Zustand stores
  types/               API-aligned TypeScript contracts
```

### Data and auth behaviour

- React Query owns server state; Zustand owns cart, wishlist, auth and UI preferences.
- The Axios client attaches the access token and refreshes it once on a `401`.
- Guest cart/wishlist items remain local and persist across reloads. After login or registration they are merged into the authenticated server cart/wishlist.
- Payment initiation follows the backend contract: bKash and Nagad return a redirect URL, card returns a Stripe client secret and requires reconciliation after confirmation, and cash on delivery creates the order immediately.
- Order cancellation is only offered while an order is `PENDING` or `CONFIRMED`, matching backend transitions.
- Product images are uploaded separately after a product exists; a product needs at least one image or thumbnail.
- The backend exposes no password-reset endpoints. The forgot-password screen states this plainly and directs users to contact support instead of pretending an email was sent.

## Environment

See `.env.example`. Values that change shipping or currency behaviour must match the backend configuration.

## Notes

- 3D content is lazy-loaded, detects WebGL support and falls back to styled 2D artwork. It is skipped for reduced-motion preferences.
- Dashboards are client-rendered and guarded by role; the backend remains the source of authorization truth.
- All currency amounts arrive in the backend base currency (BDT) and can be displayed in USD via the header toggle.
