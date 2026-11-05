"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Download,
  MapPin,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { StripePaymentDialog } from "@/components/payments/stripe-payment-dialog";
import { ordersApi, paymentsApi } from "@/lib/api/services";
import { PAYMENT_METHOD_META } from "@/lib/constants";
import { cn, formatDate, getErrorMessage, humanizeEnum } from "@/lib/utils";
import type { Order, PaymentStatus } from "@/types";

const KNOWN_PAYMENT_STATUSES = new Set<PaymentStatus>([
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
]);

function normalizePaymentStatus(value: string | null | undefined): PaymentStatus | null {
  if (!value) return null;
  const upper = value.toUpperCase() as PaymentStatus;
  return KNOWN_PAYMENT_STATUSES.has(upper) ? upper : null;
}

function PaymentBanner({ status }: { status: PaymentStatus }) {
  const content: Record<PaymentStatus, { tone: string; icon: typeof CheckCircle2; title: string; copy: string }> = {
    PAID: {
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200",
      icon: CheckCircle2,
      title: "Payment received",
      copy: "Thank you — your payment is confirmed and the order is being prepared.",
    },
    PENDING: {
      tone: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200",
      icon: AlertCircle,
      title: "Payment pending",
      copy: "This order is waiting for payment. You can retry from this page if you used an online method.",
    },
    PROCESSING: {
      tone: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-200",
      icon: RotateCcw,
      title: "Payment processing",
      copy: "The provider is still confirming this payment. We will update the order automatically.",
    },
    FAILED: {
      tone: "border-red-200 bg-red-50 text-red-800 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200",
      icon: XCircle,
      title: "Payment failed",
      copy: "The provider did not complete this payment. Retry below or choose a different order.",
    },
    CANCELLED: {
      tone: "border-border bg-muted text-foreground",
      icon: XCircle,
      title: "Payment cancelled",
      copy: "This payment was cancelled. The order will not be fulfilled until a payment succeeds.",
    },
    REFUNDED: {
      tone: "border-border bg-muted text-foreground",
      icon: RotateCcw,
      title: "Payment refunded",
      copy: "This order has been refunded. Allow a few business days for the amount to appear.",
    },
  };

  const meta = content[status];
  const Icon = meta.icon;

  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border p-4", meta.tone)} role="status">
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm font-bold">{meta.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-90">{meta.copy}</p>
      </div>
    </div>
  );
}

