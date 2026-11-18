"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  Boxes,
  Calculator,
  Heart,
  IdCard,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  ReceiptText,
  ScrollText,
  ShieldCheck,
  Star,
  Tag,
  Ticket,
  TrendingUp,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

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

const NAV_ICONS: Record<string, LucideIcon> = {
  layout: LayoutDashboard,
  receipt: ReceiptText,
  user: User,
  map: MapPin,
  heart: Heart,
  bell: Bell,
  shield: ShieldCheck,
  package: Package,
  boxes: Boxes,
  tag: Tag,
  badge: BadgeCheck,
  ticket: Ticket,
  star: Star,
  wallet: Wallet,
  chart: BarChart3,
  calculator: Calculator,
  users: Users,
  arrow: ArrowLeftRight,
  trending: TrendingUp,
  id: IdCard,
  banknote: Banknote,
  scroll: ScrollText,
};

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
  const router = useRouter();
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
    router.push("/login");
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-[110rem]">
        <aside className="sticky top-0 hidden h-dvh w-[17rem] shrink-0 flex-col border-r border-border bg-card/60 backdrop-blur-xl lg:flex">
          <div className="flex h-[4.75rem] items-center border-b border-border px-6">
            <Brand href="/" />
          </div>

          <div className="px-6 pb-3 pt-6">
            <p className="eyebrow text-muted-foreground">Studio</p>
            <p className="mt-1 truncate font-display text-lg leading-tight">{title}</p>
          </div>

          <nav
            aria-label="Dashboard navigation"
            className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-4"
          >
            <ul className="space-y-1">
              {nav.map((item) => {
                const Icon = item.icon ? NAV_ICONS[item.icon] : undefined;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-[var(--color-primary-800)] text-white shadow-soft dark:bg-[var(--color-accent-300)] dark:text-[var(--color-primary-950)]"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {active ? (
                        <span
                          className="absolute inset-y-2 -left-3 w-[3px] rounded-full bg-[var(--color-accent-500)] dark:bg-[var(--color-primary-800)]"
                          aria-hidden="true"
                        />
                      ) : null}
                      {Icon ? (
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            active
                              ? "opacity-100"
                              : "opacity-70 group-hover:opacity-100",
                          )}
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className="truncate">{item.label}</span>
                      {item.superOnly ? (
                        <span className="ml-auto rounded-full border border-current/25 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest opacity-70">
                          SA
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-border p-3">
            <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
              <Avatar name={user?.name ?? "Aether"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{user?.name ?? "Account"}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/">Storefront</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                aria-label="Sign out"
                className="h-9 w-9"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="flex h-[4.75rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <div className="lg:hidden">
                  <Brand href="/" showWordmark={false} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate font-display text-lg leading-tight sm:text-xl">
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
                {user ? (
                  <Badge tone="accent" className="hidden sm:inline-flex">
                    {user.role.replace("_", " ")}
                  </Badge>
                ) : null}
                {user ? (
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    className="relative h-9 w-9"
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                  >
                    <Link href={notificationsHref}>
                      <Bell className="h-4 w-4" aria-hidden="true" />
                      {unreadCount > 0 ? (
                        <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-[var(--color-accent-500)] px-1 text-[9px] font-bold leading-4 text-[var(--color-primary-950)]">
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
            <nav
              aria-label="Mobile dashboard navigation"
              className="hide-scrollbar flex gap-1 overflow-x-auto border-t border-border px-3 py-2 lg:hidden"
            >
              {nav.map((item) => {
                const Icon = item.icon ? NAV_ICONS[item.icon] : undefined;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      isActive(item.href)
                        ? "bg-[var(--color-primary-800)] text-white dark:bg-[var(--color-accent-300)] dark:text-[var(--color-primary-950)]"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
