import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({
  className,
  wordmarkClassName,
  href = "/",
  showWordmark = true,
}: {
  className?: string;
  wordmarkClassName?: string;
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
      <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-accent-300/60 bg-[linear-gradient(150deg,#172B3A,#2C4561)] shadow-soft dark:border-accent-400/40 dark:bg-[linear-gradient(150deg,#2C4561,#172B3A)]">
        <svg
          viewBox="0 0 32 32"
          className="relative h-5 w-5"
          aria-hidden="true"
          fill="none"
        >
          <path
            d="M8 25 16 6l8 19h-5l-1.2-3.4h-3.6L13 25H8Z"
            fill="#F8FAF0"
            className="dark:fill-[#F8FAFC]"
          />
          <circle cx="25" cy="7" r="2.2" fill="#5A83AB" className="dark:fill-[#97B3CE]" />
        </svg>
      </span>
      {showWordmark ? (
        <span className={cn("flex flex-col leading-none", wordmarkClassName)}>
          <span className="font-display text-[1.15rem] font-semibold tracking-[0.26em] text-foreground">
            AETHER
          </span>
          <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Atelier
          </span>
        </span>
      ) : null}
    </Link>
  );
}
