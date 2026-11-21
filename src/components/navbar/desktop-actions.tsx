"use client";

import Link from "next/link";
import { Heart, LayoutDashboard, Search, ShoppingBag, User } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const iconButton =
  "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-border bg-background text-muted-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Count({ value, label }: { value: number; label: string }) {
  if (value <= 0) return null;

  return (
    <span
      aria-label={`${value} ${label}`}
      className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-none border border-background bg-foreground px-1 text-[10px] font-bold tabular-nums text-background"
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
        className={iconButton}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>

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
        className="relative ml-1 inline-flex h-10 items-center gap-2 rounded-none border border-foreground bg-primary px-3.5 text-primary-foreground transition-colors hover:border-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        <span className="hidden text-[11px] font-bold uppercase tracking-[0.14em] not-italic sm:inline">
          Bag
        </span>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-none border border-primary bg-primary-foreground px-1 text-[11px] font-bold tabular-nums text-primary">
          {cartCount}
        </span>
      </button>
    </div>
  );
}
