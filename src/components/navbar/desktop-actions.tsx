"use client";

import Link from "next/link";
import { Heart, LayoutDashboard, Search, ShoppingBag, User } from "lucide-react";

import { CurrencyToggle } from "@/components/layout/currency-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

import { SoundToggle } from "./sound-toggle";

const iconButton =
  "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Count({ value, label }: { value: number; label: string }) {
  if (value <= 0) return null;

  return (
    <span
      aria-label={`${value} ${label}`}
      className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-800 px-1 text-[10px] font-bold text-primary-50 dark:bg-accent-300 dark:text-primary-950"
    >
      {value}
    </span>
  );
}

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
        className={cn(iconButton, "md:hidden")}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>

      <SoundToggle className="hidden sm:inline-flex" />
      <CurrencyToggle className="mr-0.5 hidden xl:inline-flex" />
      <ThemeToggle className="hidden sm:inline-flex" />

      <Link
        href="/wishlist"
        aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}
        className={cn(iconButton, "hidden sm:inline-flex")}
      >
        <Heart className="h-4 w-4" aria-hidden="true" />
        <Count value={wishlistCount} label="saved items" />
      </Link>

      <Link
        href={accountHref}
        aria-label={isStaff ? "Admin dashboard" : "Account"}
        className={cn(iconButton, "hidden sm:inline-flex")}
      >
        {isStaff ? (
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
        ) : (
          <User className="h-4 w-4" aria-hidden="true" />
        )}
      </Link>

      <button
        type="button"
        onClick={onOpenCart}
        aria-label={`Open bag${cartCount ? `, ${cartCount} items` : ""}`}
        className="relative ml-1 inline-flex h-10 items-center gap-2 rounded-full border border-primary-800 bg-primary-800 px-3.5 text-primary-50 shadow-soft transition hover:border-primary-900 hover:bg-primary-900 dark:border-accent-300 dark:bg-accent-300 dark:text-primary-950 dark:hover:bg-accent-200"
      >
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        <span className="hidden text-[11px] font-bold uppercase tracking-[0.14em] sm:inline">
          Bag
        </span>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-300 px-1 text-[11px] font-bold text-primary-950 dark:bg-primary-950 dark:text-accent-300">
          {cartCount}
        </span>
      </button>
    </div>
  );
}
