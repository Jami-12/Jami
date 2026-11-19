"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

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
    primary: "/showcase/rail-tee-1.webp",
    secondary: "/showcase/rail-tee-2.webp",
    name: "The ivory tee",
    category: "Essentials",
  },
  {
    primary: "/showcase/rail-rust-1.webp",
    secondary: "/showcase/rail-rust-2.webp",
    name: "The rust overshirt",
    category: "Outerwear",
  },
  {
    primary: "/showcase/rail-wine-1.webp",
    secondary: "/showcase/rail-wine-3.webp",
    name: "The wine knit",
    category: "Knitwear",
  },
] as const;

interface ShowcaseItem {
  key: string;
  primary: string;
  secondary: string;
  name: string;
  category: string;
  href: string;
  price: number | null;
  product: Product | null;
}

function Hanger({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 82" fill="none" aria-hidden="true" className={className}>
      <path
        d="M90 38V25.5C90 17.5 96.5 11 104.5 11S119 17.5 119 25.5 112.5 40 104.5 40c-4 0-7.7-1.7-10.3-4.5"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        className="text-muted-foreground dark:text-primary"
      />
      <path
        d="M90 37 16 67h148L90 37Z"
        fill="currentColor"
        className="text-border"
      />
      <path d="M90 37 43 61h94L90 37Z" fill="currentColor" className="text-background" />
    </svg>
  );
}

export function HangingShowcase({ products }: { products: Product[] }) {
  const reducedMotion = Boolean(useReducedMotion());
  const [active, setActive] = React.useState<number | null>(null);

  const items = React.useMemo<ShowcaseItem[]>(() => {
    return FALLBACKS.map((fallback, index) => {
      const product = products[index] ?? null;
      const primary = product ? productPrimaryImage(product) : null;
      const secondary = product ? productSecondaryImage(product) : null;

      return {
        key: product?.id ?? `showcase-${index}`,
        primary: primary ?? fallback.primary,
        secondary: secondary ?? fallback.secondary,
        name: product ? productName(product) : fallback.name,
        category: product?.category?.name ?? fallback.category,
        href: product ? `/products/${product.slug}` : "/products",
        price: product ? product.finalPrice : null,
        product,
      };
    });
  }, [products]);

  return (
    <section
      aria-labelledby="showcase-heading"
      className="relative overflow-hidden border-b border-border/70 bg-background text-foreground"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_78%_-10%,color-mix(in_srgb,var(--card)_92%,transparent),transparent_64%)] dark:bg-[radial-gradient(70%_60%_at_78%_-10%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent_64%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,var(--primary)_1px,transparent_1px)] [background-size:96px_100%] dark:opacity-[0.06]"
      />

      <div className="container-page relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-14 lg:py-20">
        <div className="relative z-10 max-w-xl">
          <p className="eyebrow inline-flex items-center gap-2 text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            The autumn / winter edit
          </p>

          <h1
            id="showcase-heading"
            className="mt-5 font-display text-[2.9rem] font-semibold leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-[4.4rem]"
          >
            Considered
            <span className="block italic text-primary">
              from the hanger
            </span>
            outward.
          </h1>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            A tightly edited wardrobe of quiet tailoring, softened knits and
            pieces that hold their shape. Photographed exactly as they arrive —
            nothing styled beyond the clothes themselves.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/products">
                Shop the collection
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border bg-transparent text-foreground hover:bg-muted"
            >
              <Link href="/#collections">View lookbook</Link>
            </Button>
          </div>

          <dl className="mt-10 grid max-w-sm grid-cols-3 gap-4 border-t border-border pt-5">
            {[
              { value: "12", label: "pieces this drop" },
              { value: "48h", label: "dispatch" },
              { value: "30d", label: "returns" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-2xl font-semibold leading-none">{stat.value}</dt>
                <dd className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative min-w-0">
          <div
            aria-hidden="true"
            className="rail-line absolute inset-x-0 top-[3.4rem] z-20 h-[6px] rounded-full sm:top-[4.1rem]"
          >
            <span className="absolute -left-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-primary/40 bg-[linear-gradient(135deg,var(--card),var(--primary))]" />
            <span className="absolute -right-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-primary/40 bg-[linear-gradient(135deg,var(--card),var(--primary))]" />
          </div>

          <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-6 sm:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible">
            {items.map((item, index) => {
              const isActive = active === index;
              return (
                <motion.article
                  key={item.key}
                  initial={reducedMotion ? false : { opacity: 0, y: -36, rotate: index === 1 ? 0 : index === 0 ? -2.4 : 2.4 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.12 + index * 0.14,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onPointerEnter={() => setActive(index)}
                  onPointerLeave={() => setActive(null)}
                  className={cn(
                    "group relative w-[72vw] max-w-[19rem] shrink-0 snap-center sm:w-[15rem] lg:w-auto lg:max-w-none",
                    index === 1 && "lg:mt-8",
                    index === 2 && "lg:mt-16",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-[3.4rem] z-10 h-[3.2rem] w-px -translate-x-1/2 bg-[linear-gradient(180deg,var(--muted-foreground),transparent)] sm:top-[4.1rem]"
                  />
                  <Hanger className="pointer-events-none absolute left-1/2 top-[3.9rem] z-20 h-[74px] w-[168px] -translate-x-1/2 drop-shadow-md sm:top-[4.6rem]" />

                  <motion.div
                    animate={
                      reducedMotion || isActive
                        ? { rotate: 0 }
                        : { rotate: index === 0 ? -0.9 : index === 2 ? 0.9 : 0 }
                    }
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="pt-[6.6rem] sm:pt-[7.4rem]"
                  >
                    <Link
                      href={item.href}
                      aria-label={item.product ? `View ${item.name}` : "Browse the collection"}
                      className="relative block aspect-[3/4] overflow-hidden bg-muted shadow-soft outline-none transition-shadow duration-500 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background group-hover:shadow-lift"
                    >
                      <SmartImage
                        src={item.primary}
                        alt={item.name}
                        fill
                        priority={index < 2}
                        sizes="(max-width: 640px) 72vw, (max-width: 1024px) 15rem, 19rem"
                        className={cn(
                          "object-cover transition-all duration-700 ease-out",
                          item.secondary && "group-hover:opacity-0",
                        )}
                      />
                      {item.secondary ? (
                        <SmartImage
                          src={item.secondary}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 72vw, (max-width: 1024px) 15rem, 19rem"
                          className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100"
                        />
                      ) : null}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-black/20 mix-blend-multiply"
                      />
                    </Link>

                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          {item.category}
                        </p>
                        <h2 className="mt-1 truncate font-display text-lg font-semibold leading-tight">
                          {item.name}
                        </h2>
                      </div>
                      {item.price !== null ? (
                        <Price
                          amount={item.price}
                          size="sm"
                          className="shrink-0 pt-1 text-foreground"
                        />
                      ) : null}
                    </div>
                  </motion.div>
                </motion.article>
              );
            })}
          </div>

          <p className="mt-5 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground lg:text-right">
            Hover a piece for the alternate view
          </p>
        </div>
      </div>
    </section>
  );
}
