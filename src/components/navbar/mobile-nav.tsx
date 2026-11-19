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
import { CurrencyToggle } from "@/components/layout/currency-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Drawer } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import type { Category } from "@/types";

import { SoundToggle } from "./sound-toggle";

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
      className="max-w-[22rem]"
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-border px-5 py-4">
          <Brand href="/" onClick={onClose} className="mb-4" />
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <SoundToggle />
              <ThemeToggle />
            </div>
            <CurrencyToggle />
          </div>
        </div>

        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-muted"
              >
                <span className="flex items-center gap-2.5">
                  <Home className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Home
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-muted"
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Shop the collection
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          </ul>

          <Separator className="my-4" />

          <div className="px-1">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Categories
            </p>
            <ul className="grid grid-cols-2 gap-1.5">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products?category=${encodeURIComponent(category.slug)}`}
                    onClick={onClose}
                    className="block rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-accent-400/50 hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="space-y-1 border-t border-border px-4 py-4">
          <Link
            href={accountHref}
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            {isStaff ? (
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            ) : (
              <User className="h-4 w-4" aria-hidden="true" />
            )}
            {isStaff ? "Admin dashboard" : "Account"}
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            Wishlist
            {wishlistCount > 0 ? (
              <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-semibold">
                {wishlistCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </Drawer>
  );
}
