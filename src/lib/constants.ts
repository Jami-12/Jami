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

export const SITE = {
  name: process.env.NEXT_PUBLIC_STORE_NAME ?? "Aether",
  tagline: "Objects for a considered life",
  description:
    "Aether is a design-led commerce house for audio, lighting, workspace and everyday objects — presented in real time 3D and built to last.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@example.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+880 1000 000000",
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "Dhaka, Bangladesh",
  social: {
    instagram: "https://instagram.com",
    x: "https://x.com",
    youtube: "https://youtube.com",
  },
} as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export const GOOGLE_AUTH_URL = `${API_BASE_URL}/auth/google`;

export const CURRENCY = (process.env.NEXT_PUBLIC_CURRENCY ?? "BDT").toUpperCase();

export const MAIN_NAV = [
  { label: "Shop all", href: "/products" },
  { label: "3D showroom", href: "/#showroom" },
  { label: "Journal", href: "/#journal" },
  { label: "Our story", href: "/#story" },
] as const;

export const FOOTER_NAV = [
  {
    title: "Shop",
    links: [
      { label: "All objects", href: "/products" },
      { label: "New arrivals", href: "/products?sortBy=createdAt&sortOrder=desc" },
      { label: "Bestsellers", href: "/products?sortBy=soldCount&sortOrder=desc" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Cart", href: "/cart" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our story", href: "/#story" },
      { label: "Journal", href: "/#journal" },
      { label: "3D showroom", href: "/#showroom" },
      { label: "Craft & materials", href: "/#craft" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    title: "Support",
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

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pending", tone: "warning" },
  CONFIRMED: { label: "Confirmed", tone: "info" },
  PROCESSING: { label: "Processing", tone: "accent" },
  SHIPPED: { label: "Shipped", tone: "accent" },
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

export const CUSTOMER_NAV = [
  { label: "Overview", href: "/account", icon: "layout" },
  { label: "Orders", href: "/account/orders", icon: "receipt" },
  { label: "Addresses", href: "/account/addresses", icon: "map" },
  { label: "Wishlist", href: "/account/wishlist", icon: "heart" },
  { label: "Notifications", href: "/account/notifications", icon: "bell" },
  { label: "Security", href: "/account/security", icon: "shield" },
] as const;

export const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: "layout", superOnly: false },
  { label: "Products", href: "/admin/products", icon: "package", superOnly: false },
  { label: "Orders", href: "/admin/orders", icon: "receipt", superOnly: false },
  { label: "Inventory", href: "/admin/inventory", icon: "boxes", superOnly: false },
  { label: "Categories", href: "/admin/categories", icon: "tag", superOnly: false },
  { label: "Brands", href: "/admin/brands", icon: "badge", superOnly: false },
  { label: "Coupons", href: "/admin/coupons", icon: "ticket", superOnly: false },
  { label: "Reviews", href: "/admin/reviews", icon: "star", superOnly: false },
  { label: "Expenses", href: "/admin/expenses", icon: "wallet", superOnly: false },
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
  { label: "Investments", href: "/super-admin/investments", icon: "trending" },
  { label: "Employees", href: "/super-admin/employees", icon: "id" },
  { label: "Salaries", href: "/super-admin/salaries", icon: "banknote" },
  { label: "Audit logs", href: "/super-admin/audit", icon: "scroll" },
  { label: "Admin console", href: "/admin", icon: "shield" },
] as const;

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
