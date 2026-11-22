"use client";

import { Banknote, CreditCard, Smartphone } from "lucide-react";

import { PAYMENT_METHOD_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PaymentMethod, PaymentProviderStatus } from "@/types";

type ProviderKey = keyof Pick<
  PaymentProviderStatus,
  "cashOnDelivery" | "bkash" | "nagad" | "card"
>;

export const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  icon: typeof Banknote;
  providerKey: ProviderKey;
}[] = [
  { value: "CASH_ON_DELIVERY", icon: Banknote, providerKey: "cashOnDelivery" },
  { value: "BKASH", icon: Smartphone, providerKey: "bkash" },
  { value: "NAGAD", icon: Smartphone, providerKey: "nagad" },
  { value: "CARD", icon: CreditCard, providerKey: "card" },
];

export function isPaymentMethodAvailable(
  method: PaymentMethod,
  providers: PaymentProviderStatus | null | undefined,
): boolean {
  const option = PAYMENT_OPTIONS.find((item) => item.value === method);

  if (!option) return false;
  if (!providers) return method === "CASH_ON_DELIVERY";

  if (method === "CARD") {
    return Boolean(providers.card && providers.cardPublishableKey);
  }

  return Boolean(providers[option.providerKey]);
}

/**
 * Shared provider-aware payment method radio grid. Used by storefront checkout
 * and the order-detail Retry Payment dialog so both surfaces hide/disable the
 * same methods when the dashboard or gateway configuration turns them off.
 */
export function PaymentMethodSelector({
  value,
  onChange,
  providers,
  disabled = false,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  providers?: PaymentProviderStatus | null;
  disabled?: boolean;
}) {
  return (
    <div
      className="grid gap-2.5 sm:grid-cols-2"
      role="radiogroup"
      aria-label="Payment method"
    >
      {PAYMENT_OPTIONS.map((option) => {
        const meta = PAYMENT_METHOD_META[option.value];
        const Icon = option.icon;
        const enabled = isPaymentMethodAvailable(option.value, providers);
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled || !enabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-start gap-3 rounded-none border p-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55",
              active
                ? "border-foreground bg-secondary text-foreground"
                : "border-border bg-card text-foreground hover:border-foreground",
            )}
          >
            <span
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none border",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-secondary text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">{meta.label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[11px] leading-relaxed",
                  active ? "text-background/70" : "text-muted-foreground",
                )}
              >
                {enabled
                  ? meta.description
                  : "Currently unavailable. Choose another method."}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
