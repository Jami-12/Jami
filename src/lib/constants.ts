import type {
  ExpenseCategory,
  InventoryMovementType,
  NotificationType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductStatus,
  Role,
} from "@/types";

/**
 * Build-time storefront identity.
 * Runtime name/logo/favicon are driven by Super Admin site settings via
 * `SiteSettingsProvider` + `Brand`; these values act as safe fallbacks so
 * metadata, manifest and first paint stay branded before settings load.
 */
export const SITE = {
  name: process.env.NEXT_PUBLIC_STORE_NAME?.trim() || "Store",
  tagline: "Modern commerce, thoughtfully made",
  description:
 "A modern storefront for considered essentials — quality pieces, clear details and a smooth shopping experience.",
  // Env-only: local (`.env.local`) and Vercel builds each supply their own URL.
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ?? "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@example.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+880 1000 000000",
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "Dhaka, Bangladesh",
  social: {
    instagram: "https://instagram.com",
    x: "https://x.com",
    youtube: "https://youtube.com",
  },
} as const;

// Env-only. The local and deployed API URLs live in .env* / Vercel variables.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") ?? "";

export const GOOGLE_AUTH_URL = `${API_BASE_URL}/auth/google`;

export const CURRENCY = (process.env.NEXT_PUBLIC_CURRENCY ?? "BDT").toUpperCase();

/**
 * Mirrors the seeded backend categories. The live category grid fetches the
 * authoritative list from `/categories`; these values are used for navigation
 * shortcuts and search suggestions when the API is still loading.
 */
export const CATEGORIES = [
  { value: "shoes", label: "Shoes" },
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home-decor", label: "Home Decor" },
] as const;

export const CATEGORY_LABEL = CATEGORIES.reduce<Record<string, string>>(
  (accumulator, category) => {
    accumulator[category.value] = category.label;
    return accumulator;
  },
  {},
);

/** Matches the backend's `FREE_SHIPPING_THRESHOLD` (base currency: BDT). */
export const FREE_SHIPPING_THRESHOLD = Number(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 1000,
);

/** Matches the backend's `SHIPPING_FLAT_RATE` (base currency: BDT). */
export const SHIPPING_FLAT_RATE = Number(
  process.env.NEXT_PUBLIC_SHIPPING_FLAT_RATE ?? 60,
);

/** Base currency used by the backend. All API amounts are expressed in it. */
export const BASE_CURRENCY = (process.env.NEXT_PUBLIC_BASE_CURRENCY ?? "BDT").toUpperCase();

export const USD_TO_BDT = Number(process.env.NEXT_PUBLIC_USD_TO_BDT ?? 120);

export const MAIN_NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/#collections" },
  { label: "Categories", href: "/#categories" },
  { label: "About", href: "/#story" },
  { label: "Contact", href: "/#contact" },
] as const;

