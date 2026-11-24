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
 "shimmer relative overflow-hidden rounded-none bg-[var(--muted)]",
        className,
      )}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-none border border-[var(--border)] bg-[var(--card)] shadow-soft">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="mt-1 h-3 w-1/2" />
        <div className="mt-auto pt-2">
          <Skeleton className="h-3.5 w-1/2" />
          <div className="mt-2 flex items-center gap-1.5">
            <Skeleton className="h-8 flex-1 sm:h-9" />
            <Skeleton className="h-8 w-8 sm:h-9 sm:w-9" />
          </div>
        </div>
      </div>
    </div>
  );
}
