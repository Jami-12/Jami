"use client";

import { useMemo } from "react";

import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell, type ShellNavItem } from "@/components/dashboard/dashboard-shell";
import { ADMIN_NAV, CUSTOMER_NAV, SUPER_ADMIN_NAV } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";

export function ShellFrame({
  title,
  subtitle,
  nav,
  children,
}: {
  title: string;
  subtitle?: string;
  nav: readonly ShellNavItem[];
  children: React.ReactNode;
}) {
  return (
    <DashboardShell nav={nav} title={title} subtitle={subtitle}>
      {children}
    </DashboardShell>
  );
}

export function CustomerShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={["CUSTOMER"]}>
      <ShellFrame nav={CUSTOMER_NAV} title={title} subtitle={subtitle}>
        {children}
      </ShellFrame>
    </RoleGuard>
  );
}

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const role = useAuthStore((state) => state.user?.role);
  const nav = useMemo(
    () => ADMIN_NAV.filter((item) => !item.superOnly || role === "SUPER_ADMIN"),
    [role],
  );

  return (
    <RoleGuard allowed={["ADMIN", "SUPER_ADMIN"]}>
      <ShellFrame nav={nav} title={title} subtitle={subtitle}>
        {children}
      </ShellFrame>
    </RoleGuard>
  );
}

export function SuperAdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={["SUPER_ADMIN"]}>
      <ShellFrame nav={SUPER_ADMIN_NAV} title={title} subtitle={subtitle}>
        {children}
      </ShellFrame>
    </RoleGuard>
  );
}
