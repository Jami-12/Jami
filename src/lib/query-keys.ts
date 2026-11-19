import type { QueryKey } from "@tanstack/react-query";

/**
 * Single source of truth for React Query cache keys.
 *
 * All queries and mutations should build their keys from these factories so a
 * mutation can invalidate every related list, detail, count, stat and analytics
 * entry with one call. Keys are plain arrays — React Query matches by prefix,
 * so `queryKeys.orders.all` also covers `queryKeys.orders.mine(params)`.
 */
export const queryKeys = {
  /** Root prefix. Useful for a deliberately broad `invalidateQueries`. */
  all: ["aether"] as const,

  settings: {
    all: ["settings"] as const,
    detail: () => ["settings", "detail"] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    list: (params?: Record<string, unknown>) =>
      params ? (["notifications", params] as const) : (["notifications", "list"] as const),
    unreadCount: () => ["notifications", "unread-count"] as const,
    popover: () => ["notifications", "popover"] as const,
    recent: () => ["notifications", "recent"] as const,
  },

  orders: {
    all: ["orders"] as const,
    mine: (params?: Record<string, unknown>) =>
      params ? (["orders", "my", params] as const) : (["orders", "my"] as const),
    detail: (id: string) => ["order", id] as const,
    detailAll: () => ["order"] as const,
    recent: () => ["orders", "recent"] as const,
    pendingPayment: () => ["orders", "pending-payment"] as const,
    inTransit: () => ["orders", "in-transit"] as const,
    receipt: (id: string) => ["order-receipt", id] as const,
    admin: {
      all: () => ["admin", "orders"] as const,
      list: (params?: Record<string, unknown>) =>
        params ? (["admin", "orders", params] as const) : (["admin", "orders", "list"] as const),
      detail: (id: string) => ["admin", "order", id] as const,
      detailAll: () => ["admin", "order"] as const,
      recent: () => ["admin", "orders", "recent"] as const,
      count: (name: string) => ["admin", "orders", name] as const,
    },
  },

  products: {
    all: () => ["products"] as const,
    detail: (idOrSlug: string) => ["products", idOrSlug] as const,
    discounts: (params?: Record<string, unknown>) =>
      params ? (["products", "discounts", params] as const) : (["products", "discounts"] as const),
    discountOptions: () => ["products", "discount-options"] as const,
    discount: (id: string) => ["product-discount", id] as const,
    discountAll: () => ["product-discount"] as const,
    reviews: (id: string, page?: number) =>
      page === undefined
        ? (["product-reviews", id] as const)
        : (["product-reviews", id, page] as const),
    images: (id: string) => ["product-images", id] as const,
    admin: {
      all: () => ["admin", "products"] as const,
      detail: (id: string) => ["admin", "product", id] as const,
      count: (name: string) => ["admin", "products", name] as const,
    },
  },

  reviews: {
    all: () => ["reviews"] as const,
    admin: {
      all: () => ["admin", "reviews"] as const,
      list: (params?: Record<string, unknown>) =>
        params ? (["admin", "reviews", params] as const) : (["admin", "reviews", "list"] as const),
      pending: () => ["admin", "reviews", "pending"] as const,
    },
  },

  users: {
    all: () => ["users"] as const,
    me: () => ["users", "me"] as const,
    auditOptions: () => ["users", "audit-options"] as const,
    admin: {
      customers: (params?: Record<string, unknown>) =>
        params ? (["admin", "customers", params] as const) : (["admin", "customers"] as const),
    },
  },

  addresses: {
    all: () => ["addresses"] as const,
  },

  employees: {
    all: () => ["employees"] as const,
    summary: () => ["employees", "summary"] as const,
    options: () => ["employees", "options"] as const,
    list: (params?: Record<string, unknown>) =>
      params ? (["employees", params] as const) : (["employees", "list"] as const),
  },

  salaries: {
    all: () => ["salaries"] as const,
    summary: (year?: number | string) =>
      year === undefined ? (["salaries", "summary"] as const) : (["salaries", "summary", year] as const),
    list: (params?: Record<string, unknown>) =>
      params ? (["salaries", params] as const) : (["salaries", "list"] as const),
  },

  expenses: {
    all: () => ["expenses"] as const,
    summary: () => ["expenses", "summary"] as const,
    list: (params?: Record<string, unknown>) =>
      params ? (["expenses", params] as const) : (["expenses", "list"] as const),
  },

  investments: {
    all: () => ["investments"] as const,
    summary: () => ["investments", "summary"] as const,
    list: (params?: Record<string, unknown>) =>
      params ? (["investments", params] as const) : (["investments", "list"] as const),
  },

  accounting: {
    all: () => ["accounting"] as const,
    summary: (start?: string, end?: string) =>
      start && end
        ? (["accounting", "summary", start, end] as const)
        : (["accounting", "summary"] as const),
    report: (start?: string, end?: string, granularity?: string) =>
      start && end
        ? (["accounting", "report", start, end, granularity] as const)
        : (["accounting", "report"] as const),
    dashboard: () => ["accounting", "dashboard"] as const,
  },

  analytics: {
    all: () => ["analytics"] as const,
    overview: () => ["analytics", "overview"] as const,
  },

  audit: {
    all: () => ["audit"] as const,
    list: (params?: Record<string, unknown>) =>
      params ? (["audit", params] as const) : (["audit", "list"] as const),
  },

  transactions: {
    all: () => ["transactions"] as const,
    list: (params?: Record<string, unknown>) =>
      params ? (["transactions", params] as const) : (["transactions", "list"] as const),
  },

  inventory: {
    all: () => ["inventory"] as const,
    overview: () => ["inventory", "overview"] as const,
    logs: (id?: string | null, params?: Record<string, unknown>) =>
      ["inventory", "logs", id ?? null, params ?? {}] as const,
    list: (params?: Record<string, unknown>) =>
      params ? (["inventory", params] as const) : (["inventory", "list"] as const),
  },

  banners: {
    all: () => ["admin", "banners"] as const,
    public: () => ["public", "banners"] as const,
    detail: (id: string) => ["admin", "banner", id] as const,
  },

  coupons: {
    all: () => ["admin", "coupons"] as const,
    list: (params?: Record<string, unknown>) =>
      params ? (["admin", "coupons", params] as const) : (["admin", "coupons", "list"] as const),
    detail: (id: string) => ["admin", "coupon", id] as const,
  },

  taxonomy: {
    all: (mode: "categories" | "brands") => [mode] as const,
    list: (mode: "categories" | "brands", search?: string) =>
      search !== undefined ? ([mode, search] as const) : ([mode] as const),
    detail: (mode: "categories" | "brands", id: string) =>
      [mode, "detail", id] as const,
    storefront: {
      categories: () => ["categories"] as const,
      brands: () => ["brands"] as const,
    },
  },

  categories: {
    all: () => ["categories"] as const,
    admin: () => ["categories", "admin"] as const,
  },

  brands: {
    all: () => ["brands"] as const,
  },

  paymentProviders: {
    all: () => ["payment-providers"] as const,
  },

  search: {
    all: () => ["search"] as const,
    query: (term: string) => ["search", term] as const,
  },

  nav: {
    categories: () => ["nav", "categories"] as const,
    brands: () => ["nav", "brands"] as const,
    search: (term: string) => ["nav", "search", term] as const,
  },

  wishlistProduct: (id: string) => ["wishlist-product", id] as const,
} as const;