export const FOOTER_NAV = [
  {
    title: "Shop",
    links: [
      { label: "The collection", href: "/products" },
      { label: "New arrivals", href: "/products?sort=newest" },
      { label: "Bestsellers", href: "/products?sort=popular" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Your bag", href: "/cart" },
    ],
  },
  {
    title: "The house",
    links: [
      { label: "Our story", href: "/#story" },
      { label: "Editorial", href: "/#journal" },
      { label: "Collections", href: "/#collections" },
      { label: "Craft & materials", href: "/#craft" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    title: "Client care",
    links: [
      { label: "Your account", href: "/account" },
      { label: "Order tracking", href: "/account/orders" },
      { label: "Shipping & returns", href: "/#faq" },
      { label: "Privacy", href: "/#privacy" },
      { label: "Terms", href: "/#terms" },
    ],
  },
] as const;

export const PRODUCT_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "soldCount:desc", label: "Bestselling" },
  { value: "price:asc", label: "Price: low to high" },
  { value: "price:desc", label: "Price: high to low" },
  { value: "title:asc", label: "Name: A–Z" },
] as const;

export const PRODUCT_STATUSES: ProductStatus[] = [
 "ACTIVE",
 "INACTIVE",
 "DRAFT",
 "OUT_OF_STOCK",
];

export const ORDER_STATUSES: OrderStatus[] = [
 "PENDING",
 "CONFIRMED",
 "PROCESSING",
 "SHIPPED",
 "DELIVERED",
 "CANCELLED",
 "RETURNED",
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
 "PENDING",
 "PROCESSING",
 "PAID",
 "FAILED",
 "CANCELLED",
 "REFUNDED",
];

export const PAYMENT_METHODS: PaymentMethod[] = [
 "CASH_ON_DELIVERY",
 "BKASH",
 "NAGAD",
 "CARD",
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
 "PRODUCT_PURCHASE",
 "EMPLOYEE_SALARY",
 "SHOP_RENT",
 "ELECTRICITY_BILL",
 "INTERNET_BILL",
 "WATER_BILL",
 "GAS_BILL",
 "TRANSPORT",
 "DELIVERY",
 "MARKETING",
 "ADVERTISING",
 "MAINTENANCE",
 "OFFICE_SUPPLIES",
 "TAX",
 "OTHER",
];

export const INVENTORY_MOVEMENTS: InventoryMovementType[] = [
 "STOCK_IN",
 "STOCK_OUT",
 "ADJUSTMENT",
 "ORDER_SALE",
 "ORDER_CANCEL",
 "ORDER_RETURN",
];

export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

/** Mirrors the backend's `ALLOWED_TRANSITIONS` map in order.service.ts. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pending", tone: "warning" },
  CONFIRMED: { label: "Confirmed", tone: "info" },
  PROCESSING: { label: "Processing", tone: "info" },
  SHIPPED: { label: "Shipped", tone: "info" },
  DELIVERED: { label: "Delivered", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
  RETURNED: { label: "Returned", tone: "neutral" },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pending", tone: "warning" },
  PROCESSING: { label: "Processing", tone: "info" },
  PAID: { label: "Paid", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
  REFUNDED: { label: "Refunded", tone: "neutral" },
};

export const PRODUCT_STATUS_META: Record<ProductStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Active", tone: "success" },
  INACTIVE: { label: "Inactive", tone: "neutral" },
  DRAFT: { label: "Draft", tone: "warning" },
  OUT_OF_STOCK: { label: "Out of stock", tone: "danger" },
};

export const PAYMENT_METHOD_META: Record<
  PaymentMethod,
  { label: string; description: string }
> = {
  CASH_ON_DELIVERY: {
    label: "Cash on delivery",
    description: "Pay the courier when your order arrives.",
  },
  BKASH: {
    label: "bKash",
    description: "Pay securely with your bKash mobile wallet.",
  },
  NAGAD: {
    label: "Nagad",
    description: "Pay securely with your Nagad mobile wallet.",
  },
  CARD: {
    label: "Card",
    description: "Visa, Mastercard and Amex via Stripe.",
  },
};

export const ROLE_META: Record<Role, { label: string; tone: Tone }> = {
  SUPER_ADMIN: { label: "Super admin", tone: "accent" },
  ADMIN: { label: "Admin", tone: "info" },
  CUSTOMER: { label: "Customer", tone: "neutral" },
};

export const NOTIFICATION_META: Record<NotificationType, { label: string; tone: Tone }> = {
  ORDER: { label: "Order", tone: "info" },
  PAYMENT: { label: "Payment", tone: "success" },
  PRODUCT: { label: "Product", tone: "accent" },
  SYSTEM: { label: "System", tone: "neutral" },
  ACCOUNT: { label: "Account", tone: "warning" },
};

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  PRODUCT_PURCHASE: "Product purchase",
  EMPLOYEE_SALARY: "Employee salary",
  SHOP_RENT: "Shop rent",
  ELECTRICITY_BILL: "Electricity bill",
  INTERNET_BILL: "Internet bill",
  WATER_BILL: "Water bill",
  GAS_BILL: "Gas bill",
  TRANSPORT: "Transport",
  DELIVERY: "Delivery",
  MARKETING: "Marketing",
  ADVERTISING: "Advertising",
  MAINTENANCE: "Maintenance",
  OFFICE_SUPPLIES: "Office supplies",
  TAX: "Tax",
  OTHER: "Other",
};

export const INVENTORY_MOVEMENT_LABEL: Record<InventoryMovementType, string> = {
  STOCK_IN: "Stock in",
  STOCK_OUT: "Stock out",
  ADJUSTMENT: "Adjustment",
  ORDER_SALE: "Order sale",
  ORDER_CANCEL: "Order cancel",
  ORDER_RETURN: "Order return",
};

export interface NavItemDefinition {
  label: string;
  href: string;
  icon?: string;
  superOnly?: boolean;
}

export interface NavGroupDefinition {
  label: string;
  items: readonly NavItemDefinition[];
}

export const CUSTOMER_NAV = [
  { label: "Overview", href: "/account", icon: "layout" },
  { label: "Orders", href: "/account/orders", icon: "receipt" },
  { label: "Profile", href: "/account/profile", icon: "user" },
  { label: "Addresses", href: "/account/addresses", icon: "map" },
  { label: "Wishlist", href: "/account/wishlist", icon: "heart" },
  { label: "Notifications", href: "/account/notifications", icon: "bell" },
  { label: "Notepad", href: "/account/notepad", icon: "scroll" },
  { label: "Security", href: "/account/security", icon: "shield" },
] as const;

export const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: "layout", superOnly: false },
  { label: "Products", href: "/admin/products", icon: "package", superOnly: false },
  { label: "Orders", href: "/admin/orders", icon: "receipt", superOnly: false },
  { label: "Customers", href: "/admin/customers", icon: "user", superOnly: false },
  { label: "Inventory", href: "/admin/inventory", icon: "boxes", superOnly: false },
  { label: "Categories", href: "/admin/categories", icon: "tag", superOnly: false },
  { label: "Brands", href: "/admin/brands", icon: "badge", superOnly: false },
  { label: "Banners", href: "/admin/banners", icon: "layout", superOnly: false },
  { label: "Home sections", href: "/admin/home-sections", icon: "layout", superOnly: false },
  { label: "Coupons", href: "/admin/coupons", icon: "ticket", superOnly: false },
  { label: "Reviews", href: "/admin/reviews", icon: "star", superOnly: false },
  { label: "Expenses", href: "/admin/expenses", icon: "wallet", superOnly: false },
  { label: "Cash collection", href: "/admin/cash-collection", icon: "banknote", superOnly: false },
  { label: "Receipt settings", href: "/admin/receipt-settings", icon: "receipt", superOnly: false },
  { label: "Notifications", href: "/admin/notifications", icon: "bell", superOnly: false },
  { label: "Notepad", href: "/admin/notepad", icon: "scroll", superOnly: false },
  { label: "Analytics", href: "/super-admin/analytics", icon: "chart", superOnly: true },
  { label: "Accounting", href: "/super-admin/accounting", icon: "calculator", superOnly: true },
  { label: "Users", href: "/super-admin/users", icon: "users", superOnly: true },
] as const;

export const SUPER_ADMIN_NAV = [
  { label: "Overview", href: "/super-admin", icon: "layout" },
  { label: "Analytics", href: "/super-admin/analytics", icon: "chart" },
  { label: "Accounting", href: "/super-admin/accounting", icon: "calculator" },
  { label: "Transactions", href: "/super-admin/transactions", icon: "arrow", },
  { label: "Users", href: "/super-admin/users", icon: "users" },
  { label: "Expenses", href: "/super-admin/expenses", icon: "wallet" },
  { label: "Discounts", href: "/super-admin/discounts", icon: "ticket" },
  { label: "Investments", href: "/super-admin/investments", icon: "trending" },
  { label: "Employees", href: "/super-admin/employees", icon: "id" },
  { label: "Salaries", href: "/super-admin/salaries", icon: "banknote" },
  { label: "Notifications", href: "/super-admin/notifications", icon: "bell" },
  { label: "Notepad", href: "/super-admin/notepad", icon: "scroll" },
  { label: "Audit logs", href: "/super-admin/audit", icon: "scroll" },
  { label: "Settings", href: "/super-admin/settings", icon: "shield" },
  { label: "Admin console", href: "/admin", icon: "shield" },
] as const;

/**
 * Grouped navigation used by the collapsible dashboard sidebar. Every item in
 * the flat arrays above appears exactly once below; the flat exports are kept
 * for callers that do not need grouping.
 */
export const CUSTOMER_NAV_GROUPS: readonly NavGroupDefinition[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/account", icon: "layout" },
      { label: "Orders", href: "/account/orders", icon: "receipt" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", href: "/account/profile", icon: "user" },
      { label: "Addresses", href: "/account/addresses", icon: "map" },
      { label: "Wishlist", href: "/account/wishlist", icon: "heart" },
      { label: "Notifications", href: "/account/notifications", icon: "bell" },
      { label: "Notepad", href: "/account/notepad", icon: "scroll" },
    ],
  },
  {
    label: "Preferences",
    items: [{ label: "Security", href: "/account/security", icon: "shield" }],
  },
];

