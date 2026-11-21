"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { SearchDialog } from "@/components/layout/search-dialog";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { cartItemCount, useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useWishlistStore } from "@/stores/wishlist-store";

import { CategoriesMenu } from "./categories-menu";
import { DesktopActions } from "./desktop-actions";
import { MobileNav } from "./mobile-nav";
import { FALLBACK_CATEGORIES, useNavCategories } from "./use-nav-categories";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "All Products" },
] as const;

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

  const user = useAuthStore((state) => state.user);
  const isStaff = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const accountHref = isStaff ? "/admin" : "/account";

  const navCategories = useNavCategories();
  const categoriesList = navCategories.data?.length
    ? navCategories.data
    : FALLBACK_CATEGORIES;

  const count = hydrated ? cartItemCount(cartItems) : 0;
  const wishlistCount = hydrated ? wishlistIds.length : 0;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);

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

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b border-border bg-background not-italic",
          scrolled && "bg-surface",
        )}
      >
        <div
          className={cn(
            "container-page flex items-center justify-between gap-4",
            scrolled ? "h-15 lg:h-16" : "h-17 lg:h-20",
          )}
        >
          {/* Left: Mobile Drawer Trigger + Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
              className="h-10 w-10 rounded-none border border-border bg-card text-foreground hover:border-foreground hover:bg-foreground hover:text-background lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>

            <Brand
              wordmarkClassName="text-sm font-bold uppercase tracking-[0.2em] text-foreground not-italic"
              className="shrink-0"
            />
          </div>

          {/* Center: Desktop Nav Links & Categories Menu */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-none border px-4 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive(link.href)
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:border-foreground hover:bg-foreground hover:text-background",
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center">
              <CategoriesMenu />
            </div>
          </nav>

          {/* Right: Compact Search Pill + Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search catalog"
              className="group hidden h-10 items-center gap-2.5 rounded-none border border-border bg-card px-3.5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:flex"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Search items...</span>
              <kbd className="rounded-none border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground group-hover:border-background group-hover:bg-transparent group-hover:text-background">
                Ctrl K
              </kbd>
            </button>

            <DesktopActions
              isStaff={isStaff}
              accountHref={accountHref}
              wishlistCount={wishlistCount}
              cartCount={count}
              onSearchOpen={() => setSearchOpen(true)}
              onOpenCart={openCart}
            />
          </div>
        </div>

        {/* Clean Quick Category Strip on Desktop */}
        {categoriesList.length > 0 ? (
          <div className="hidden border-t border-border bg-surface lg:block">
            <div className="container-page hide-scrollbar flex h-9 items-center gap-6 overflow-x-auto text-[11px] font-semibold uppercase tracking-[0.14em] not-italic">
              {categoriesList.slice(0, 8).map((category) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${encodeURIComponent(category.slug)}`}
                  className="shrink-0 border-b border-transparent py-0.5 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNav(false)}
        categories={categoriesList}
        isStaff={isStaff}
        accountHref={accountHref}
        wishlistCount={wishlistCount}
      />

      <SearchDialog />
    </>
  );
}
