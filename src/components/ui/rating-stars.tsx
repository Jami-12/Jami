import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  size = 14,
  showValue = false,
  count,
  className,
}: {
  rating: number;
  size?: number;
  showValue?: boolean;
  count?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, rating));
  const percent = (clamped / 5) * 100;

  return (
    <span
      role="img"
      className={cn("inline-flex items-center gap-1.5", className)}
      aria-label={`Rated ${clamped.toFixed(1)} out of 5`}
    >
      <span className="relative inline-flex" aria-hidden="true">
        <span className="inline-flex gap-0.5 text-[var(--muted-foreground)]/30">
          {[0, 1, 2, 3, 4].map((index) => (
            <Star key={index} style={{ width: size, height: size }} />
          ))}
        </span>
        <span
          className="absolute inset-y-0 left-0 inline-flex gap-0.5 overflow-hidden text-[var(--color-accent-400)] dark:text-[var(--color-accent-300)]"
          style={{ width: `${percent}%` }}
        >
          {[0, 1, 2, 3, 4].map((index) => (
            <Star
              key={index}
              fill="currentColor"
              style={{ width: size, height: size, flexShrink: 0 }}
            />
          ))}
        </span>
      </span>
      {showValue ? (
        <span className="text-xs font-semibold tabular-nums text-[var(--foreground)]">
          {clamped.toFixed(1)}
        </span>
      ) : null}
      {count !== undefined ? (
        <span className="text-xs tabular-nums text-[var(--muted-foreground)]">({count})</span>
      ) : null}
    </span>
  );
}
