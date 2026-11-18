"use client";

import Link from "next/link";
import { ArrowRight, Heart, LayoutDashboard, User } from "lucide-react";

import { CurrencyToggle } from "@/components/layout/currency-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Drawer } from "@/components/ui/drawer";
import type { Category } from "@/types";

import { NavSearch } from "./nav-search";
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
      title="Aether"
      description="Modern wardrobe, considered"
      side="left"
      className="max-w-[22rem]"
    >
      <div className="flex h-full flex-col px-5 pb-6">
        <NavSearch className="mt-4" />

        <div className="mt-3 flex items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-1">
            <SoundToggle />
            <ThemeToggle />
          </div>
          <CurrencyToggle />
        </div>

        <nav aria-label="Mobile navigation" className="mt-4">
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 font-display text-base font-semibold transition hover:bg-muted"
              >
                Home
                <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 font-display text-base font-semibold transition hover:bg-muted"
              >
                Shop
                <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </nav>

        <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Categories
        </p>
        <ul className="mt-2 grid grid-cols-2 gap-1.5">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/products?category=${encodeURIComponent(category.slug)}`}
                onClick={onClose}
                className="block rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary-300 hover:text-foreground"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-1 border-t border-border pt-4">
          <Link
            href={accountHref}
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-muted"
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
  );
}
