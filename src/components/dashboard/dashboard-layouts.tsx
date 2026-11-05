"use client";

import { usePathname } from "next/navigation";

import {
  AdminShell,
  CustomerShell,
  SuperAdminShell,
} from "@/components/dashboard/shells";

interface TitleEntry {
  path: string;
  title: string;
  subtitle?: string;
}

function matchTitle(pathname: string, entries: TitleEntry[], fallback: string): TitleEntry {
  const match = entries
    .filter((entry) => pathname === entry.path || pathname.startsWith(`${entry.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return match ?? { path: fallback, title: fallback };
}

const ACCOUNT_TITLES: TitleEntry[] = [
  { path: "/account/orders", title: "Your orders", subtitle: "Track delivery and payment status." },
  { path: "/account/profile", title: "Profile", subtitle: "Keep your contact details current." },
  { path: "/account/addresses", title: "Delivery addresses", subtitle: "Manage where orders arrive." },
  { path: "/account/wishlist", title: "Wishlist", subtitle: "Objects saved for later." },
  { path: "/account/notifications", title: "Notifications", subtitle: "Order, payment and account updates." },
  { path: "/account/security", title: "Security", subtitle: "Password and account access." },
  { path: "/account", title: "Account overview", subtitle: "Orders, saved objects and recent activity." },
];

const ADMIN_TITLES: TitleEntry[] = [
  { path: "/admin/products/new", title: "New product", subtitle: "Create a catalogue entry and upload images." },
  { path: "/admin/products", title: "Products", subtitle: "Catalogue, pricing and publication." },
  { path: "/admin/orders", title: "Orders", subtitle: "Fulfilment and payment reconciliation." },
  { path: "/admin/inventory", title: "Inventory", subtitle: "Stock levels, movements and valuation." },
  { path: "/admin/categories", title: "Categories", subtitle: "The structure of the catalogue." },
  { path: "/admin/brands", title: "Brands", subtitle: "Studios and makers behind the objects." },
  { path: "/admin/coupons", title: "Coupons", subtitle: "Discount codes and usage limits." },
  { path: "/admin/reviews", title: "Reviews", subtitle: "Moderate customer feedback." },
  { path: "/admin/expenses", title: "Expenses", subtitle: "Operating spend and bills." },
  { path: "/admin/notifications", title: "Notifications", subtitle: "Order, payment and account updates." },
  { path: "/admin", title: "Admin overview", subtitle: "Today's commerce at a glance." },
];

const SUPER_TITLES: TitleEntry[] = [
  { path: "/super-admin/analytics", title: "Analytics", subtitle: "Revenue, orders and customer trends." },
  { path: "/super-admin/accounting", title: "Accounting", subtitle: "Profit, expenses and financial reports." },
  { path: "/super-admin/transactions", title: "Transactions", subtitle: "Every income, expense and investment entry." },
  { path: "/super-admin/users", title: "Users", subtitle: "Customers, admins and access control." },
  { path: "/super-admin/expenses", title: "Expenses", subtitle: "Operating spend, bills and approvals." },
  { path: "/super-admin/discounts", title: "Discounts", subtitle: "Product campaigns, schedules and pricing." },
  { path: "/super-admin/investments", title: "Investments", subtitle: "Capital added to the business." },
  { path: "/super-admin/employees", title: "Employees", subtitle: "Team roster and payroll base." },
  { path: "/super-admin/salaries", title: "Salaries", subtitle: "Monthly payroll and payment status." },
  { path: "/super-admin/notifications", title: "Notifications", subtitle: "Order, payment and account updates." },
  { path: "/super-admin/audit", title: "Audit logs", subtitle: "Immutable record of privileged actions." },
  { path: "/super-admin", title: "Super admin", subtitle: "Full business and access overview." },
];

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const entry = matchTitle(pathname, ACCOUNT_TITLES, "Account");
  return (
    <CustomerShell title={entry.title} subtitle={entry.subtitle}>
      {children}
    </CustomerShell>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const entry = matchTitle(pathname, ADMIN_TITLES, "Admin");
  return (
    <AdminShell title={entry.title} subtitle={entry.subtitle}>
      {children}
    </AdminShell>
  );
}

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const entry = matchTitle(pathname, SUPER_TITLES, "Super admin");
  return (
    <SuperAdminShell title={entry.title} subtitle={entry.subtitle}>
      {children}
    </SuperAdminShell>
  );
}