function ReceiptDialog({
  orderId,
  open,
  onClose,
}: {
  orderId: string;
  open: boolean;
  onClose: () => void;
}) {
  const receipt = useQuery({
    queryKey: ["order-receipt", orderId],
    queryFn: () => ordersApi.receipt(orderId),
    enabled: open,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Order receipt"
      description="A server-generated record of this order."
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Print
          </Button>
        </>
      }
    >
      {receipt.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : receipt.isError ? (
        <p className="text-sm text-muted-foreground">Could not load the receipt.</p>
      ) : receipt.data ? (
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="text-base font-extrabold">{receipt.data.store.name}</p>
              <p className="text-xs text-muted-foreground">{receipt.data.store.address}</p>
              <p className="text-xs text-muted-foreground">
                {receipt.data.store.phone} · {receipt.data.store.email}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="font-bold text-foreground">{receipt.data.receiptNumber}</p>
              <p>Order {receipt.data.orderNumber}</p>
              <p>{formatDate(receipt.data.issuedAt, "long")}</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Customer</p>
            <p className="mt-1 font-semibold">{receipt.data.customer.name}</p>
            <p className="text-xs text-muted-foreground">{receipt.data.customer.email}</p>
            {receipt.data.customer.phone ? (
              <p className="text-xs text-muted-foreground">{receipt.data.customer.phone}</p>
            ) : null}
          </div>

          <ul className="divide-y divide-border rounded-xl border border-border">
            {receipt.data.items.map((item) => (
              <li key={`${item.productName}-${item.quantity}`} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{item.productName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.quantity} × {new Intl.NumberFormat("en-US").format(item.unitPrice)}
                  </p>
                </div>
                <p className="shrink-0 text-xs font-bold tabular-nums">
                  {new Intl.NumberFormat("en-US").format(item.totalPrice)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{new Intl.NumberFormat("en-US").format(receipt.data.totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="tabular-nums">−{new Intl.NumberFormat("en-US").format(receipt.data.totals.discountAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">{new Intl.NumberFormat("en-US").format(receipt.data.totals.shippingCost)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 text-sm font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">
                {new Intl.NumberFormat("en-US").format(receipt.data.totals.totalAmount)}{" "}
                {receipt.data.totals.currency}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </Dialog>
  );
}

export function OrderDetailView({
  orderId,
  paymentStatusParam,
}: {
  orderId: string;
  paymentStatusParam?: string | null;
}) {
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [cardSession, setCardSession] = React.useState<{ clientSecret: string; publishableKey: string } | null>(null);
  const [paying, setPaying] = React.useState(false);

  const orderQuery = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.get(orderId),
    enabled: Boolean(orderId),
  });

  const providersQuery = useQuery({
    queryKey: ["payment-providers"],
    queryFn: paymentsApi.providers,
    staleTime: 60_000,
  });

  const order = orderQuery.data;
  const callbackStatus = normalizePaymentStatus(paymentStatusParam);

  React.useEffect(() => {
    if (callbackStatus) {
      void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  }, [callbackStatus, orderId, queryClient]);

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(orderId),
    onSuccess: () => {
      toast.success("Order cancelled");
      void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      setCancelOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not cancel this order")),
  });

  const retryPayment = async (current: Order) => {
    if (current.paymentStatus === "PAID") return;
    setPaying(true);
    try {
      const initiation = await paymentsApi.initiate({ orderId: current.id });

      if (current.paymentMethod === "CARD") {
        if (initiation.clientSecret && providersQuery.data?.cardPublishableKey) {
          setCardSession({
            clientSecret: initiation.clientSecret,
            publishableKey: providersQuery.data.cardPublishableKey,
          });
        } else {
          toast.info(initiation.message || "Card payment is already processing.");
          void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        }
        return;
      }

      if (initiation.redirectUrl) {
        window.location.assign(initiation.redirectUrl);
        return;
      }

      toast.info(initiation.message || "No payment link was returned by the provider.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not start the payment"));
    } finally {
      setPaying(false);
    }
  };

  if (orderQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Order not found"
        description="This order may belong to another account, or the link is no longer valid."
        action={
          <Button asChild>
            <Link href="/account/orders">Back to your orders</Link>
          </Button>
        }
      />
    );
  }

  const canCancel = order.status === "PENDING" || order.status === "CONFIRMED";
  const canRetryPayment =
    order.paymentStatus !== "PAID" &&
    order.paymentStatus !== "REFUNDED" &&
    order.paymentMethod !== "CASH_ON_DELIVERY" &&
    order.status !== "CANCELLED" &&
    order.status !== "RETURNED";

  const visibleStatus = callbackStatus ?? order.paymentStatus;

  return (
    <div className="space-y-5">
      {callbackStatus ? <PaymentBanner status={callbackStatus} /> : null}

      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Orders
              </Link>
              <span className="text-muted-foreground" aria-hidden="true">·</span>
              <span className="text-xs text-muted-foreground">{formatDate(order.createdAt, "long")}</span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{order.orderNumber}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
              <Badge tone="neutral">
                {PAYMENT_METHOD_META[order.paymentMethod].label}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setReceiptOpen(true)}>
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Receipt
            </Button>
            {canRetryPayment ? (
              <Button size="sm" loading={paying} onClick={() => void retryPayment(order)}>
                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                Retry payment
              </Button>
            ) : null}
            {canCancel ? (
              <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)}>
                Cancel order
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-sm font-bold">Items in this order</h3>
              <p className="text-xs text-muted-foreground">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} unit(s) ·{" "}
                {order.items.length} line{order.items.length === 1 ? "" : "s"}
              </p>
            </div>
            <ul className="divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3 p-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <SmartImage
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold">{item.productName}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {item.sku ? `SKU ${item.sku} · ` : ""}Qty {item.quantity}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Price amount={item.totalPrice} size="sm" />
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {item.quantity} × {new Intl.NumberFormat("en-US").format(item.finalUnitPrice)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-border px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd><Price amount={order.subtotal} size="sm" /></dd>
              </div>
              {order.discountAmount > 0 ? (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <dt>Discount{order.coupon ? ` · ${order.coupon.code}` : ""}</dt>
                  <dd className="font-semibold tabular-nums">−{new Intl.NumberFormat("en-US").format(order.discountAmount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-semibold">{order.shippingCost === 0 ? "Free" : new Intl.NumberFormat("en-US").format(order.shippingCost)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-extrabold">
                <dt>Total</dt>
                <dd><Price amount={order.totalAmount} size="md" /></dd>
              </div>
            </dl>
          </Card>

          {order.notes ? (
            <Card className="p-5">
              <h3 className="text-sm font-bold">Delivery notes</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{order.notes}</p>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <MapPin className="h-4 w-4 text-primary-500 dark:text-accent-300" aria-hidden="true" />
              Delivery address
            </h3>
            {order.address ? (
              <address className="mt-2 text-sm not-italic leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground">{order.address.fullName}</p>
                <p>{order.address.addressLine}</p>
                <p>
                  {order.address.area ? `${order.address.area}, ` : ""}
                  {order.address.district}
                  {order.address.division ? `, ${order.address.division}` : ""}
                </p>
                {order.address.postalCode ? <p>{order.address.postalCode}</p> : null}
                <p className="mt-1 font-semibold text-foreground">{order.address.phone}</p>
              </address>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No address on file.</p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <CreditCard className="h-4 w-4 text-primary-500 dark:text-accent-300" aria-hidden="true" />
              Payment
            </h3>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">Method</span>
              <span className="text-sm font-semibold">{PAYMENT_METHOD_META[order.paymentMethod].label}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <PaymentStatusBadge status={visibleStatus} />
            </div>
            {order.payment?.transactionId ? (
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Transaction</span>
                <span className="max-w-40 truncate text-xs font-mono">{order.payment.transactionId}</span>
              </div>
            ) : null}
            {order.payment?.paidAt ? (
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Paid</span>
                <span className="text-xs font-semibold">{formatDate(order.payment.paidAt, "long")}</span>
              </div>
            ) : null}
            {order.receiptNumber ? (
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Receipt</span>
                <span className="text-xs font-semibold">{order.receiptNumber}</span>
              </div>
            ) : null}
          </Card>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Truck className="h-4 w-4 text-primary-500 dark:text-accent-300" aria-hidden="true" />
              Fulfilment
            </h3>
            <ol className="mt-3 space-y-3">
              {(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const).map((step) => {
                const order_index = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].indexOf(order.status);
                const step_index = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].indexOf(step);
                const complete = order_index >= step_index && !["CANCELLED", "RETURNED"].includes(order.status);
                return (
                  <li key={step} className="flex items-center gap-2.5 text-xs">
                    <span
                      className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded-full border",
                        complete
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-border text-muted-foreground",
                      )}
                      aria-hidden="true"
                    >
                      {complete ? <CheckCircle2 className="h-3 w-3" /> : null}
                    </span>
                    <span className={complete ? "font-semibold" : "text-muted-foreground"}>
                      {humanizeEnum(step)}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Tracked delivery. Returned or cancelled orders stop here.
            </p>
          </Card>
        </div>
      </div>

      <ReceiptDialog orderId={orderId} open={receiptOpen} onClose={() => setReceiptOpen(false)} />

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => cancelMutation.mutate()}
        title="Cancel this order?"
        description="Stock will be returned and the order cannot be reactivated. Paid amounts are refunded by the support team."
        confirmLabel="Cancel order"
        loading={cancelMutation.isPending}
        destructive
      />

      {cardSession ? (
        <StripePaymentDialog
          open
          onClose={() => setCardSession(null)}
          orderId={order.id}
          clientSecret={cardSession.clientSecret}
          publishableKey={cardSession.publishableKey}
          onResolved={() => {
            setCardSession(null);
            void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
            void queryClient.invalidateQueries({ queryKey: ["orders"] });
          }}
        />
      ) : null}
    </div>
  );
}
