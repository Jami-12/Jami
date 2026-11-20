# Store storefront redesign audit

> **Scope:** Next.js 16.4.5 / React 19.3.0 / Tailwind 4.3.4 client at `D:\E commerce Shop\client`.
> **Reference image:** no MISTYPE screenshot was present in the session. The redesign follows the written design brief (grouped collapsible sidebar, soft active pills, round header icon buttons, notification popover, teal/amber semantic tokens, airy surfaces). Jost is the UI font; Fraunces is retained as the display font per the committed direction in `7eda04c`.
> **Baseline:** `pnpm typecheck` passes after a `noUncheckedIndexedAccess` fix in `src/components/account/account-overview.tsx`; `pnpm lint` passes with pre-existing React-Compiler warnings for react-hook-form `watch()`; `pnpm build` succeeds (55 static pages).

## 1. Route inventory

All paths are relative to the repo root. Route groups `(auth)` and `(storefront)` do not appear in URLs.

### Storefront (`src/app/(storefront)`)

| URL | File | Content | SEO / caching |
|---|---|---|---|
| `/` | `page.tsx` | Async home: settings, featured/trending/new/categories/brands/banners; `HeroSection`, `ProductFinder`, `AllCategoriesSection`, `CategoryProductSection[]`, `NewArrivals`, `BrandShowcase`, `PromoBanners`, `NewsletterSection`; Organization JSON-LD | inherits root metadata; indexable |
| `/products` | `products/page.tsx` | Zod-parsed `searchParams`, `ProductFilters`, `ProductGrid`, `Pagination`, ItemList JSON-LD | title/canonical; indexable |
| `/products/[slug]` | `products/[slug]/page.tsx` | Awaited `params`, Product JSON-LD, `ProductDetail`, related grid, `RecentlyViewed`; `notFound()` when missing | `generateMetadata`, `revalidate = 120` |
| `/cart` | `cart/page.tsx` | `CartView` | **noindex** |
| `/checkout` | `checkout/page.tsx` | `CheckoutView` | **noindex** |
| `/wishlist` | `wishlist/page.tsx` | `WishlistView` | canonical `/wishlist`; indexable |

Loading states: `(storefront)/loading.tsx`, `products/loading.tsx`, `products/[slug]/loading.tsx`.

### Auth (`src/app/(auth)`)

| URL | File | Content | SEO |
|---|---|---|---|
| `/login` | `login/page.tsx` | awaits `searchParams.next` → `LoginForm` | indexable |
| `/register` | `register/page.tsx` | awaits `searchParams.next` → `RegisterForm` | indexable |
| `/forgot-password` | `forgot-password/page.tsx` | `ForgotPasswordForm` | **noindex** |
| `/reset-password` | `reset-password/page.tsx` | guidance content | **noindex** |
| `/auth/callback` | `auth/callback/page.tsx` | `Suspense` + `AuthCallbackView` | **noindex** |

### Account — all **noindex** via `src/app/account/layout.tsx`

`src/app/account/page.tsx` (`AccountOverview`), `addresses/page.tsx` (`AddressBook`), `notifications/page.tsx` (`NotificationsView`), `orders/page.tsx` (`OrdersList`), `orders/[id]/page.tsx` (awaits `params` + `searchParams.paymentStatus` → `OrderDetailView`), `profile/page.tsx` (`ProfileForm`), `security/page.tsx` (`SecurityForm`), `wishlist/page.tsx` (`WishlistView`).

### Dashboard compatibility — all **noindex**

`src/app/dashboard/page.tsx` (`DashboardRedirect`), `dashboard/orders/[id]/page.tsx` (Stripe return → `PaymentReturnView`).

### Admin — all **noindex** via `src/app/admin/layout.tsx`

`admin/page.tsx` (`AdminOverview`); list screens for `banners`, `brands`, `categories`, `coupons`, `customers`, `expenses`, `home-sections`, `inventory`, `notifications`, `orders`, `products`, `reviews`; form routes `banners|brands|categories|coupons|products/(new|[id]/edit)` (all await `params`).

### Super-admin — all **noindex** via `src/app/super-admin/layout.tsx`

