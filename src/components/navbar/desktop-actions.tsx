"use client";

import Link from "next/link";
import { Heart, LayoutDashboard, Search, ShoppingBag, User } from "lucide-react";

import { CurrencyToggle } from "@/components/layout/currency-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";

import { SoundToggle } from "./sound-toggle";

export function DesktopActions({
  isStaff,
  accountHref,
  wishlistCount,
  cartCount,
  onSearchOpen,
  onOpenCart,
}: {
  isStaff: boolean;
  accountHref: string;
  wishlistCount: number;
  cartCount: number;
  onSearchOpen: () => void;
  onOpenCart: () => void;
}) {
  return (
    <div className="ml-auto flex items-center gap-0.5 md:ml-0">
      <button
        type="button"
        onClick={onSearchOpen}
        aria-label="Search products"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
      >
        <Search className="h-4.5 w-4.5" aria-hidden="true" />
      </button>

      <SoundToggle className="hidden sm:inline-flex" />
      <CurrencyToggle className="mr-1 hidden xl:inline-flex" />
      <ThemeToggle className="hidden sm:inline-flex" />

      <Link
        href="/wishlist"
        aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}
        className="relative hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground sm:inline-flex"
      >
        <Heart className="h-4.5 w-4.5" aria-hidden="true" />
        {wishlistCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground dark:bg-accent-300 dark:text-[#172B3A]">
            {wishlistCount}
          </span>
        ) : null}
      </Link>

      <Link
        href={accountHref}
        aria-label={isStaff ? "Admin dashboard" : "Account"}
        className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground sm:inline-flex"
      >
        {isStaff ? (
          <LayoutDashboard className="h-4.5 w-4.5" aria-hidden="true" />
        ) : (
          <User className="h-4.5 w-4.5" aria-hidden="true" />
        )}
      </Link>

      <button
        type="button"
        onClick={onOpenCart}
        aria-label={`Open bag${cartCount ? `, ${cartCount} items` : ""}`}
        className="relative ml-1 inline-flex h-10 items-center gap-2 rounded-full border border-primary-800 bg-primary-800 px-3.5 text-primary-foreground shadow-soft transition hover:bg-primary-900 dark:border-accent-300 dark:bg-accent-300 dark:text-[#172B3A] dark:hover:bg-accent-200"
      >
        <ShoppingBag className="h-4.5 w-4.5" aria-hidden="true" />
        <span className="hidden text-[11px] font-bold uppercase tracking-[0.14em] sm:inline">
          Bag
        </span>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground dark:bg-[#172B3A] dark:text-accent-200">
          {cartCount}
        </span>
      </button>
    </div>
  );
}
