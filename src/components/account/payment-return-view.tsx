"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { OrderDetailView } from "@/components/account/order-detail";
import { Button } from "@/components/ui/button";
import { paymentsApi } from "@/lib/api/services";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { PaymentStatus } from "@/types";

type ReconcileState = "idle" | "checking" | "checked" | "error";

export function PaymentReturnView({
  orderId,
  paymentStatus,
  paymentIntent = null,
  redirectStatus = null,
}: {
  orderId: string;
  paymentStatus: string | null;
  paymentIntent?: string | null;
  redirectStatus?: string | null;
}) {
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const reconciledFor = React.useRef<string | null>(null);
  const [reconcileState, setReconcileState] = React.useState<ReconcileState>("idle");
  const [reconcileError, setReconcileError] = React.useState<string | null>(null);
  const [verifiedStatus, setVerifiedStatus] = React.useState<PaymentStatus | null>(null);

  React.useEffect(() => {
    if (!hydrated || !accessToken || !paymentIntent) return;

    // Stripe can render the same return URL more than once (refresh, React
    // development remounts). Reconcile at most once per intent.
    const key = `${orderId}:${paymentIntent}`;
    if (reconciledFor.current === key) return;
    reconciledFor.current = key;

    setReconcileState("checking");
    setReconcileError(null);

    void (async () => {
      try {
        const payment = await paymentsApi.reconcileCard(orderId);
        setVerifiedStatus(payment.status);
        setReconcileState("checked");
        void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        void queryClient.invalidateQueries({ queryKey: ["orders"] });
      } catch (error) {
        setReconcileState("error");
        setReconcileError(
          getErrorMessage(
            error,
            "We could not verify the card payment automatically.",
          ),
        );
      }
    })();
  }, [accessToken, hydrated, orderId, paymentIntent, queryClient]);

  if (!hydrated) {
    return (
      <div className="container-page py-16 text-center text-sm text-muted-foreground">
        Verifying your session…
      </div>
    );
  }

  if (!accessToken) {
    const nextParams = new URLSearchParams();
    if (paymentStatus) nextParams.set("paymentStatus", paymentStatus);
    if (paymentIntent) nextParams.set("payment_intent", paymentIntent);
    if (redirectStatus) nextParams.set("redirect_status", redirectStatus);
    const nextQuery = nextParams.toString();
    const nextPath = `/dashboard/orders/${orderId}${nextQuery ? `?${nextQuery}` : ""}`;

    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <h1 className="text-xl font-extrabold">Sign in to view this order</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment may still be processing. Sign in with the account used at
            checkout to confirm the result.
          </p>
          <Button asChild className="mt-5">
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-500 dark:text-accent-300">
            Payment return
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Confirming your order</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/account/orders/${orderId}`}>Open in your account</Link>
        </Button>
      </div>

      {paymentIntent ? (
        <div
          className="mb-5 flex items-start gap-3 rounded-2xl border border-border bg-muted/50 p-4 text-xs"
          role="status"
        >
          {reconcileState === "checking" ? (
            <>
              <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
              <p className="leading-relaxed">
                {redirectStatus
                  ? `Stripe returned the card step with status "${redirectStatus}". `
                  : ""}
                Verifying the payment result with our payment server…
              </p>
            </>
          ) : reconcileState === "error" ? (
            <>
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              />
              <p className="leading-relaxed">
                {reconcileError} The order below shows the last confirmed status.
                Refresh in a moment if the payment was just completed.
              </p>
            </>
          ) : reconcileState === "checked" ? (
            <>
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              <p className="leading-relaxed">
                {verifiedStatus === "PAID"
                  ? "Payment verified. The order below is confirmed as paid."
                  : verifiedStatus === "FAILED" || verifiedStatus === "CANCELLED"
                    ? "The verified payment did not complete. You can retry from the order below."
                    : verifiedStatus === "REFUNDED"
                      ? "The verified payment was refunded."
                      : "The payment is still processing. This page checks the server automatically."}
              </p>
            </>
          ) : null}
        </div>
      ) : null}

      <OrderDetailView orderId={orderId} paymentStatusParam={paymentStatus} />
    </div>
  );
}
