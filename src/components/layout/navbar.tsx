"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Heart,
  LayoutDashboard,
  Menu,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";

import { Brand } from "./brand";
import { CurrencyToggle } from "./currency-toggle";
import { SearchDialog } from "./search-dialog";
import { ThemeToggle } from "./theme-toggle";
import { Drawer } from "@/components/ui/drawer";
import { MAIN_NAV, CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { cartItemCount, useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useHydrated } from "@/hooks/use-hydrated";

export function Navbar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const [scrolled, setScrolled] = React.useState(false);
  const cartItems = useCartStore((state) => state.items);
  const wishlistIds = useWishlistStore((state) => state.ids);
  const openCart = useUiStore((state) => state.openCart);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNav = useUiStore((state) => state.setMobileNav);

  const count = hydrated ? cartItemCount(cartItems) : 0;
  const wishlistCount = hydrated ? wishlistIds.length : 0;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setSearchOpen]);

  const isActive = (href: string) => {
    if (href === "/products") return pathname === "/products";
    if (href.startsWith("/products?")) return false;
    if (href.startsWith("/#")) return false;
    return pathname === href;
  };

  const closeMobile = () => setMobileNav(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled
            ? "glass-strong border-border/80 shadow-soft"
            : "border-transparent bg-background/70 backdrop-blur-md",
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-3 lg:h-[4.5rem]">
          <div className="flex items-center gap-2 lg:gap-8">
            <button
              type="button"
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition hover:bg-muted lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <Brand />
            <nav aria-label="Main navigation" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {MAIN_NAV.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        "relative inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold transition-colors",
                        isActive(link.href)
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-accent-200"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Search className="h-4.5 w-4.5" aria-hidden="true" />
              <span className="hidden text-xs font-semibold xl:inline">Search</span>
              <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground xl:inline">
                ⌘K
              </kbd>
            </button>
            <CurrencyToggle className="mr-1 hidden md:inline-flex" />
            <ThemeToggle />
            <Link
              href="/wishlist"
              aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}
              className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              <Heart className="h-4.5 w-4.5" aria-hidden="true" />
              {wishlistCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              <User className="h-4.5 w-4.5" aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard"
              aria-label="Vendor and admin dashboard"
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground xl:inline-flex"
            >
              <LayoutDashboard className="h-4.5 w-4.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open bag${count ? `, ${count} items` : ""}`}
              className="relative ml-1 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-primary-foreground shadow-soft transition hover:bg-primary-800"
            >
              <ShoppingBag className="h-4.5 w-4.5" aria-hidden="true" />
              <span className="hidden text-xs font-bold sm:inline">Bag</span>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
                {count}
              </span>
            </button>
          </div>
        </div>
      </header>

      <Drawer
        open={mobileNavOpen}
        onClose={closeMobile}
        title="Menu"
        description="Objects for a considered life"
        side="left"
        className="max-w-[21rem]"
      >
        <div className="flex h-full flex-col px-5 pb-6">
          <div className="flex items-center justify-between gap-3 py-4">
            <CurrencyToggle />
            <ThemeToggle />
          </div>
          <nav aria-label="Mobile navigation">
            <ul className="space-y-1">
              {MAIN_NAV.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={closeMobile}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-muted"
                  >
                    {link.label}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="mt-6 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Categories
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-1.5">
            {CATEGORIES.map((category) => (
              <li key={category.value}>
                <Link
                  href={`/products?category=${category.value}`}
                  onClick={closeMobile}
                  className="block rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto space-y-1 border-t border-border pt-4">
            <Link
              href="/account"
              onClick={closeMobile}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-muted"
            >
              <User className="h-4 w-4" aria-hidden="true" /> Account
            </Link>
            <Link
              href="/dashboard"
              onClick={closeMobile}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Dashboard
            </Link>
            <Link
              href="/wishlist"
              onClick={closeMobile}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-muted"
            >
              <Heart className="h-4 w-4" aria-hidden="true" /> Wishlist
              {wishlistCount > 0 ? (
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </Drawer>

      <SearchDialog />
    </>
  );
}
