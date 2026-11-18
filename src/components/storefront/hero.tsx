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
  { value: "48h", label: "Dispatched" },
  { value: "30d", label: "Easy returns" },
  { value: "4.9/5", label: "Client rating" },
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
  const lead = items[0]!;
  const rest = items.slice(1);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-[#111F2B] text-[#F8F6F0] dark:bg-[#08131B]"
    >
      {/* Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_78%_8%,rgba(198,164,106,0.22),transparent_60%),radial-gradient(60%_60%_at_8%_92%,rgba(36,75,80,0.65),transparent_62%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#C6A46A_1px,transparent_1px),linear-gradient(to_bottom,#C6A46A_1px,transparent_1px)] [background-size:96px_96px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0B1720] to-transparent"
      />

      <div className="container-page relative grid gap-12 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:min-h-[calc(100dvh-7.5rem)] lg:grid-cols-[1.02fr_1.08fr] lg:items-center lg:gap-10 lg:pb-24 lg:pt-20">
        {/* Copy */}
        <div className="relative z-10 max-w-xl">
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-accent-200 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            The 2026 considered collection
          </motion.p>

          <motion.h1
            id="hero-heading"
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-[3.1rem] font-semibold leading-[0.94] tracking-[-0.035em] sm:text-[4.2rem] lg:text-[5rem]"
          >
            Things worth
            <span className="block italic text-accent-300">living with.</span>
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-md text-sm leading-relaxed text-[#B9C4C2] sm:text-base"
          >
            A tightly edited house of quiet tailoring, softened knits and objects
            that hold their shape. Photographed exactly as they arrive — chosen
            for how they feel, not for the season.
          </motion.p>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="h-12 bg-accent-300 px-6 text-[#172B3A] hover:bg-accent-200"
            >
              <Link href="/products">
                Shop the collection
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-white/25 bg-transparent px-6 text-[#F8F6F0] hover:bg-white/10 hover:text-white"
            >
              <Link href="/#product-wall">
                <Gem className="h-4 w-4" aria-hidden="true" />
                Enter the 3D wall
              </Link>
            </Button>
          </motion.div>

          <motion.dl
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.38 }}
            className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/12 pt-5"
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-2xl font-semibold leading-none text-white">
                  {stat.value}
                </dt>
                <dd className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-[#8FA09E]">
                  {stat.label}
                </dd>
              </div>
            ))}
          </motion.dl>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.46 }}
            className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-[#8FA09E]"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              Secure checkout
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-accent-300" aria-hidden="true" />
              bKash · Nagad · Card · COD
            </span>
          </motion.p>
        </div>

        {/* Cinematic product collage */}
        <div className="relative min-w-0">
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/8 to-transparent backdrop-blur-[2px] sm:-inset-6"
          />

          <div className="relative grid grid-cols-[1.35fr_0.9fr] gap-3 sm:gap-4">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 40, rotate: -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <Link
                href={lead.href}
                aria-label={`View ${lead.name}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#16242E] shadow-[0_60px_100px_-50px_rgba(0,0,0,0.9)] outline-none focus-visible:ring-2 focus-visible:ring-accent-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111F2B]"
              >
                <SmartImage
                  src={lead.primary}
                  alt={lead.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 60vw, 34vw"
                  className={cn(
                    "object-cover transition-all duration-[900ms] ease-out",
                    lead.secondary && "group-hover:scale-[1.03] group-hover:opacity-0",
                  )}
                />
                {lead.secondary ? (
                  <SmartImage
                    src={lead.secondary}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 60vw, 34vw"
                    className="object-cover opacity-0 transition-all duration-[900ms] ease-out group-hover:scale-[1.03] group-hover:opacity-100"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(8,19,27,0.72)_100%)]"
                />
                <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-accent-200">
                      {lead.category}
                    </span>
                    <span className="mt-1 block truncate font-display text-lg font-semibold text-white">
                      {lead.name}
                    </span>
                  </span>
                  {lead.price !== null ? (
                    <Price amount={lead.price} size="sm" className="shrink-0 text-white" />
                  ) : null}
                </span>
              </Link>
            </motion.div>

            <div className="flex flex-col gap-3 sm:gap-4">
              {rest.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={reducedMotion ? false : { opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.3 + index * 0.14,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn("relative", index === 0 ? "flex-[1.15]" : "flex-1")}
                >
                  <Link
                    href={item.href}
                    aria-label={`View ${item.name}`}
                    className="group relative block h-full min-h-32 overflow-hidden rounded-[1.4rem] border border-white/15 bg-[#16242E] shadow-[0_40px_70px_-45px_rgba(0,0,0,0.9)] outline-none focus-visible:ring-2 focus-visible:ring-accent-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111F2B]"
                  >
                    <SmartImage
                      src={item.primary}
                      alt={item.name}
                      fill
                      sizes="(max-width: 1024px) 30vw, 16vw"
                      className={cn(
                        "object-cover transition-all duration-700 ease-out",
                        item.secondary && "group-hover:scale-105 group-hover:opacity-0",
                      )}
                    />
                    {item.secondary ? (
                      <SmartImage
                        src={item.secondary}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 30vw, 16vw"
                        className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
                      />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(8,19,27,0.7)_100%)]"
                    />
                    <span className="absolute inset-x-3 bottom-2.5 flex items-center justify-between gap-1">
                      <span className="truncate text-[11px] font-semibold text-white">
                        {item.name}
                      </span>
                      <ArrowUpRight
                        className="h-3 w-3 shrink-0 text-accent-200 opacity-0 transition group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={reducedMotion ? false : { opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.58, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-between rounded-[1.4rem] border border-accent-300/25 bg-accent-300/10 px-4 py-3 backdrop-blur"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-200">
                  Hover for the alternate view
                </span>
                <Sparkles className="h-3.5 w-3.5 text-accent-300" aria-hidden="true" />
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute -left-3 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[9px] font-bold uppercase tracking-[0.4em] text-white/35 xl:block"
          >
            Aether · Est. 2019
          </motion.div>
        </div>
      </div>
    </section>
  );
}