/**
 * Domains that are commonly affected together. A single mutation can pass
 * `relatedKeys("products")` to onSettled and refresh every affected surface.
 */
const RELATED: Record<string, QueryKey[]> = {
  orders: [
    queryKeys.orders.all,
    queryKeys.orders.detailAll(),
    queryKeys.orders.admin.all(),
    queryKeys.orders.admin.detailAll(),
    queryKeys.notifications.all,
    queryKeys.notifications.unreadCount(),
  ],
  products: [
    queryKeys.products.all(),
    queryKeys.products.admin.all(),
    queryKeys.products.discountAll(),
    queryKeys.inventory.all(),
    queryKeys.analytics.all(),
  ],
  reviews: [
    queryKeys.reviews.all(),
    queryKeys.reviews.admin.all(),
    queryKeys.products.all(),
  ],
  users: [queryKeys.users.all(), queryKeys.audit.all()],
  employees: [
    queryKeys.employees.all(),
    queryKeys.salaries.all(),
    queryKeys.accounting.all(),
  ],
  salaries: [
    queryKeys.salaries.all(),
    queryKeys.expenses.all(),
    queryKeys.accounting.all(),
  ],
  expenses: [queryKeys.expenses.all(), queryKeys.accounting.all()],
  investments: [queryKeys.investments.all(), queryKeys.accounting.all()],
  inventory: [queryKeys.inventory.all(), queryKeys.products.admin.all()],
  discounts: [
    queryKeys.products.all(),
    queryKeys.products.admin.all(),
    queryKeys.products.discountAll(),
  ],
  banners: [queryKeys.banners.all(), queryKeys.banners.public()],
  coupons: [queryKeys.coupons.all()],
  categories: [
    queryKeys.taxonomy.all("categories"),
    queryKeys.categories.all(),
    queryKeys.categories.admin(),
    queryKeys.nav.categories(),
  ],
  brands: [
    queryKeys.taxonomy.all("brands"),
    queryKeys.brands.all(),
    queryKeys.nav.brands(),
  ],
  settings: [queryKeys.settings.all],
  notifications: [
    queryKeys.notifications.all,
    queryKeys.notifications.unreadCount(),
    queryKeys.notifications.popover(),
  ],
};

export type RelatedDomain = keyof typeof RELATED;

/** Returns the full set of cache keys that should be refreshed after a domain mutation. */
export function relatedKeys(domain: RelatedDomain): QueryKey[] {
  return [...(RELATED[domain] ?? [])];
}
