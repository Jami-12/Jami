import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({
  className,
  href = "/",
  showWordmark = true,
}: {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label="Aether home"
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary-700 shadow-soft">
        <span className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-500" />
        <svg
          viewBox="0 0 32 32"
          className="relative h-6 w-6"
          aria-hidden="true"
          fill="none"
        >
          <path
            d="M8 25 16 6l8 19h-5l-1.2-3.4h-3.6L13 25H8Z"
            fill="#F8FBFF"
          />
          <circle cx="25" cy="7" r="2.4" fill="#F8FBFF" opacity="0.85" />
        </svg>
      </span>
      {showWordmark ? (
        <span className="text-lg font-extrabold tracking-[0.14em] text-foreground">
          AETHER
        </span>
      ) : null}
    </Link>
  );
}
