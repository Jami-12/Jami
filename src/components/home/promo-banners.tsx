import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import type { Banner } from "@/types";

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function BannerCard({
  banner,
  variant,
}: {
  banner: Banner;
  variant: "hero" | "promo";
}) {
  const href = banner.linkUrl?.trim() || null;

  const inner = (
    <>
      <SmartImage
        src={banner.imageUrl}
        alt={banner.title}
        fill
        sizes={variant === "hero" ? "100vw" : "(max-width: 640px) 100vw, 33vw"}
        className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.04]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent"
      />
      <div className="relative flex h-full flex-col justify-end p-5 text-white sm:p-6">
        <h3
          className={cn(
            "font-display font-semibold leading-tight",
            variant === "hero" ? "text-2xl sm:text-3xl" : "text-xl",
          )}
        >
          {banner.title}
        </h3>
        {banner.subtitle ? (
          <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-white/80 sm:text-sm">
            {banner.subtitle}
          </p>
        ) : null}
        {href ? (
          <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
            Discover
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </>
  );

  const className = cn(
    "group relative block overflow-hidden rounded-3xl border border-border bg-muted shadow-soft transition-shadow hover:shadow-lift",
    variant === "hero" ? "aspect-[16/9] sm:aspect-[21/9]" : "aspect-[16/10]",
  );

  if (!href) {
    return <div className={className}>{inner}</div>;
  }

  if (isExternal(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

/**
 * Renders the active HERO and PROMO banners managed in the admin back office.
 * Renders nothing when there are no banners so the storefront stays clean.
 */
export function PromoBanners({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;

  const hero = banners.filter((banner) => banner.placement === "HERO");
  const promo = banners.filter((banner) => banner.placement === "PROMO");

  return (
    <section
      aria-labelledby="promo-banners-heading"
      className="container-page py-6 sm:py-8"
    >
      <h2 id="promo-banners-heading" className="sr-only">
        Current offers and campaigns
      </h2>

      {hero.length > 0 ? (
        <div className="space-y-4">
          {hero.map((banner) => (
            <BannerCard key={banner.id} banner={banner} variant="hero" />
          ))}
        </div>
      ) : null}

      {promo.length > 0 ? (
        <div
          className={cn(
            "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
            hero.length > 0 && "mt-4",
          )}
        >
          {promo.map((banner) => (
            <BannerCard key={banner.id} banner={banner} variant="promo" />
          ))}
        </div>
      ) : null}
    </section>
  );
}
