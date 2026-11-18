"use client";

import * as React from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { paymentsApi } from "@/lib/api/services";
import { getErrorMessage } from "@/lib/utils";
import type { PaymentStatus } from "@/types";

function CardForm({
  orderId,
  onResolved,
}: {
  orderId: string;
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

    let result;
    try {
      result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/orders/${orderId}`,
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
      const payment = await paymentsApi.reconcileCard(orderId);

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

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement />
      {error ? (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" loading={submitting} disabled={!stripe}>
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Pay securely
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        Card details are handled by Stripe. Aether never sees your full card number.
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
  title = "Secure card payment",
  description = "Your order is created. Complete the card payment to confirm it.",
  onResolved,
}: {
  open: boolean;
  onClose: () => void;
  orderId: string;
  clientSecret: string;
  publishableKey: string;
  title?: string;
  description?: string;
  onResolved: (status: PaymentStatus) => void;
}) {
  const { theme } = useTheme();
  const stripePromise = React.useMemo<Promise<Stripe | null>>(
    () => loadStripe(publishableKey),
    [publishableKey],
  );

  return (
    <Dialog open={open} onClose={onClose} title={title} description={description} size="md">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: theme === "dark" ? "night" : "stripe",
            variables: {
              borderRadius: "12px",
              colorPrimary: theme === "dark" ? "#dfc48e" : "#172B3A",
            },
          },
        }}
      >
        <CardForm orderId={orderId} onResolved={onResolved} />
      </Elements>
    </Dialog>
  );
}
