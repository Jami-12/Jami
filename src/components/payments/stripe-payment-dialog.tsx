"use client";

import * as React from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { paymentsApi } from "@/lib/api/services";
import { getErrorMessage } from "@/lib/utils";
import type { PaymentStatus } from "@/types";

/**
 * Stripe.js takes a moment to download and initialise. Cache the loader per
 * publishable key so it starts as soon as the checkout knows the key (see
 * `preloadStripe`) instead of only when the payment dialog opens.
 */
const stripeLoaders = new Map<string, Promise<Stripe | null>>();

export function preloadStripe(publishableKey: string): Promise<Stripe | null> {
  let loader = stripeLoaders.get(publishableKey);
  if (!loader) {
    loader = loadStripe(publishableKey);
    stripeLoaders.set(publishableKey, loader);
  }
  return loader;
}

function CardForm({
  orderId,
  guestToken,
  onResolved,
}: {
  orderId: string;
  guestToken: string | null;
  onResolved: (status: PaymentStatus) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const submittingRef = React.useRef(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    if (submittingRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    // The guest token stays in browser storage; only a flag is sent through
    // Stripe so the callback page knows which credential to reload.
    const returnUrl = new URL(
      `/dashboard/orders/${encodeURIComponent(orderId)}`,
      window.location.origin,
    );
    if (guestToken) returnUrl.searchParams.set("guest", "1");

    let result;
    try {
      result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl.toString(),
        },
        redirect: "if_required",
      });
    } catch (confirmError) {
      setError(
        getErrorMessage(
          confirmError,
 "The card payment could not be submitted. Check your connection and try again.",
        ),
      );
      submittingRef.current = false;
      setSubmitting(false);
      return;
    }

    if (!result) {
      setError("Stripe did not return a payment result. Please try again.");
      submittingRef.current = false;
      setSubmitting(false);
      return;
    }

    if (result.error) {
      setError(result.error.message ?? "Your card could not be confirmed.");
      submittingRef.current = false;
      setSubmitting(false);
      return;
    }

    try {
      const payment = guestToken
        ? await paymentsApi.guestReconcileCard(orderId, guestToken)
        : await paymentsApi.reconcileCard(orderId);

      if (payment.status === "PAID") {
        toast.success("Payment confirmed. Your order is being prepared.");
      } else if (payment.status === "FAILED" || payment.status === "CANCELLED") {
        toast.error(
          payment.status === "CANCELLED"
            ? "The card payment was cancelled."
            : "The card payment failed.",
        );
      } else {
        toast.info("Payment is processing with the card provider.");
      }

      onResolved(payment.status);
    } catch (reconcileError) {
      toast.error(
        getErrorMessage(
          reconcileError,
 "Payment was submitted but we could not confirm it yet. Your order page will show the latest status.",
        ),
      );
      onResolved("PROCESSING");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const ready = Boolean(stripe && elements);

  return (
    <form onSubmit={submit} className="space-y-4 rounded-none border border-border bg-card p-4">
      {ready ? (
        <PaymentElement />
      ) : (
        <div
          className="flex min-h-24 items-center justify-center gap-2 text-xs text-muted-foreground"
          role="status"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading secure card form…
        </div>
      )}
      {error ? (
        <p className="flex items-start gap-2 rounded-none border border-foreground bg-secondary p-3 text-xs font-medium text-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full rounded-none border border-foreground hover:bg-foreground hover:text-background" loading={submitting} disabled={!ready}>
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Pay securely
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        Card details are handled by Stripe. We never see your full card number.
      </p>
    </form>
  );
}

export function StripePaymentDialog({
  open,
  onClose,
  orderId,
  clientSecret,
  publishableKey,
  guestToken = null,
  title = "Secure card payment",
  description = "Your order is created. Complete the card payment to confirm it.",
  onResolved,
}: {
  open: boolean;
  onClose: () => void;
  orderId: string;
  clientSecret: string;
  publishableKey: string;
  /** Set for guest checkout; never sent in the Stripe return URL. */
  guestToken?: string | null;
  title?: string;
  description?: string;
  onResolved: (status: PaymentStatus) => void;
}) {
  const { theme } = useTheme();
  const stripePromise = React.useMemo<Promise<Stripe | null>>(
    () => preloadStripe(publishableKey),
    [publishableKey],
  );

  // Stripe Elements needs a concrete color, so resolve the active theme token.
  const isDark = theme === "dark";
  const primaryColor = React.useMemo(() => {
    const fallback = isDark ? "#ffffff" : "#000000";
    if (typeof window === "undefined") return fallback;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim();
    return value || fallback;
  }, [isDark]);

  return (
    <Dialog open={open} onClose={onClose} title={title} description={description} size="md">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: theme === "dark" ? "night" : "stripe",
            variables: {
              borderRadius: "0px",
              colorPrimary: primaryColor,
            },
          },
        }}
      >
        <CardForm
          orderId={orderId}
          guestToken={guestToken}
          onResolved={onResolved}
        />
      </Elements>
    </Dialog>
  );
}