export const ADMIN_NAV_GROUPS: readonly NavGroupDefinition[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/admin", icon: "layout" },
      {
        label: "Analytics",
        href: "/super-admin/analytics",
        icon: "chart",
        superOnly: true,
      },
      {
        label: "Accounting",
        href: "/super-admin/accounting",
        icon: "calculator",
        superOnly: true,
      },
      { label: "Users", href: "/super-admin/users", icon: "users", superOnly: true },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Products", href: "/admin/products", icon: "package" },
      { label: "Orders", href: "/admin/orders", icon: "receipt" },
      { label: "Customers", href: "/admin/customers", icon: "user" },
      { label: "Inventory", href: "/admin/inventory", icon: "boxes" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Categories", href: "/admin/categories", icon: "tag" },
      { label: "Brands", href: "/admin/brands", icon: "badge" },
      { label: "Banners", href: "/admin/banners", icon: "layout" },
      { label: "Home sections", href: "/admin/home-sections", icon: "layout" },
      { label: "Coupons", href: "/admin/coupons", icon: "ticket" },
      { label: "Reviews", href: "/admin/reviews", icon: "star" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Expenses", href: "/admin/expenses", icon: "wallet" },
      { label: "Cash collection", href: "/admin/cash-collection", icon: "banknote" },
      { label: "Receipt settings", href: "/admin/receipt-settings", icon: "receipt" },
      { label: "Notifications", href: "/admin/notifications", icon: "bell" },
      { label: "Notepad", href: "/admin/notepad", icon: "scroll" },
    ],
  },
];

