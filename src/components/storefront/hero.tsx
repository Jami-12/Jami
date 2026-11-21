"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Gem,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import {
  productName,
  productPrimaryImage,
  productSecondaryImage,
} from "@/types";

const FALLBACKS = [
  {
    primary: "/showcase/editorial-rust.webp",
    secondary: "/showcase/rail-rust-1.webp",
    name: "The rust overshirt",
    category: "Outerwear",
  },
  {
    primary: "/showcase/rail-tee-1.webp",
    secondary: "/showcase/detail-tee.webp",
    name: "The ivory tee",
    category: "Essentials",
  },
  {
    primary: "/showcase/rail-wine-1.webp",
    secondary: "/showcase/detail-rust.webp",
    name: "The wine knit",
    category: "Knitwear",
  },
] as const;

const STATS = [
  { value: "48h", label: "Fast Dispatch" },
  { value: "30d", label: "Easy Returns" },
  { value: "4.9/5", label: "Verified Rating" },
] as const;

interface HeroItem {
  key: string;
  primary: string;
  secondary: string;
  name: string;
  category: string;
  href: string;
  price: number | null;
}

function useHeroItems(products: Product[]): HeroItem[] {
  return React.useMemo(
    () =>
      FALLBACKS.map((fallback, index) => {
        const product = products[index] ?? null;
        const primary = product ? productPrimaryImage(product) : null;
        const secondary = product ? productSecondaryImage(product) : null;

        return {
          key: product?.id ?? `hero-${index}`,
          primary: primary ?? fallback.primary,
          secondary: secondary ?? fallback.secondary,
          name: product ? productName(product) : fallback.name,
          category: product?.category?.name ?? fallback.category,
          href: product ? `/products/${product.slug}` : "/products",
          price: product ? product.finalPrice : null,
        };
      }),
    [products],
  );
}

export function Hero({ products }: { products: Product[] }) {
  const reducedMotion = Boolean(useReducedMotion());
  const items = useHeroItems(products);
  const [leftItem, centerItem, rightItem] = items;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden border-b border-border bg-background text-foreground"
    >
      {/* Subtle monochrome architectural grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--foreground)/0.06),transparent_62%)]"
      />

      <div className="container-page relative z-10 pb-14 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
        {/* Top-Center Stylish Editorial Header */}
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
          >
            <Sparkles className="h-3 w-3 text-foreground" aria-hidden="true" />
            The 2026 Considered Collection
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-display text-4xl font-bold uppercase not-italic leading-[0.98] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl"
          >
            Things Worth{" "}
            <span className="mt-1 inline-block rounded-sm bg-foreground px-3.5 py-1 text-background sm:mt-0">
              Living With.
            </span>
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            Quiet tailoring, softened knits, and sculpted everyday essentials —
            photographed true to form and built to hold their shape season after
            season.
          </motion.p>

          {/* Primary Actions */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-full border border-foreground bg-foreground px-7 text-xs font-semibold uppercase tracking-[0.14em] text-background transition-all duration-300 hover:bg-background hover:text-foreground sm:w-auto"
            >
              <Link href="/products">
                Shop Collection
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-full border border-border bg-background px-7 text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition-all duration-300 hover:border-foreground hover:bg-foreground hover:text-background sm:w-auto"
            >
              <Link href="/#product-wall">
                <Gem className="mr-2 h-4 w-4" aria-hidden="true" />
                Explore 3D Wall
              </Link>
            </Button>
          </motion.div>

          {/* Compact Trust Strip */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.32 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
              Encrypted Checkout
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
              Stripe · Visa · bKash · Nagad · COD
            </span>
          </motion.div>
        </div>

        {/* Cohesive 3-Card Product Showcase */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-12 lg:items-end lg:gap-5">
          {/* Left Card */}
          {leftItem ? (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-3"
            >
              <HeroProductCard item={leftItem} aspectClass="aspect-[4/4.6]" />
            </motion.div>
          ) : null}

          {/* Center Featured Card (Elevated) */}
          {centerItem ? (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="sm:col-span-2 lg:col-span-6"
            >
              <HeroProductCard
                item={centerItem}
                featured
                priority
                aspectClass="aspect-[4/4.2] sm:aspect-[16/11] lg:aspect-[16/11.5]"
              />
            </motion.div>
          ) : null}

          {/* Right Card */}
          {rightItem ? (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-3"
            >
              <HeroProductCard item={rightItem} aspectClass="aspect-[4/4.6]" />
            </motion.div>
          ) : null}
        </div>

        {/* Bottom Stats Bar */}
        <motion.dl
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.4 }}
          className="mx-auto mt-8 grid max-w-2xl grid-cols-3 divide-x divide-border rounded-xl border border-border bg-muted/30 py-3.5 text-center sm:mt-10"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="px-3">
              <dt className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {stat.value}
              </dt>
              <dd className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {stat.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}

function HeroProductCard({
  item,
  featured = false,
  priority = false,
  aspectClass,
}: {
  item: HeroItem;
  featured?: boolean;
  priority?: boolean;
  aspectClass: string;
}) {
  return (
    <Link
      href={item.href}
      aria-label={`View ${item.name}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-border bg-muted transition-all duration-500 ease-out hover:-translate-y-1 hover:border-foreground/50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        aspectClass,
      )}
    >
      <SmartImage
        src={item.primary}
        alt={item.name}
        fill
        priority={priority}
        sizes={
          featured
            ? "(max-width: 1024px) 100vw, 48vw"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24vw"
        }
        className={cn(
          "object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]",
          item.secondary && "group-hover:opacity-0",
        )}
      />

      {item.secondary ? (
        <SmartImage
          src={item.secondary}
          alt=""
          fill
          sizes={
            featured
              ? "(max-width: 1024px) 100vw, 48vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24vw"
          }
          className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100"
        />
      ) : null}

      {/* Top Tag */}
      <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
        <span className="rounded-full border border-border/60 bg-background/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-foreground backdrop-blur-md">
          {featured ? `Featured · ${item.category}` : item.category}
        </span>
      </div>

      {/* Bottom Floating Info Bar */}
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/95 px-4 py-3 text-foreground shadow-sm backdrop-blur-md transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold not-italic sm:text-base">
            {item.name}
          </p>
          {item.price !== null ? (
            <Price
              amount={item.price}
              size="sm"
              className="mt-0.5 block text-muted-foreground group-hover:text-background/80"
            />
          ) : (
            <span className="mt-0.5 block text-[11px] text-muted-foreground group-hover:text-background/80">
              Explore piece
            </span>
          )}
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground transition-transform duration-300 group-hover:rotate-45 group-hover:border-background/30 group-hover:bg-background group-hover:text-foreground">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}