`super-admin/page.tsx` (`SuperOverview`); `accounting`, `analytics`, `audit`, `discounts`, `employees`, `expenses`, `investments`, `notifications`, `salaries`, `settings` (extra `RoleGuard SUPER_ADMIN` + noindex), `transactions`, `users`.

### Global state/utility routes

`src/app/layout.tsx` (root: Jost + theme boot script + `AppProviders` + skip link + metadata/viewport), `error.tsx` (client boundary, reset/home), `loading.tsx`, `not-found.tsx`, `manifest.ts`, `robots.ts` (disallows `/dashboard`, `/api`, `/checkout`, `/account`), `sitemap.ts` (`revalidate = 3600`), `favicon.ico`, `globals.css`.

**Route-level mutation finding:** no `page.tsx` or `layout.tsx` performs writes. `router.refresh()` appears only in client form components (login, register, auth callback, banner/category/brand/coupon/product forms, home-section toggles, store-logo form). No `revalidatePath`/`revalidateTag`/`updateTag` in `src/`.

## 2. Shared layouts, shells and providers

| File | Role |
|---|---|
| `src/components/providers/app-providers.tsx` | `QueryClientProvider` (staleTime 30s, gcTime 5m, retry 1, no refetch on focus) → `ThemeProvider` → `SiteSettingsProvider` → `SessionSync` → `SoundProvider` → children → `Toaster` |
| `src/components/providers/theme-provider.tsx` | light/dark context, `store-theme` localStorage, `THEME_SCRIPT` boot script, toggles `.dark` |
| `src/components/providers/site-settings-provider.tsx` | seeds `["settings"]` from server, `refresh()` via `settingsApi.get` |
| `src/components/dashboard/dashboard-layouts.tsx` | maps pathname to title/subtitle, picks Customer/Admin/Super shell |
| `src/components/dashboard/shells.tsx` | `ShellFrame`, `CustomerShell`, `AdminShell`, `SuperAdminShell` (role guards) |
| `src/components/dashboard/dashboard-shell.tsx` | sticky sidebar + header, grouped nav target, notification unread query, user menu, mobile drawer |
| `src/components/dashboard/page-section.tsx`, `data-table.tsx`, `stat-card.tsx`, `list-pagination.tsx` | shared dashboard presentation primitives |
| `src/app/(storefront)/layout.tsx` | announcement bar, `Navbar`, `<main id="main">`, `Footer`, `CartDrawer` |

## 3. UI primitives

Existing exported primitives in `src/components/ui/`: `avatar`, `badge`, `button`, `card`, `dialog` (incl. `ConfirmDialog`), `drawer`, `dropdown-menu`, `empty-state`, `input` (`Input`, `Textarea`, `Select`, `Label`, `FieldError`, `FieldHint`, `FormField`), `modal`, `pagination`, `price`, `quantity-stepper`, `rating-stars`, `section-heading`, `separator`, `skeleton` (`ProductCardSkeleton`), `smart-image`, `sonner`, `status-badge`, `switch`, `table`, `tabs`.

