"use client";

import { ArrowLeftRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

export function CurrencyToggle({ className }: { className?: string }) {
  const currency = useUiStore((state) => state.currency);
  const toggleCurrency = useUiStore((state) => state.toggleCurrency);

  return (
    <button
      type="button"
      onClick={toggleCurrency}
      aria-label={`Switch currency. Currently showing ${currency}`}
      title={`Show prices in ${currency === "BDT" ? "USD" : "BDT"}`}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border border-transparent px-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
      {currency}
    </button>
  );
}
