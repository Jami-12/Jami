"use client";

import { useHydrated } from "@/hooks/use-hydrated";
import { displayAmount, useUiStore } from "@/stores/ui-store";
import { cn, formatCurrency } from "@/lib/utils";

const SIZES = {
  xs: "text-xs font-semibold",
  sm: "text-sm font-semibold",
  md: "text-base font-semibold",
  lg: "text-xl font-bold",
  xl: "text-3xl font-bold",
} as const;

export function Price({
  amount,
  size = "md",
  className,
  compareAt,
  inline = false,
}: {
  amount: number;
  size?: keyof typeof SIZES;
  className?: string;
  compareAt?: number | null;
  inline?: boolean;
}) {
  const currency = useUiStore((state) => state.currency);
  const hydrated = useHydrated();
  const display = hydrated ? currency : "BDT";
  const value = displayAmount(amount, display);

  const price = (
    <span
      className={cn(
 "tabular-nums tracking-tight text-[var(--foreground)]",
        SIZES[size],
        className,
      )}
    >
      {formatCurrency(value, { currency: display })}
    </span>
  );

  if (!compareAt || compareAt <= amount) return price;

  return (
    <span className={cn("inline-flex items-baseline gap-2", inline && "gap-1.5")}>
      {price}
      <span className="text-xs font-medium tabular-nums text-[var(--muted-foreground)] line-through">
        {formatCurrency(displayAmount(compareAt, display), { currency: display })}
      </span>
    </span>
  );
}