Newer shadcn registry parts already present: `accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `attachment`, `breadcrumb`, `bubble`, `button-group`, `calendar`, `chart`, `checkbox`, `collapsible`, `combobox`, `command`, `context-menu`, `direction`, `empty`, `field`, `form`, `hover-card`, `input-group`, `input-otp`, `item`, `kbd`, `label`, `marker`, `menubar`, `message`, `message-scroller`, `native-select`, `navigation-menu`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `sheet`, `sidebar`, `slider`, `spinner`, `textarea`, `toggle`, `toggle-group`, `tooltip`.

Added in this redesign: `icon-button.tsx` (`IconButton`), `chip.tsx` (`Chip`). There is intentionally **no** `src/components/ui/index.ts` barrel; import from individual files.

**Backward-compatibility rule:** keep all existing named exports and prop shapes. Restyle only via tokens/classes; add new primitives rather than replacing existing ones.

## 4. Mutation inventory

Legend: `inv` = invalidate, `opt` = optimistic `setQueryData` + rollback, `set` = direct cache write.

### 4.1 Admin / super-admin (`src/components/admin/**`)

| Area | File | Actions | API | Cache / refresh | Dialog/navigation & loading |
|---|---|---|---|---|---|
| Orders | `orders/orders-admin.tsx` | status update; record cash | `ordersApi.updateStatus`, `collectPayment` | `inv ["admin","orders"],["admin","order"],["order"],["notifications"]`; `set ["admin","order",id]` for cash | per-row loading; cash dialog closes; toasts |
| Products | `products/products-admin.tsx` | delete; toggle featured; toggle status | `productsApi.remove`, `update`, `updateStatus` | `opt ["admin","products"]` for toggles; `inv ["admin","products"],["products"]` | confirm closes; switch/button pending guards; toasts |
| Products | `products/product-form.tsx` | create/update + image upload/reorder/primary/remove | `productsApi.*`, `productImagesApi.*` | `inv ["admin","products"],["products"]` | `router.push` + `router.refresh()`; submit loading; confirm closes |
| Products | `products/product-images-dialog.tsx` | upload, make secondary, set primary, remove | `productImagesApi.*` | `inv ["product-images",id],["admin","products"],["products"]` | confirm closes; inputs disabled while pending |
| Users | `users-view.tsx` | save profile/role/status; create admin; delete | `usersApi.*` | `inv ["users"]` | dialogs close; confirm loading; toasts |
| Employees | `employees-view.tsx` | save; deactivate | `employeesApi.*` | `inv ["employees"],["salaries"],["accounting"]` | dialogs/confirm close; toasts |
| Salaries | `salaries-view.tsx` | create; pay; cancel | `salariesApi.*` | `inv ["salaries"],["expenses"],["accounting"]` | dialogs/confirm close; toasts |
| Expenses | `expenses-admin.tsx` | save; approve; cancel | `expensesApi.*`, `update` | `inv ["expenses"],["accounting"]` | dialogs/confirm close; role-aware toasts |
| Investments | `investments-view.tsx` | save; remove | `investmentsApi.*` | `inv ["investments"],["accounting"]` | dialogs/confirm close |
| Discounts | `discounts-view.tsx` | save; remove | `productDiscountsApi.*` | `inv ["products"],["admin","products"],["product-discount"]` | dialogs/confirm close |
| Inventory | `inventory-admin.tsx` | adjust stock | `inventoryApi.adjust` | `inv ["inventory"],["admin","products"]` | dialog closes; button loading |
| Reviews | `reviews-admin.tsx` | approve/unpublish; delete | `reviewsApi.update`, `remove` | `inv ["admin","reviews"],["reviews"]` | row loading; confirm closes |
| Banners | `banners/banners-admin.tsx` | toggle status; delete | `bannersApi.updateStatus`, `remove` | `opt ["admin","banners"]`; `inv ["admin","banners"],["public","banners"]` | switch pending; confirm closes |
| Banners | `banners/banner-form.tsx` | create/update (FormData) | `bannersApi.create`, `update` | `inv ["admin","banners"],["public","banners"]` | `router.push` + `refresh()` |
| Coupons | `coupons/coupons-admin.tsx` | toggle status; delete | `couponsApi.updateStatus`, `remove` | `opt ["admin","coupons",filters]`; `inv ["admin","coupons"]` | switch pending; confirm closes |
| Coupons | `coupons/coupon-form.tsx` | create/update | `couponsApi.create`, `update` | `inv ["admin","coupons"]` | `router.push` + `refresh()` |
| Taxonomy | `taxonomy/taxonomy-admin.tsx` (categories + brands) | toggle status; delete | `categoriesApi.*`, `brandsApi.*` | `opt [mode,debounced]`; `inv [mode],["categories"],["brands"]` | switch pending; confirm closes |
| Taxonomy | `taxonomy/taxonomy-form.tsx` | create/update (FormData) | `categoriesApi.*`, `brandsApi.*` | `inv [mode],["categories"],["brands"]` | `router.push` + `refresh()` |
| Home sections | `home-sections/section-toggle-card.tsx`, `category-sections-card.tsx` | toggle flags/categories | `settingsApi.update` | cancel + `opt ["settings"]` + `inv ["settings"]`; `setSettings`; `router.refresh()` | switches disabled while pending |
| Settings | `settings/profile-settings-form.tsx` | avatar upload + profile save (manual handler) | `uploadsApi.uploadImage`, `usersApi.updateMe` | `set ["users","me"]` only — **missing invalidation** | `loading`, disabled |
| Settings | `settings/store-logo-form.tsx` | site name/logo save (manual handler) | `settingsApi.update` | `set ["settings"]` + `inv ["settings"]`; `router.refresh()` | busy guard |

Pure pass-through wrappers with no mutations: `categories/*`, `brands/*`, `home-sections/home-sections-control.tsx`, `shared/image-upload-field.tsx`, overview/analytics/accounting/audit/customers/transactions views.

### 4.2 Account (`src/components/account/**`)

| File | Actions | Cache | Notes |
|---|---|---|---|
| `address-book.tsx` | create, update, remove, make-default | `inv ["addresses"]` | dialogs close; per-id pending; toasts |
| `notifications-view.tsx` | mark one read, mark all read, delete | `inv ["notifications"]` | **needs unread badge sync**; confirm closes; markAll disabled at zero |
| `order-detail.tsx` | cancel order, retry payment, Stripe resolve | `inv ["order",id],["orders"],["notifications"]` | confirm closes; external redirect; status toasts |
| `profile-form.tsx` | avatar upload, save profile | no invalidation | `setUser`; local preview; toasts |
| `security-form.tsx` | change password | no invalidation | confirm closes; toast |
| `payment-return-view.tsx` | Stripe reconcile | `inv ["order",id],["orders"],["notifications"]` | one-shot guard |

Read-only: `account-overview.tsx`, `orders-list.tsx`.

### 4.3 Storefront (`src/components/storefront/**`)

| File | Actions | Cache | Notes |
|---|---|---|---|
| `checkout-view.tsx` | add address, validate coupon, place order, initiate payment | `inv ["addresses"]`, `["orders"]`, `["notifications"]` | dialog closes; cart reset after success; double-submit guard; navigation |
| `cart-view.tsx` | quantity, remove, clear | Zustand store only | customer server-first; guest immediate; **clear is local even when API fails** |
| `wishlist-view.tsx` | clear | Zustand store only | immediate local |
| `review-form.tsx` | submit review | `inv ["product-reviews",id]` | toast; reset fields |
| `review-list.tsx` | edit/delete own review | `inv ["product-reviews",id],["products",id]` | dialog/confirm close |
| `product-card.tsx`, `quick-view-dialog.tsx`, `product-detail.tsx`, `wardrobe-rail.tsx` | add to bag/wishlist, buy now, recently viewed | Zustand stores | store-owned toasts; navigation on buy-now |
| `newsletter-form.tsx` | simulated subscribe (local timeout only) | — | **no API contract exists**; leave untouched |

### 4.4 Auth, layout, providers and stores

- `auth/login-form.tsx`, `register-form.tsx`, `auth-callback-view.tsx`: session writes + guest-state adoption + `router.replace` + `router.refresh()`.
- `layout/cart-drawer.tsx`: store quantity/remove/close; `navbar/*` and `layout/*` toggles are local UI state.
- `payments/stripe-payment-dialog.tsx`: Stripe confirm + `paymentsApi.reconcileCard`.
- `providers/site-settings-provider.tsx`: direct `["settings"]` cache write.
- `stores/cart-store.ts` / `wishlist-store.ts`: customer branch server-first, guest branch immediate; no query invalidation. `auth-store`, `ui-store`, `recently-viewed-store`, `theme-store`, `sound-store` are local.
- `src/lib/auth-client.ts` `adoptGuestState()` migrates guest cart/wishlist with `Promise.allSettled`.

## 5. Refresh behavior — resolved

1. **Central query keys.** `src/lib/query-keys.ts` is the single source of truth for list/detail/count/notification/analytics keys. `relatedKeys(domain)` expands a domain into every affected cache prefix.
2. **Shared mutation helper.** `src/hooks/use-optimistic-mutation.ts` implements cancel → snapshot → optimistic patch → rollback → toast → close/navigate → invalidate-related-keys-on-settle. Optimism is opt-in; server-first forms still get centralized invalidation and toasts. `invalidateKeys()` is used by manual async handlers so all writes share one refresh path.
3. **Notification badge.** The shell popover optimistically patches both `["notifications","popover"]` and `["notifications","unread-count"]`; every notification-producing mutation invalidates `relatedKeys("notifications")`.
4. **Pagination after delete.** `clampPage()` adjusts the page after the last row on a page is removed (admin products/reviews/users/expenses/salaries/investments and storefront reviews).
5. **Cart clear.** `cart-store.clear()` now snapshots items, clears optimistically, and restores the snapshot if the customer API call fails.
6. **Profile/settings forms.** Account profile, admin profile/settings, store logo, home-section toggles and taxonomy forms now invalidate all related keys.
7. `router.refresh()` is retained only for form pages that navigate away. There is no `window.location.reload()` in `src/`.

## 6. Palette migration map

| Old | New token |
|---|---|
| `#172b42` / `primary-800` navy | `#0f766e` teal (`--primary`, `primary-700`) |
| `#2c6bd4` blue / accent ramp | `#f59e0b` amber (`--accent`, `accent-500`), soft `#fef3c7` |
| `#f6f8fb` background | `#f6f7f4` |
| `#0a1220` dark background | `#0c1311` |
| emerald/sky/violet/rose badge classes | `--success`, `--info`, `--warning`, `--danger` + `*-soft` |
| Fraunces display font | Jost UI (`--font-sans`), Fraunces display (`--font-display`) — retained per committed design direction |

Migrated hotspots: `admin/analytics-view.tsx`, `admin/accounting-view.tsx`, `admin/products/product-media-field.tsx`, `admin/products/product-images-dialog.tsx`, storefront `hero.tsx`/`hanging-showcase.tsx`/`category-grid.tsx`/`featured-collections.tsx`/`wardrobe-rail.tsx`, `account/order-detail.tsx` receipt HTML, `auth/auth-shell.tsx`.

Remaining intentional literal colors: Google glyph brand colors, WebGL/three.js material colors (the renderer requires concrete color strings), and the Stripe Elements primary-color fallback (Stripe requires a concrete CSS color; the value is resolved from `--primary` at runtime). Recharts uses `--chart-1..5` and `--chart-grid` tokens.

## 7. Redesign checklist

### Foundations
- [x] Audit written
- [x] Baseline typecheck/lint/build verified
- [x] `globals.css` token system replaced (teal/amber semantic statuses, tints, radii, transitions, reduced motion)
- [x] Jost via `next/font/google` with system fallback; Fraunces retained for display
- [x] Theme boot script/`store-theme` verified
- [x] Grouped nav data added to `constants.ts`
- [x] Legacy `theme-store.ts` removed after grep confirmed it was unused
- [x] Foundation commit

### UI primitives
- [x] Button/Card/Input/Badge/StatCard/Sonner retinted
- [x] `IconButton` and `Chip` added
- [x] Popover/Tooltip/Sheet restyled to tokens; `cn` imports consistent
- [x] Primitive commit

### Dashboard shell
- [x] Grouped collapsible sidebar with soft active pills
- [x] Header title + round icon buttons + notification popover + user menu
- [x] Responsive drawer at < 1024px
- [x] Notification badge/popover invalidation on mark-read/clear/new
- [x] Shell commit

### Mutation infrastructure
- [x] `src/lib/query-keys.ts`
- [x] `src/hooks/use-optimistic-mutation.ts`
- [x] Admin mutations migrated by logical group
- [x] Account/storefront/notifications mutations migrated
- [x] Zustand stores update synchronously and reconcile
- [x] Delete pagination clamp
- [x] README “Mutation conventions” section
- [x] Mutation commits

### Screens
- [x] Admin + super-admin restyle (cards, tables, charts, badges)
- [x] Storefront restyle
- [x] Auth + account + error/404/loading restyle
- [x] One commit per step

### QA
- [x] Light/dark token coverage reviewed statically — every route resolves semantic light/dark tokens
- [x] Responsive review at code level: fluid grids, drawer sidebar below `lg`, and contained `overflow-x-auto` regions; no new fixed-width page containers (live browser QA at 320/375/768/1024/1440px still recommended)
- [x] Primary buttons and header/nav icon buttons are 44px; dense table row actions keep pre-existing compact hit areas
- [x] `grep` confirms no hard-coded hex colors in CSS-driven components (documented exceptions in §6)
- [x] Final `pnpm typecheck`, `pnpm lint`, `pnpm build`
- [x] Final summary of changes, files, assumptions, untouched items