export const SUPER_ADMIN_NAV_GROUPS: readonly NavGroupDefinition[] = [
  {
    label: "Overview",
    items: [
      { label: "Overview", href: "/super-admin", icon: "layout" },
      { label: "Analytics", href: "/super-admin/analytics", icon: "chart" },
      { label: "Accounting", href: "/super-admin/accounting", icon: "calculator" },
      { label: "Transactions", href: "/super-admin/transactions", icon: "arrow" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Discounts", href: "/super-admin/discounts", icon: "ticket" },
      { label: "Expenses", href: "/super-admin/expenses", icon: "wallet" },
      { label: "Investments", href: "/super-admin/investments", icon: "trending" },
    ],
  },
  {
    label: "Team",
    items: [
      { label: "Users", href: "/super-admin/users", icon: "users" },
      { label: "Employees", href: "/super-admin/employees", icon: "id" },
      { label: "Salaries", href: "/super-admin/salaries", icon: "banknote" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications", href: "/super-admin/notifications", icon: "bell" },
      { label: "Notepad", href: "/super-admin/notepad", icon: "scroll" },
      { label: "Audit logs", href: "/super-admin/audit", icon: "scroll" },
      { label: "Settings", href: "/super-admin/settings", icon: "shield" },
      { label: "Admin console", href: "/admin", icon: "shield" },
    ],
  },
];

export const MONTHS = [
 "January",
 "February",
 "March",
 "April",
 "May",
 "June",
 "July",
 "August",
 "September",
 "October",
 "November",
 "December",
] as const;
