
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { SearchDialog } from "@/components/layout/search-dialog";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { cartItemCount, useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useWishlistStore } from "@/stores/wishlist-store";

import { BrandsMenu } from "./brands-menu";
import { CategoriesMenu } from "./categories-menu";
import { DesktopActions } from "./desktop-actions";
import { MobileNav } from "./mobile-nav";
import { NavSearch } from "./nav-search";
import { FALLBACK_CATEGORIES, useNavCategories } from "./use-nav-categories";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
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
  const isStaff =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const accountHref = isStaff ? "/admin" : "/account";

  const navCategories = useNavCategories();
  const mobileCategories = navCategories.data?.length
    ? navCategories.data
    : FALLBACK_CATEGORIES;

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
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setSearchOpen]);

  const closeMobile = () => setMobileNav(false);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b transition-all duration-300",
          scrolled
            ? "border-border/80 bg-background/95 shadow-sm backdrop-blur-xl"
            : "border-border/50 bg-background/85 backdrop-blur-md",
        )}
      >
        <div
          className={cn(
            "container-page flex items-center gap-3 transition-all duration-300 lg:gap-6",
            scrolled ? "h-14 lg:h-16" : "h-16 lg:h-[4.75rem]",
          )}
        >
          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileNavOpen}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/70 text-foreground transition-colors hover:border-[#B18A48]/50 hover:bg-muted lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Brand */}
          <div className="shrink-0">
            <Brand
              wordmarkClassName="hidden sm:flex"
              className="shrink-0"
            />
          </div>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden shrink-0 items-center gap-1 lg:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-10 items-center rounded-lg px-3.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors",
                  isActive(link.href)
                    ? "text-[#B18A48]"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                {link.label}

                {isActive(link.href) && (
                  <span className="absolute inset-x-3 bottom-1 h-[2px] rounded-full bg-[#B18A48]" />
                )}
              </Link>
            ))}

            <CategoriesMenu />
            <BrandsMenu />
          </nav>

          {/* Search */}
          <NavSearch className="ml-auto hidden max-w-sm flex-1 md:block" />

          {/* Actions */}
          <DesktopActions
            isStaff={isStaff}
            accountHref={accountHref}
            wishlistCount={wishlistCount}
            cartCount={count}
            onSearchOpen={() => setSearchOpen(true)}
            onOpenCart={openCart}
          />
        </div>

        {/* Mobile search */}
        <div className="border-t border-border/50 px-4 py-2.5 md:hidden">
          <NavSearch className="w-full" />
        </div>
      </header>

      <MobileNav
        open={mobileNavOpen}
        onClose={closeMobile}
        categories={mobileCategories}
        isStaff={isStaff}
        accountHref={accountHref}
        wishlistCount={wishlistCount}
      />

      <SearchDialog />
    </>
  );
}
