"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  Boxes,
  Calculator,
  ChevronRight,
  Heart,
  IdCard,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Package,
  ReceiptText,
  ScrollText,
  ShieldCheck,
  Star,
  Sun,
  Tag,
  Ticket,
  TrendingUp,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { CurrencyToggle } from "@/components/layout/currency-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useTheme } from "@/components/providers/theme-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { notificationsApi } from "@/lib/api/services";
import { ROLE_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import type { Role, UserPublic } from "@/types";

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

function NavigationList({
  nav,
  pathname,
  onNavigate,
}: {
  nav: readonly ShellNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = (href: string) =>
    href === pathname || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <ul className="space-y-1">
      {nav.map((item) => {
        const Icon = item.icon ? NAV_ICONS[item.icon] : undefined;
        const active = isActive(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-[var(--color-primary-800)] text-white shadow-[0_10px_24px_-16px_rgba(23,43,58,0.9)] dark:bg-[var(--color-accent-300)] dark:text-[var(--color-primary-950)]"
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
                    "h-4 w-4 shrink-0 transition-opacity",
                    active ? "opacity-100" : "opacity-70 group-hover:opacity-100",
                  )}
                  aria-hidden="true"
                />
              ) : null}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.superOnly ? (
                <span className="rounded-full border border-current/25 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest opacity-70">
                  SA
                </span>
              ) : null}
              {active ? (
                <ChevronRight className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function UserMenu({
  user,
  signOut,
  side = "top",
  align = "start",
  triggerClassName,
}: {
  user: UserPublic | null;
  signOut: () => void;
  side?: "top" | "bottom";
  align?: "start" | "end";
  triggerClassName?: string;
}) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const currency = useUiStore((state) => state.currency);
  const toggleCurrency = useUiStore((state) => state.toggleCurrency);

  const role: Role | undefined = user?.role;
  const meta = role ? ROLE_META[role] : null;
  const homeHref =
    role === "CUSTOMER"
      ? "/account"
      : role === "ADMIN"
        ? "/admin"
        : role === "SUPER_ADMIN"
          ? "/super-admin"
          : "/";

  const roleLinks: { label: string; href: string; icon: LucideIcon }[] =
    role === "CUSTOMER"
      ? [
          { label: "Profile", href: "/account/profile", icon: User },
          { label: "Orders", href: "/account/orders", icon: ReceiptText },
          { label: "Addresses", href: "/account/addresses", icon: MapPin },
          { label: "Notifications", href: "/account/notifications", icon: Bell },
        ]
      : role === "SUPER_ADMIN"
        ? [
            { label: "Super admin", href: "/super-admin", icon: ShieldCheck },
            { label: "Admin console", href: "/admin", icon: LayoutDashboard },
            { label: "Notifications", href: "/super-admin/notifications", icon: Bell },
          ]
        : [
            { label: "Admin console", href: "/admin", icon: LayoutDashboard },
            { label: "Notifications", href: "/admin/notifications", icon: Bell },
          ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className={cn(
            "inline-flex items-center gap-2 rounded-xl p-1.5 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            triggerClassName,
          )}
        >
          <Avatar name={user?.name ?? "Guest"} src={user?.image} size="sm" />
          <span className="hidden min-w-0 flex-1 sm:block">
            <span className="block truncate text-xs font-semibold leading-tight">
              {user?.name ?? "Guest"}
            </span>
            <span className="block truncate text-[10px] text-muted-foreground">
              {meta?.label ?? "Account"}
            </span>
          </span>
          <ChevronRight
            className="hidden h-3.5 w-3.5 rotate-90 text-muted-foreground sm:block"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side={side} align={align} className="w-64">
        <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
        <div className="px-3 pb-2">
          <p className="truncate text-sm font-semibold">{user?.name ?? "Guest"}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {user?.email ?? "Not signed in"}
          </p>
          {meta ? (
            <Badge tone={meta.tone} className="mt-2">
              {meta.label}
            </Badge>
          ) : null}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push(homeHref)}>
          <LayoutDashboard className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Workspace
        </DropdownMenuItem>
        {roleLinks.map((link) => {
          const Icon = link.icon;
          return (
            <DropdownMenuItem key={link.href} onSelect={() => router.push(link.href)}>
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {link.label}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/")}>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Back to storefront
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={toggleTheme}>
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={toggleCurrency}>
          <ArrowLeftRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Prices in {currency}
          <span className="ml-auto text-[10px] text-muted-foreground">
            Switch
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={signOut}
          className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-300"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // A fresh route should never retain a stale drawer overlay.
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const notifications = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.list({ limit: 1 }),
    enabled: Boolean(user),
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const notificationsHref =
    pathname.startsWith("/admin")
      ? "/admin/notifications"
      : user?.role === "CUSTOMER"
        ? "/account/notifications"
        : "/super-admin/notifications";
  const unreadCount = notifications.data?.unreadCount ?? 0;
  const meta = user ? ROLE_META[user.role] : null;

  const signOut = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:shadow-lift"
      >
        Skip to content
      </a>

      <div className="mx-auto flex w-full max-w-[112rem]">
        <aside className="sticky top-0 hidden h-dvh w-[17.5rem] shrink-0 flex-col border-r border-border bg-card/70 backdrop-blur-xl lg:flex">
          <div className="flex h-[4.75rem] shrink-0 items-center border-b border-border px-6">
            <Brand href="/" />
          </div>

          <div className="px-5 pb-4 pt-6">
            <p className="eyebrow text-muted-foreground">Workspace</p>
            <p className="mt-1 truncate font-display text-lg font-semibold leading-tight">
              {title}
            </p>
            {subtitle ? (
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>

          <nav
            aria-label="Dashboard navigation"
            className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-4"
          >
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Navigation
            </p>
            <NavigationList nav={nav} pathname={pathname} />
          </nav>

          <div className="shrink-0 border-t border-border p-3">
            <UserMenu user={user} signOut={signOut} side="top" align="start" triggerClassName="w-full" />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
            <div className="flex h-[4.75rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="shrink-0 lg:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="flex w-[min(20rem,88vw)] flex-col gap-0 border-r p-0 sm:max-w-[20rem]"
                >
                  <SheetHeader className="gap-2 border-b border-border px-5 py-5 pr-12">
                    <Brand href="/" />
                    <SheetTitle className="font-display text-lg">{title}</SheetTitle>
                    <SheetDescription className="text-xs">
                      {subtitle ?? "Navigate your workspace"}
                    </SheetDescription>
                  </SheetHeader>

                  <nav
                    aria-label="Mobile dashboard navigation"
                    className="hide-scrollbar flex-1 overflow-y-auto px-3 py-4"
                  >
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                      Navigation
                    </p>
                    <NavigationList
                      nav={nav}
                      pathname={pathname}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </nav>

                  <div className="shrink-0 border-t border-border p-4">
                    <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
                      <Avatar name={user?.name ?? "Account"} src={user?.image} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold">
                          {user?.name ?? "Account"}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                      {meta ? <Badge tone={meta.tone}>{meta.label}</Badge> : null}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center gap-2">
                      <ThemeToggle className="h-9 w-9 shrink-0 rounded-xl border border-border bg-card" />
                      <CurrencyToggle className="h-9 flex-1 justify-center rounded-xl border border-border bg-card text-xs" />
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={signOut}
                        aria-label="Sign out"
                        className="h-9 w-9 shrink-0"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="lg:hidden">
                <Brand href="/" showWordmark={false} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:flex">
                  <span>{meta?.label ?? "Workspace"}</span>
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                  <span className="truncate text-foreground/70">{title}</span>
                </div>
                <h1 className="truncate font-display text-lg font-semibold leading-tight sm:text-xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-0.5 hidden truncate text-[11px] text-muted-foreground sm:block">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {meta ? (
                  <Badge tone={meta.tone} className="hidden xl:inline-flex">
                    {meta.label}
                  </Badge>
                ) : null}

                <div className="hidden items-center rounded-full border border-border bg-card/70 p-0.5 sm:flex">
                  <ThemeToggle className="h-8 w-8" />
                  <Separator orientation="vertical" className="mx-0.5 h-4" />
                  <CurrencyToggle className="h-8 px-2 text-[11px]" />
                </div>

                {user ? (
                  <Button
                    asChild
                    variant="outline"
                    size="icon-sm"
                    className="relative h-9 w-9"
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                  >
                    <Link
                      href={notificationsHref}
                      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                    >
                      <Bell className="h-4 w-4" aria-hidden="true" />
                      {unreadCount > 0 ? (
                        <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-[var(--color-accent-500)] px-1 text-[9px] font-bold leading-4 text-[var(--color-primary-950)] ring-2 ring-background">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      ) : null}
                    </Link>
                  </Button>
                ) : null}

                {user ? (
                  <UserMenu
                    user={user}
                    signOut={signOut}
                    side="bottom"
                    align="end"
                    triggerClassName="hidden sm:inline-flex"
                  />
                ) : null}
              </div>
            </div>
          </header>

          <main id="main-content" className="mx-auto w-full max-w-[88rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
