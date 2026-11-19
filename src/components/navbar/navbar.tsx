"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Menu } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { SearchDialog } from "@/components/layout/search-dialog";
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

// Navbar font. Swap for any Google font you like.
const navFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

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
  const isStaff = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
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
          navFont.className,
          "sticky top-0 z-40 w-full transition-colors duration-300",
          scrolled
            ? "border-b border-border bg-background/90 backdrop-blur-lg"
            : "border-b border-transparent bg-background",
        )}
      >
        <div
          className={cn(
            "container-page grid grid-cols-[1fr_auto_1fr] items-center gap-3 transition-[height] duration-300",
            scrolled ? "h-14 lg:h-16" : "h-16 lg:h-20",
          )}
        >
          {/* Left: menu button on mobile, links on desktop */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-muted lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-6 lg:flex"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "border-b-2 py-1 text-sm font-semibold transition-colors",
                    isActive(link.href)
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <CategoriesMenu />
            </nav>
          </div>

          {/* Center: logo */}
          <div className="flex justify-center">
            <Brand wordmarkClassName="hidden sm:flex" className="shrink-0" />
          </div>

          {/* Right: one search + actions */}
          <div className="flex items-center justify-end gap-2 lg:gap-3">

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
      </header>

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNav(false)}
        categories={mobileCategories}
        isStaff={isStaff}
        accountHref={accountHref}
        wishlistCount={wishlistCount}
      />

      <SearchDialog />
    </>
  );
}