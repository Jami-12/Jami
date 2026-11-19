import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "shimmer relative overflow-hidden rounded-xl bg-[var(--muted)]",
        className,
      )}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
