"use client";

import Link from "next/link";

import { OrderDetailView } from "@/components/account/order-detail";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function PaymentReturnView({
  orderId,
  paymentStatus,
}: {
  orderId: string;
  paymentStatus: string | null;
}) {
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!hydrated) {
    return (
      <div className="container-page py-16 text-center text-sm text-muted-foreground">
        Verifying your session…
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <h1 className="text-xl font-extrabold">Sign in to view this order</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment may still be processing. Sign in with the account used at
            checkout to confirm the result.
          </p>
          <Button asChild className="mt-5">
            <Link
              href={`/login?next=${encodeURIComponent(
                `/dashboard/orders/${orderId}${paymentStatus ? `?paymentStatus=${paymentStatus}` : ""}`,
              )}`}
            >
              Sign in
            </Link>
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
      <OrderDetailView orderId={orderId} paymentStatusParam={paymentStatus} />
    </div>
  );
}
