"use client";

import { useMemo } from "react";

import { RoleGuard } from "@/components/auth/role-guard";
import {
  DashboardShell,
  type ShellNavGroup,
  type ShellNavItem,
} from "@/components/dashboard/dashboard-shell";
import {
  ADMIN_NAV,
  ADMIN_NAV_GROUPS,
  CUSTOMER_NAV,
  CUSTOMER_NAV_GROUPS,
  SUPER_ADMIN_NAV,
  SUPER_ADMIN_NAV_GROUPS,
} from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";

export function ShellFrame({
  title,
  subtitle,
  nav,
  groups,
  children,
}: {
  title: string;
  subtitle?: string;
  nav: readonly ShellNavItem[];
  groups?: readonly ShellNavGroup[];
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      nav={nav}
      groups={groups}
      title={title}
      subtitle={subtitle}
    >
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
      <ShellFrame
        nav={CUSTOMER_NAV}
        groups={CUSTOMER_NAV_GROUPS}
        title={title}
        subtitle={subtitle}
      >
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
  const canSeeSuperItems = role === "SUPER_ADMIN";
  const nav = useMemo(
    () => ADMIN_NAV.filter((item) => !item.superOnly || canSeeSuperItems),
    [canSeeSuperItems],
  );
  const groups = useMemo(
    () =>
      ADMIN_NAV_GROUPS.map((group) => ({
        label: group.label,
        items: group.items.filter((item) => !item.superOnly || canSeeSuperItems),
      })).filter((group) => group.items.length > 0),
    [canSeeSuperItems],
  );

  return (
    <RoleGuard allowed={["ADMIN", "SUPER_ADMIN"]}>
      <ShellFrame
        nav={nav}
        groups={groups}
        title={title}
        subtitle={subtitle}
      >
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
      <ShellFrame
        nav={SUPER_ADMIN_NAV}
        groups={SUPER_ADMIN_NAV_GROUPS}
        title={title}
        subtitle={subtitle}
      >
        {children}
      </ShellFrame>
    </RoleGuard>
  );
}
