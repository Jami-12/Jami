"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { notificationsApi } from "@/lib/api/services";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface ShellNavItem {
  label: string;
  href: string;
  icon?: string;
  superOnly?: boolean;
}

export function DashboardShell({
  nav,
  title,
  subtitle,
  children,
}: {
  nav: readonly ShellNavItem[];
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const notifications = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.list({ limit: 1 }),
    enabled: Boolean(user),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const notificationsHref =
    pathname.startsWith("/admin")
      ? "/admin/notifications"
      : user?.role === "CUSTOMER"
        ? "/account/notifications"
        : "/super-admin/notifications";
  const unreadCount = notifications.data?.unreadCount ?? 0;

  const isActive = (href: string) =>
    href === pathname || (href !== "/" && pathname.startsWith(`${href}/`));

  const signOut = () => {
    clearSession();
    window.location.assign("/login");
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-[100rem]">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card/70 backdrop-blur lg:flex">
          <div className="flex h-16 items-center border-b border-border px-5">
            <Brand href="/" />
          </div>
          <nav aria-label="Dashboard navigation" className="hide-scrollbar flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-0.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                      isActive(item.href)
                        ? "bg-primary-700 text-white shadow-soft dark:bg-accent-300 dark:text-[#082f49]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span>{item.label}</span>
                    {item.superOnly ? (
                      <span className="text-[9px] font-bold uppercase tracking-wide opacity-70">
                        SA
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/60 p-2.5">
              <Avatar name={user?.name ?? "Aether"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{user?.name ?? "Account"}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/">Storefront</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="lg:hidden">
                  <Brand href="/" showWordmark={false} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-base font-extrabold tracking-tight sm:text-lg">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user ? <Badge tone="info">{user.role.replace("_", " ")}</Badge> : null}
                {user ? (
                  <Button asChild variant="outline" size="icon" className="relative" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}>
                    <Link href={notificationsHref}>
                      <Bell className="h-4 w-4" aria-hidden="true" />
                      {unreadCount > 0 ? (
                        <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold leading-4 text-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      ) : null}
                    </Link>
                  </Button>
                ) : null}
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            </div>
            <nav aria-label="Mobile dashboard navigation" className="hide-scrollbar flex gap-1 overflow-x-auto border-t border-border px-3 py-2 lg:hidden">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    isActive(item.href)
                      ? "bg-primary-700 text-white dark:bg-accent-300 dark:text-[#082f49]"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
