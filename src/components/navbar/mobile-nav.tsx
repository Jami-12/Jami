"use client";

import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Home,
  LayoutDashboard,
  ShoppingBag,
  User,
} from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Drawer } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import type { Category } from "@/types";

export function MobileNav({
  open,
  onClose,
  categories,
  isStaff,
  accountHref,
  wishlistCount,
}: {
  open: boolean;
  onClose: () => void;
  categories: Array<Pick<Category, "id" | "name" | "slug">>;
  isStaff: boolean;
  accountHref: string;
  wishlistCount: number;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Menu"
      description="Browse, search and manage your account"
      side="left"
      className="max-w-[22rem] border-border bg-background text-foreground"
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-background px-5 py-4">
          <Brand href="/" onClick={onClose} className="mb-4" />
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 border border-border p-1">
              <ThemeToggle />
            </div>
          </div>
        </div>

        <nav
          aria-label="Mobile navigation"
          className="flex-1 overflow-y-auto px-4 py-4 not-italic"
        >
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                onClick={onClose}
                className="group flex items-center justify-between rounded-none border border-border bg-background px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
              >
                <span className="flex items-center gap-2.5">
                  <Home className="h-4 w-4 text-current" aria-hidden="true" />
                  Home
                </span>
                <ArrowRight
                  className="h-4 w-4 text-current"
                  aria-hidden="true"
                />
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                onClick={onClose}
                className="group flex items-center justify-between rounded-none border border-border bg-background px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag
                    className="h-4 w-4 text-current"
                    aria-hidden="true"
                  />
                  Shop the collection
                </span>
                <ArrowRight
                  className="h-4 w-4 text-current"
                  aria-hidden="true"
                />
              </Link>
            </li>
          </ul>

          <Separator className="my-4 bg-border" />

          <div className="px-1">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground not-italic">
              Categories
            </p>
            <ul className="grid grid-cols-2 gap-1.5">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products?category=${encodeURIComponent(category.slug)}`}
                    onClick={onClose}
                    className="block truncate rounded-none border border-border bg-card px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="space-y-1 border-t border-border bg-background px-4 py-4">
          <Link
            href={accountHref}
            onClick={onClose}
            className="group flex items-center gap-2.5 rounded-none border border-border bg-background px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
          >
            {isStaff ? (
              <LayoutDashboard className="h-4 w-4 text-current" aria-hidden="true" />
            ) : (
              <User className="h-4 w-4 text-current" aria-hidden="true" />
            )}
            {isStaff ? "Admin dashboard" : "Account"}
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="group flex items-center gap-2.5 rounded-none border border-border bg-background px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <Heart className="h-4 w-4 text-current" aria-hidden="true" />
            Wishlist
            {wishlistCount > 0 ? (
              <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-none border border-foreground bg-foreground px-1.5 text-[11px] font-bold tabular-nums text-background group-hover:border-background group-hover:bg-background group-hover:text-foreground">
                {wishlistCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </Drawer>
  );
}
