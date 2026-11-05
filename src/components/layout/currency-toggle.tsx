"use client";

import { ArrowLeftRight } from "lucide-react";

import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

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
        "inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
      {currency}
    </button>
  );
}
