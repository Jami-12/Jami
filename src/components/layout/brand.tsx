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
        "group inline-flex min-w-0 items-center gap-3 rounded-none not-italic outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label={`${name} home`}
    >
      <span
        className={cn(
          "relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-none border",
          inverse
            ? "border-white bg-white text-black"
            : "border-foreground bg-foreground text-background",
          logoUrl &&
            (inverse
              ? "border-white bg-white text-black"
              : "border-border bg-card text-foreground"),
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
            className="font-display text-sm font-bold uppercase tracking-[0.12em] not-italic"
            aria-hidden="true"
          >
            {initials}
          </span>
        )}
      </span>

      {showWordmark ? (
        <span
          className={cn(
            "min-w-0 truncate font-display text-[1.05rem] font-bold uppercase leading-none tracking-[0.18em] not-italic sm:tracking-[0.24em]",
            inverse ? "text-white" : "text-foreground",
            wordmarkClassName,
          )}
        >
          {name}
        </span>
      ) : null}
    </Link>
  );
}
