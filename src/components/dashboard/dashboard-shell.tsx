"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  Boxes,
  Calculator,
  CheckCheck,
  ChevronDown,
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
import { toast } from "sonner";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { NOTIFICATION_META, ROLE_META } from "@/lib/constants";
import { cn, formatRelative, getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import type { Role, UserPublic } from "@/types";

export interface ShellNavItem {
  label: string;
  href: string;
  icon?: string;
  superOnly?: boolean;
}

export interface ShellNavGroup {
  label: string;
  items: readonly ShellNavItem[];
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

function isPathActive(href: string, pathname: string) {
  return href === pathname || (href !== "/" && pathname.startsWith(`${href}/`));
}

function NavigationList({
  groups,
  pathname,
  onNavigate,
}: {
  groups: readonly ShellNavGroup[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  // Keep the section containing the current route expanded after navigation.
  React.useEffect(() => {
    const activeGroup = groups.find((group) =>
      group.items.some((item) => isPathActive(item.href, pathname)),
    );
    if (activeGroup) {
      setCollapsed((previous) =>
        previous[activeGroup.label] ? { ...previous, [activeGroup.label]: false } : previous,
      );
    }
  }, [groups, pathname]);

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const open = !collapsed[group.label];
        return (
          <section key={group.label}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() =>
                setCollapsed((previous) => ({
                  ...previous,
                  [group.label]: !previous[group.label],
                }))
              }
              className="flex min-h-9 w-full items-center justify-between rounded-xl px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/80 transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>{group.label}</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  open ? "rotate-0" : "-rotate-90",
                )}
                aria-hidden="true"
              />
            </button>

            {open ? (
              <ul className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon ? NAV_ICONS[item.icon] : undefined;
                  const active = isPathActive(item.href, pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex min-h-11 items-center gap-3 rounded-full px-3.5 py-2 text-sm font-medium transition-[color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          active
                            ? "bg-[var(--secondary)] text-[var(--primary)] shadow-[var(--shadow-soft)]"
                            : "text-muted-foreground hover:bg-[var(--muted)] hover:text-foreground",
                        )}
                      >
                        {Icon ? (
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-opacity duration-200",
                              active ? "opacity-100" : "opacity-70 group-hover:opacity-100",
                            )}
                            aria-hidden="true"
                          />
                        ) : null}
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.superOnly ? (
                          <span className="rounded-full border border-current/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest opacity-70">
                            SA
                          </span>
                        ) : null}
                        {active ? (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                            aria-hidden="true"
                          />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
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
  const currency = useUiStore((state) => state.currency);
  const toggleCurrency = useUiStore((state) => state.toggleCurrency);
  const { theme, toggleTheme } = useTheme();

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
            "inline-flex min-h-11 items-center gap-2 rounded-full p-1.5 text-left transition-colors duration-200 hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
          <span className="ml-auto text-[10px] text-muted-foreground">Switch</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={signOut}
          className="text-[var(--danger)] focus:bg-[var(--danger-soft)] focus:text-[var(--danger)]"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationsPopover({
  href,
  unreadCount: badgeCount,
}: {
  href: string;
  unreadCount: number;
}) {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["notifications", "popover"],
    queryFn: () => notificationsApi.list({ limit: 5 }),
    enabled: open,
    refetchInterval: open ? 45_000 : false,
  });

  const invalidate = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  const markOne = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const markAll = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      invalidate();
      toast.success("All notifications marked as read");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const unreadCount = list.data?.unreadCount ?? badgeCount;
  const items = list.data?.items ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-11 w-11 rounded-full"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold leading-5 text-[var(--primary-950)] ring-2 ring-[var(--background)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-[11px] text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "You are all caught up"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-xs"
            disabled={unreadCount === 0 || markAll.isPending}
            loading={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Mark all
          </Button>
        </div>

        <div className="hide-scrollbar max-h-[22rem] overflow-y-auto">
          {list.isLoading ? (
            <ul className="space-y-2 p-3" aria-label="Loading notifications">
              {[0, 1, 2].map((key) => (
                <li key={key} className="h-14 animate-pulse rounded-2xl bg-[var(--muted)]" />
              ))}
            </ul>
          ) : items.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {items.map((notification) => {
                const meta = NOTIFICATION_META[notification.type];
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      disabled={notification.isRead || markOne.isPending}
                      onClick={() =>
                        notification.isRead ? undefined : markOne.mutate(notification.id)
                      }
                      className={cn(
                        "flex w-full min-h-16 items-start gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-[var(--muted)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:cursor-default",
                        !notification.isRead && "bg-[var(--secondary)]/50",
                      )}
                    >
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-current opacity-70" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-xs font-semibold">
                            {notification.title}
                          </span>
                          <Badge tone={meta.tone} className="shrink-0 text-[9px]">
                            {meta.label}
                          </Badge>
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-[11px] leading-relaxed text-muted-foreground">
                          {notification.message}
                        </span>
                        <span className="mt-1 block text-[10px] text-muted-foreground/80">
                          {formatRelative(notification.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-[var(--border)] p-2">
          <Button asChild variant="ghost" className="w-full justify-center rounded-full">
            <Link href={href} onClick={() => setOpen(false)}>
              View all notifications
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DashboardShell({
  nav,
  groups,
  title,
  subtitle,
  children,
}: {
  nav: readonly ShellNavItem[];
  /** When provided, replaces the single flat section with grouped sections. */
  groups?: readonly ShellNavGroup[];
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navGroups = React.useMemo<readonly ShellNavGroup[]>(
    () => groups ?? [{ label: "Navigation", items: nav }],
    [groups, nav],
  );

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const notifications = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.list({ limit: 1 }),
    enabled: Boolean(user),
    staleTime: 30_000,
    refetchInterval: 45_000,
    refetchOnWindowFocus: true,
  });

  const notificationsHref = pathname.startsWith("/admin")
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
    <div className="min-h-dvh bg-[var(--background)] text-foreground">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <div className="mx-auto flex w-full max-w-[112rem]">
        <aside className="sticky top-0 hidden h-dvh w-[17.5rem] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)]/70 backdrop-blur-xl lg:flex">
          <div className="flex h-[var(--header-height)] shrink-0 items-center border-b border-[var(--border)] px-6">
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
            <NavigationList groups={navGroups} pathname={pathname} />
          </nav>

          <div className="shrink-0 border-t border-[var(--border)] p-3">
            <UserMenu
              user={user}
              signOut={signOut}
              side="top"
              align="start"
              triggerClassName="w-full"
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl">
            <div className="flex h-[var(--header-height)] items-center gap-3 px-4 sm:px-6 lg:px-8">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 lg:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="flex w-[min(20rem,88vw)] flex-col gap-0 border-r p-0 sm:max-w-[20rem]"
                >
                  <SheetHeader className="gap-2 border-b border-[var(--border)] px-5 py-5 pr-12">
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
                    <NavigationList
                      groups={navGroups}
                      pathname={pathname}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </nav>

                  <div className="shrink-0 border-t border-[var(--border)] p-4">
                    <div className="flex items-center gap-3 rounded-2xl bg-[var(--muted)]/60 p-3">
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
                      <ThemeToggle className="h-11 w-11 shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)]" />
                      <CurrencyToggle className="h-11 flex-1 justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-xs" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={signOut}
                        aria-label="Sign out"
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

                <div className="hidden items-center rounded-full border border-[var(--border)] bg-[var(--card)]/70 p-0.5 sm:flex">
                  <ThemeToggle className="h-9 w-9 rounded-full" />
                  <Separator orientation="vertical" className="mx-0.5 h-4" />
                  <CurrencyToggle className="h-9 rounded-full px-2 text-[11px]" />
                </div>

                {user ? (
                  <NotificationsPopover
                    href={notificationsHref}
                    unreadCount={unreadCount}
                  />
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

          <main
            id="main-content"
            className="mx-auto w-full max-w-[88rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-10"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
