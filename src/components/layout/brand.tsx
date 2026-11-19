"use client";

import Link from "next/link";

import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

type BrandTone = "default" | "inverse";

/**
 * Single source of truth for the storefront identity.
 *
 * The logo always comes from the live `SiteSettings` cache, so a Super Admin
 * upload propagates to the navbar, footer, auth screens and dashboards without
 * a reload. When no image is configured we fall back to the configured site
 * name, then the public build-time store name, then a sane default.
 */
export function Brand({
  className,
  wordmarkClassName,
  href = "/",
  showWordmark = true,
  tone = "default",
  onClick,
}: {
  className?: string;
  wordmarkClassName?: string;
  href?: string;
  showWordmark?: boolean;
  /** Use on dark photographic panels where the normal foreground is unreadable. */
  tone?: BrandTone;
  onClick?: () => void;
}) {
  const { settings } = useSiteSettings();

  const name =
    settings.siteName?.trim() ||
    process.env.NEXT_PUBLIC_STORE_NAME?.trim() ||
    "Store";
  const logoUrl = settings.navbarLogoUrl?.trim() || null;
  const inverse = tone === "inverse";

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "S";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group inline-flex min-w-0 items-center gap-2.5 rounded-xl outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:opacity-90",
        className,
      )}
      aria-label={`${name} home`}
    >
      <span
        className={cn(
          "relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border shadow-soft transition-transform duration-300 group-hover:-rotate-3",
          inverse
            ? "border-white/25 bg-white/10"
            : "border-accent-300/50 bg-gradient-to-br from-primary-800 via-primary-700 to-accent-600 dark:border-accent-400/40 dark:from-accent-600 dark:via-primary-700 dark:to-primary-900",
          logoUrl && (inverse ? "bg-white/15" : "bg-card"),
        )}
      >
        {logoUrl ? (
          <SmartImage
            src={logoUrl}
            alt={`${name} logo`}
            fill
            priority
            sizes="40px"
            className="object-contain p-1.5"
          />
        ) : (
          <span
            className={cn(
              "font-display text-sm font-semibold tracking-tight",
              inverse ? "text-white" : "text-white dark:text-accent-100",
            )}
            aria-hidden="true"
          >
            {initials}
          </span>
        )}
      </span>

      {showWordmark ? (
        <span className={cn("flex min-w-0 flex-col leading-none", wordmarkClassName)}>
          <span
            className={cn(
              "truncate font-display text-[1.05rem] font-semibold uppercase leading-tight tracking-[0.16em] sm:tracking-[0.22em]",
              inverse ? "text-white" : "text-foreground",
            )}
          >
            {name}
          </span>
          <span
            className={cn(
              "mt-1 text-[9px] font-semibold uppercase tracking-[0.28em]",
              inverse ? "text-white/65" : "text-muted-foreground",
            )}
          >
            considered living
          </span>
        </span>
      ) : null}
    </Link>
  );
}
