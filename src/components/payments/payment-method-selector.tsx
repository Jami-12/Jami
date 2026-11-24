"use client";

import * as React from "react";
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

  if (!option || !providers) return false;
  if (method === "CARD") {
    return Boolean(providers.card && providers.cardPublishableKey);
  }

  return Boolean(providers[option.providerKey]);
}

/** Only methods the backend says are live — no optimistic COD fallback. */
export function getAvailablePaymentMethods(
  providers: PaymentProviderStatus | null | undefined,
): PaymentMethod[] {
  if (!providers) return [];
  return PAYMENT_OPTIONS.filter((option) =>
    isPaymentMethodAvailable(option.value, providers),
  ).map((option) => option.value);
}

/** Keep the user's choice when valid, otherwise choose the first live method. */
export function resolvePaymentMethod(
  requested: PaymentMethod,
  providers: PaymentProviderStatus | null | undefined,
): PaymentMethod | null {
  if (providers && isPaymentMethodAvailable(requested, providers)) return requested;
  return getAvailablePaymentMethods(providers)[0] ?? null;
}

/**
 * Shared provider-aware payment method radio grid. Off methods are never
 * rendered, so they cannot be seen or selected in checkout or retry payment.
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
  const enabledOptions = React.useMemo(
    () =>
      PAYMENT_OPTIONS.filter((option) =>
        isPaymentMethodAvailable(option.value, providers),
      ),
    [providers],
  );

  const selectedIsAvailable = enabledOptions.some((option) => option.value === value);
  const effectiveValue = selectedIsAvailable ? value : enabledOptions[0]?.value;

  React.useEffect(() => {
    if (effectiveValue && !selectedIsAvailable) onChange(effectiveValue);
  }, [effectiveValue, selectedIsAvailable, onChange]);

  if (enabledOptions.length === 0) {
    return (
      <div
        role="radiogroup"
        aria-label="Payment method"
        className="border border-border bg-muted p-3.5 text-[11px] text-muted-foreground"
      >
        {providers
          ? "No payment methods are currently enabled for checkout."
          : "Checking available payment methods…"}
      </div>
    );
  }

  return (
    <div
      className="grid gap-2.5 sm:grid-cols-2"
      role="radiogroup"
      aria-label="Payment method"
    >
      {enabledOptions.map((option) => {
        const meta = PAYMENT_METHOD_META[option.value];
        const Icon = option.icon;
        const active = effectiveValue === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
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
                {meta.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
