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
  Printer,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PaymentMethodSelector,
  getAvailablePaymentMethods,
  isPaymentMethodAvailable,
  resolvePaymentMethod,
} from "@/components/payments/payment-method-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { StripePaymentDialog } from "@/components/payments/stripe-payment-dialog";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { ordersApi, paymentsApi } from "@/lib/api/services";
import { PAYMENT_METHOD_META } from "@/lib/constants";
import { getGuestToken } from "@/lib/guest-orders";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import {
  PAYMENT_STATUS_POLL_TIMEOUT_MS,
  PAYMENT_STATUS_REFRESH_INTERVAL_MS,
  ensureInitiatePaymentResult,
  getPaymentRedirectUrl,
  getPaymentStartErrorMessage,
  isOnlinePaymentMethod,
  isPaymentInProgress,
  isRedirectPaymentMethod,
} from "@/lib/payments";
import { cn, formatDate, getErrorMessage, humanizeEnum } from "@/lib/utils";
import type { Order, PaymentMethod, PaymentStatus, ReceiptData } from "@/types";

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

/** Mirrors the server's receipt gate: no receipt for unfinalised orders. */
function canViewReceipt(order: Order): boolean {
  if (order.paymentStatus === "PAID") return true;
  return (
    order.paymentMethod === "CASH_ON_DELIVERY" &&
    (["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as string[]).includes(
      order.status,
    )
  );
}

function PaymentBanner({ status }: { status: PaymentStatus }) {
  const content: Record<PaymentStatus, { tone: string; icon: typeof CheckCircle2; title: string; copy: string }> = {
    PAID: {
      tone: "border-success/25 bg-success-soft text-success",
      icon: CheckCircle2,
      title: "Payment received",
      copy: "Thank you â€” your payment is confirmed and the order is being prepared.",
    },
    PENDING: {
      tone: "border-warning/25 bg-warning-soft text-warning",
      icon: AlertCircle,
      title: "Payment pending",
      copy: "This order is waiting for payment. You can retry from this page if you used an online method.",
    },
    PROCESSING: {
      tone: "border-info/25 bg-info-soft text-info",
      icon: RotateCcw,
      title: "Payment processing",
      copy: "The provider is still confirming this payment. We will update the order automatically.",
    },
    FAILED: {
      tone: "border-danger/25 bg-danger-soft text-danger",
      icon: XCircle,
      title: "Payment failed",
      copy: "The provider did not complete this payment. Use Retry payment to choose a method and try again.",
    },
    CANCELLED: {
      tone: "border-border bg-muted text-foreground",
      icon: XCircle,
      title: "Payment cancelled",
      copy: "This payment was cancelled. Use Retry payment to choose a different method or try again.",
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
    <div className={cn("flex items-start gap-3 rounded-none border p-4", meta.tone)} role="status">
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm font-bold">{meta.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-90">{meta.copy}</p>
      </div>
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function receiptVariantLabel(item: {
  size?: string | null;
  color?: string | null;
}): string | null {
  const parts = [
    item.size ? `Size: ${item.size}` : null,
    item.color ? `Color: ${item.color}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" Â· ") : null;
}

export function ReceiptDialog({
  orderId,
  guestToken = null,
  open,
  onClose,
}: {
  orderId: string;
  guestToken?: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const receipt = useQuery({
    queryKey: queryKeys.orders.receipt(guestToken ? `${orderId}:guest` : orderId),
    queryFn: () =>
      guestToken
        ? ordersApi.guestReceipt(orderId, guestToken)
        : ordersApi.receipt(orderId),
    enabled: open,
  });

  const money = (value: number, currency?: string) =>
    `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value)}${currency ? ` ${currency}` : ""}`;

  const buildPrintableHtml = (data: ReceiptData): string => {
    const display = data.display;
    const itemRows = data.items
      .map((item) => {
        const variant = receiptVariantLabel(item);
        return `
          <tr>
            <td>
              ${escapeHtml(item.productName)}
              ${variant ? `<div class="variant">${escapeHtml(variant)}</div>` : ""}
            </td>
            <td class="num">${item.quantity}</td>
            <td class="num">${money(item.unitPrice, data.totals.currency)}</td>
            <td class="num">${money(item.totalPrice, data.totals.currency)}</td>
          </tr>`;
      })
      .join("");

    const printStyles = getComputedStyle(document.documentElement);
    const printTokens = [
      "background",
      "foreground",
      "card",
      "border",
      "muted-foreground",
      "primary",
    ]
      .map((token) => `--${token}: ${printStyles.getPropertyValue(`--${token}`).trim()};`)
      .join("\n  ");

    const details = [
      display.showPaymentMethod && data.payment
        ? `<p class="muted">Payment method: <strong>${escapeHtml(humanizeEnum(data.payment.method))}</strong></p>`
        : "",
      display.showTransactionId && data.payment?.transactionId
        ? `<p class="muted">Transaction ID: <strong>${escapeHtml(data.payment.transactionId)}</strong></p>`
        : "",
    ]
      .filter(Boolean)
      .join("");

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Receipt ${escapeHtml(data.receiptNumber)}</title>
<style>
  :root { color-scheme: light; ${printTokens} }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px; background: var(--background); color: var(--foreground); font-family: Georgia, "Times New Roman", serif; }
  .sheet { max-width: 760px; margin: 0 auto; background: var(--card); border: 1px solid var(--border); padding: 40px; }
  .head { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid var(--primary); padding-bottom: 20px; }
  .brand { font-size: 24px; letter-spacing: .08em; text-transform: uppercase; color: var(--primary); margin: 0 0 6px; }
  .logo { max-height: 64px; max-width: 180px; object-fit: contain; margin-bottom: 12px; }
  .tagline { font-style: italic; }
  .muted { color: var(--muted-foreground); font-size: 12px; line-height: 1.6; margin: 0 0 3px; }
  .meta { text-align: right; font-size: 12px; color: var(--muted-foreground); }
  .meta strong { display: block; color: var(--foreground); font-size: 14px; margin-bottom: 4px; }
  h2 { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--muted-foreground); margin: 28px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted-foreground); border-bottom: 1px solid var(--border); padding: 8px 6px; }
  td { border-bottom: 1px solid var(--border); padding: 9px 6px; }
  .variant { color: var(--muted-foreground); font-size: 10px; margin-top: 3px; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .totals { margin-left: auto; width: 280px; margin-top: 18px; font-size: 13px; }
  .totals div { display: flex; justify-content: space-between; padding: 5px 0; }
  .totals .total { border-top: 2px solid var(--primary); margin-top: 6px; padding-top: 10px; font-weight: 700; color: var(--primary); }
  .foot { margin-top: 32px; border-top: 1px solid var(--border); padding-top: 16px; font-size: 11px; color: var(--muted-foreground); text-align: center; }
  @media print { body { background: var(--card); padding: 0; } .sheet { border: 0; padding: 24px; } }
</style>
</head>
<body>
  <main class="sheet">
    <div class="head">
      <div>
        ${display.showLogo && data.store.logoUrl ? `<img class="logo" src="${escapeHtml(data.store.logoUrl)}" alt="${escapeHtml(data.store.name)} logo" />` : ""}
        <p class="brand">${escapeHtml(data.store.name)}</p>
        ${data.store.tagline ? `<p class="muted tagline">${escapeHtml(data.store.tagline)}</p>` : ""}
        ${data.store.address ? `<p class="muted">${escapeHtml(data.store.address)}</p>` : ""}
        <p class="muted">${[data.store.phone, data.store.email].filter(Boolean).map(escapeHtml).join(" Â· ")}</p>
      </div>
      <div class="meta">
        <strong>${escapeHtml(data.receiptNumber)}</strong>
        <p class="muted">Order ${escapeHtml(data.orderNumber)}</p>
        <p class="muted">${escapeHtml(formatDate(data.issuedAt, "long"))}</p>
      </div>
    </div>

    ${display.showCustomer ? `
    <h2>Billed to</h2>
    <p class="muted">
      <strong style="color:var(--foreground)">${escapeHtml(data.customer.name)}</strong><br />
      ${escapeHtml(data.customer.email)}${data.customer.phone ? `<br />${escapeHtml(data.customer.phone)}` : ""}
    </p>` : ""}

    ${display.showShippingAddress && data.shippingAddress ? `
    <h2>Ship to</h2>
    <p class="muted">
      ${escapeHtml(data.shippingAddress.fullName)}<br />
      ${escapeHtml(data.shippingAddress.addressLine)}<br />
      ${[data.shippingAddress.area, data.shippingAddress.district, data.shippingAddress.division, data.shippingAddress.postalCode]
        .filter((value): value is string => Boolean(value))
        .map(escapeHtml)
        .join(", ")}
    </p>` : ""}

    ${details ? `<h2>Payment</h2>${details}` : ""}

    <h2>Items</h2>
    <table>
      <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Unit</th><th class="num">Total</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div class="totals">
      <div><span>Product Subtotal</span><span>${money(data.totals.subtotal, data.totals.currency)}</span></div>
      <div><span>Discount</span><span>−${money(data.totals.discountAmount)}</span></div>
      <div><span>Shipping</span><span>${money(data.totals.shippingCost, data.totals.currency)}</span></div>
      <div class="total"><span>Total</span><span>${money(data.totals.totalAmount, data.totals.currency)}</span></div>
    </div>
    <p class="foot">${escapeHtml(data.store.footerNote)}</p>
  </main>
</body>
</html>`;
  };

  const downloadReceipt = () => {
    const data = receipt.data;
    if (!data) return;

    const blob = new Blob([buildPrintableHtml(data)], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${data.receiptNumber}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const printReceipt = () => {
    const data = receipt.data;
    if (!data) return;

    const printWindow = window.open("", "_blank", "width=860,height=1000");
    if (!printWindow) {
      toast.error("Allow pop-ups to print this receipt");
      return;
    }
    printWindow.document.write(buildPrintableHtml(data));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

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
          <Button
            variant="outline"
            size="sm"
            onClick={downloadReceipt}
            disabled={!receipt.data}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download
          </Button>
          <Button size="sm" onClick={printReceipt} disabled={!receipt.data}>
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
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
            <div className="min-w-0">
              {receipt.data.display.showLogo && receipt.data.store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={receipt.data.store.logoUrl}
                  alt={`${receipt.data.store.name} logo`}
                  className="mb-3 max-h-14 max-w-40 object-contain"
                />
              ) : null}
              <p className="break-words font-display text-lg font-semibold">{receipt.data.store.name}</p>
              {receipt.data.store.tagline ? (
                <p className="break-words text-xs italic text-muted-foreground">
                  {receipt.data.store.tagline}
                </p>
              ) : null}
              {receipt.data.store.address ? (
                <p className="break-words text-xs text-muted-foreground">{receipt.data.store.address}</p>
              ) : null}
              <p className="break-words text-xs text-muted-foreground">
                {[receipt.data.store.phone, receipt.data.store.email]
                  .filter(Boolean)
                  .join(" Â· ")}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="font-bold text-foreground">{receipt.data.receiptNumber}</p>
              <p>Order {receipt.data.orderNumber}</p>
              <p>{formatDate(receipt.data.issuedAt, "long")}</p>
            </div>
          </div>

          {receipt.data.display.showCustomer ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Customer</p>
              <p className="break-words font-semibold">{receipt.data.customer.name}</p>
              <p className="break-words text-xs text-muted-foreground">{receipt.data.customer.email}</p>
              {receipt.data.customer.phone ? (
                <p className="break-words text-xs text-muted-foreground">{receipt.data.customer.phone}</p>
              ) : null}
            </div>
          ) : null}

          {receipt.data.display.showShippingAddress && receipt.data.shippingAddress ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Ship to</p>
              <p className="break-words text-xs text-muted-foreground">
                {[
                  receipt.data.shippingAddress.addressLine,
                  receipt.data.shippingAddress.area,
                  receipt.data.shippingAddress.district,
                  receipt.data.shippingAddress.division,
                  receipt.data.shippingAddress.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          ) : null}

          {receipt.data.display.showPaymentMethod && receipt.data.payment ? (
            <p className="break-words text-xs text-muted-foreground">
              Payment method: <span className="font-semibold text-foreground">{humanizeEnum(receipt.data.payment.method)}</span>
            </p>
          ) : null}
          {receipt.data.display.showTransactionId && receipt.data.payment?.transactionId ? (
            <p className="break-words text-xs text-muted-foreground">
              Transaction ID: <span className="font-semibold text-foreground">{receipt.data.payment.transactionId}</span>
            </p>
          ) : null}

          <ul className="divide-y divide-border rounded-none border border-border">
            {receipt.data.items.map((item) => {
              const variant = receiptVariantLabel(item);
              return (
                <li key={`${item.productName}-${item.quantity}`} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="break-words text-xs font-semibold">{item.productName}</p>
                    {variant ? (
                      <p className="break-words text-[11px] text-muted-foreground">{variant}</p>
                    ) : null}
                    <p className="text-[11px] text-muted-foreground">
                      {item.quantity} Ã— {money(item.unitPrice)}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-bold tabular-nums">
                    {money(item.totalPrice)}
                  </p>
                </li>
              );
            })}
          </ul>

          <dl className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Product Subtotal</dt>
              <dd className="tabular-nums">{money(receipt.data.totals.subtotal, receipt.data.totals.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="tabular-nums">−{money(receipt.data.totals.discountAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">{money(receipt.data.totals.shippingCost, receipt.data.totals.currency)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 text-sm font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">
                {money(receipt.data.totals.totalAmount, receipt.data.totals.currency)}
              </dd>
            </div>
          </dl>

          <p className="break-words border-t border-border pt-3 text-xs italic text-muted-foreground">
            {receipt.data.store.footerNote}
          </p>
        </div>
      ) : null}
    </Dialog>
  );
}

export function OrderDetailView({
  orderId,
  paymentStatusParam,
  guest = false,
}: {
  orderId: string;
  paymentStatusParam?: string | null;
  /** Guest orders are authorised by a token stored in this browser. */
  guest?: boolean;
}) {
  const queryClient = useQueryClient();
  const refreshOrder = React.useCallback(
    () => invalidateKeys(queryClient, relatedKeys("orders")),
    [queryClient],
  );
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [retryOpen, setRetryOpen] = React.useState(false);
  const [retryMethod, setRetryMethod] = React.useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [cardSession, setCardSession] = React.useState<{
    clientSecret: string;
    publishableKey: string;
    guestToken: string | null;
  } | null>(null);
  const [paying, setPaying] = React.useState(false);
  const payingRef = React.useRef(false);
  const paymentPollStartedAt = React.useRef<number | null>(null);
  const [guestToken, setGuestToken] = React.useState<string | null>(null);
  const [guestTokenResolved, setGuestTokenResolved] = React.useState(!guest);

  React.useEffect(() => {
    setGuestToken(guest ? getGuestToken(orderId) : null);
    setGuestTokenResolved(true);
  }, [guest, orderId]);

  const orderQuery = useQuery({
    queryKey: guestToken
      ? queryKeys.orders.guestDetail(orderId, guestToken)
      : queryKeys.orders.detail(orderId),
    queryFn: () =>
      guestToken
        ? ordersApi.guestGet(orderId, guestToken)
        : ordersApi.get(orderId),
    enabled: Boolean(orderId) && guestTokenResolved && (!guest || Boolean(guestToken)),
    refetchInterval: (query) => {
      const current = query.state.data;
      if (!current) return false;
      if (!isOnlinePaymentMethod(current.paymentMethod)) return false;
      if (!isPaymentInProgress(current.paymentStatus)) return false;

      const startedAt = paymentPollStartedAt.current;
      if (
        startedAt !== null &&
        Date.now() - startedAt >= PAYMENT_STATUS_POLL_TIMEOUT_MS
      ) {
        return false;
      }

      return PAYMENT_STATUS_REFRESH_INTERVAL_MS;
    },
  });

  const providersQuery = useQuery({
    queryKey: queryKeys.paymentProviders.all(),
    queryFn: paymentsApi.providers,
    staleTime: 60_000,
  });

  React.useEffect(() => {
    if (!retryOpen || !providersQuery.data) return;
    const enabledMethod = resolvePaymentMethod(retryMethod, providersQuery.data);
    if (enabledMethod && enabledMethod !== retryMethod) setRetryMethod(enabledMethod);
  }, [providersQuery.data, retryMethod, retryOpen]);

  const order = orderQuery.data;
  const callbackStatus = normalizePaymentStatus(paymentStatusParam);

  React.useEffect(() => {
    if (callbackStatus) refreshOrder();
  }, [callbackStatus, refreshOrder]);

  React.useEffect(() => {
    const shouldPoll =
      order !== undefined &&
      isOnlinePaymentMethod(order.paymentMethod) &&
      isPaymentInProgress(order.paymentStatus);

    if (shouldPoll) {
      paymentPollStartedAt.current ??= Date.now();
    } else {
      paymentPollStartedAt.current = null;
    }
  }, [order]);

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(orderId),
    onSuccess: () => {
      toast.success("Order cancelled");
      refreshOrder();
      setCancelOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not cancel this order")),
  });

  const openRetryPayment = React.useCallback((current: Order) => {
    setRetryMethod(current.paymentMethod);
    setRetryOpen(true);
  }, []);

  const startPayment = async (current: Order, method: PaymentMethod) => {
    if (
      current.paymentStatus === "PAID" ||
      current.paymentStatus === "REFUNDED" ||
      current.status === "CANCELLED" ||
      current.status === "RETURNED"
    ) {
      return;
    }
    if (payingRef.current) return;

    const providers = providersQuery.data;
    if (!providers) {
      toast.error("Payment methods are still loading. Please try again in a moment.");
      return;
    }
    if (!isPaymentMethodAvailable(method, providers)) {
      toast.error("That payment method is not available right now. Choose another.");
      return;
    }

    payingRef.current = true;
    setPaying(true);
    // A fresh attempt must not inherit the previous polling timeout window.
    paymentPollStartedAt.current = null;

    try {
      const result = guestToken
        ? await paymentsApi.guestInitiate({
            orderId: current.id,
            guestToken,
            method,
          })
        : await paymentsApi.initiate({ orderId: current.id, method });
      const initiation = ensureInitiatePaymentResult(result, method);

      if (initiation.paymentStatus === "PAID") {
        toast.success("This payment is already confirmed.");
        setRetryOpen(false);
        refreshOrder();
        return;
      }

      if (method === "CASH_ON_DELIVERY") {
        toast.success(
          initiation.message ||
            "Cash on delivery selected. Please pay the courier when your order arrives.",
        );
        setRetryOpen(false);
        refreshOrder();
        return;
      }

      if (method === "CARD") {
        const publishableKey = providers.cardPublishableKey;

        if (initiation.clientSecret && publishableKey) {
          setRetryOpen(false);
          setCardSession({
            clientSecret: initiation.clientSecret,
            publishableKey,
            guestToken,
          });
        } else if (initiation.clientSecret) {
          toast.error(
            "Card payments are configured on the server but no publishable key is available to the browser.",
          );
        } else {
          toast.info(initiation.message || "Card payment is already processing.");
          setRetryOpen(false);
          refreshOrder();
        }
        return;
      }

      if (isRedirectPaymentMethod(method)) {
        const redirectUrl = getPaymentRedirectUrl(initiation, method);

        if (redirectUrl) {
          setRetryOpen(false);
          window.location.assign(redirectUrl);
          return;
        }

        const hadRedirectUrl = Boolean(
          (method === "BKASH" ? initiation.bkashURL : null) ??
            initiation.redirectUrl,
        );

        toast.error(
          hadRedirectUrl
            ? "The payment provider returned an insecure checkout link. Please try again."
            : initiation.message || "No payment link was returned by the provider.",
        );
        refreshOrder();
      }
    } catch (error) {
      toast.error(getPaymentStartErrorMessage(error, method));
      refreshOrder();
    } finally {
      payingRef.current = false;
      setPaying(false);
    }
  };

  if (guest && guestTokenResolved && !guestToken) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Guest order access expired"
        description="This browser no longer has the private link token for that order. Check the order confirmation message or place a new order."
        action={
          <Button asChild>
            <Link href="/products">Back to the shop</Link>
          </Button>
        }
      />
    );
  }

  if (orderQuery.isLoading || (guest && !guestTokenResolved)) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-none" />
        <Skeleton className="h-72 w-full rounded-none" />
        <Skeleton className="h-44 w-full rounded-none" />
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

  const canCancel =
    !guest && (order.status === "PENDING" || order.status === "CONFIRMED");
  const showReceipt = canViewReceipt(order);
  const canRetryPayment =
    order.paymentStatus !== "PAID" &&
    order.paymentStatus !== "REFUNDED" &&
    order.status !== "CANCELLED" &&
    order.status !== "RETURNED";
  const steps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

  return (
    <div className="space-y-5">
      {isOnlinePaymentMethod(order.paymentMethod) ? (
        <PaymentBanner status={order.paymentStatus} />
      ) : null}

      <Card className="overflow-hidden">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Orders
              </Link>
              <span className="text-muted-foreground" aria-hidden="true">Â·</span>
              <span className="text-xs text-muted-foreground">{formatDate(order.createdAt, "long")}</span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">{order.orderNumber}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
              <Badge tone="neutral">
                {PAYMENT_METHOD_META[order.paymentMethod].label}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {showReceipt ? (
              <Button variant="outline" size="sm" onClick={() => setReceiptOpen(true)}>
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Receipt
              </Button>
            ) : null}
            {canRetryPayment ? (
              <Button size="sm" loading={paying} onClick={() => openRetryPayment(order)}>
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
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border p-5">
              <CardTitle className="font-display text-base">Items in this order</CardTitle>
              <p className="text-xs text-muted-foreground">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} unit(s) Â·{" "}
                {order.items.length} line{order.items.length === 1 ? "" : "s"}
              </p>
            </CardHeader>
            <ul className="divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3 p-4 sm:items-center">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-none bg-muted">
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
                      {item.sku ? `SKU ${item.sku} Â· ` : ""}Qty {item.quantity}
                    </p>
                    {item.size || item.color ? (
                      <p className="mt-1 flex flex-wrap gap-1">
                        {item.size ? <Badge tone="neutral">Size: {item.size}</Badge> : null}
                        {item.color ? <Badge tone="neutral">Color: {item.color}</Badge> : null}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <Price amount={item.totalPrice} size="sm" />
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {item.quantity} Ãƒâ€” {new Intl.NumberFormat("en-US").format(item.finalUnitPrice)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-border px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Product Subtotal</dt>
                <dd><Price amount={order.subtotal} size="sm" /></dd>
              </div>
              {order.discountAmount > 0 ? (
                <div className="flex justify-between text-success">
                  <dt>Discount{order.coupon ? ` Â· ${order.coupon.code}` : ""}</dt>
                  <dd className="font-semibold tabular-nums">−{new Intl.NumberFormat("en-US").format(order.discountAmount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-semibold">{order.shippingCost === 0 ? "Free" : new Intl.NumberFormat("en-US").format(order.shippingCost)}</dd>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-extrabold">
                <dt>Total</dt>
                <dd><Price amount={order.totalAmount} size="md" /></dd>
              </div>
            </dl>
          </Card>

          {order.notes ? (
            <Card className="p-5">
              <CardTitle className="font-display text-base">Delivery notes</CardTitle>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{order.notes}</p>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              Delivery address
            </CardTitle>
            {order.address ? (
              <address className="mt-3 text-sm not-italic leading-relaxed text-muted-foreground">
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
              <p className="mt-3 text-sm text-muted-foreground">No address on file.</p>
            )}
          </Card>

          <Card className="p-5">
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />
              Payment
            </CardTitle>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Method</dt>
                <dd className="font-semibold">{PAYMENT_METHOD_META[order.paymentMethod].label}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Status</dt>
                <dd><PaymentStatusBadge status={order.paymentStatus} /></dd>
              </div>
              {order.payment?.collectedAt ? (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Collected</dt>
                  <dd className="text-xs font-semibold text-right">
                    {formatDate(order.payment.collectedAt, "long")}
                    {order.payment.collectedByName ? ` Â· ${order.payment.collectedByName}` : ""}
                  </dd>
                </div>
              ) : null}
              {order.payment?.transactionId ? (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Transaction</dt>
                  <dd className="max-w-40 truncate font-mono text-xs">{order.payment.transactionId}</dd>
                </div>
              ) : null}
              {order.payment?.paidAt ? (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Paid</dt>
                  <dd className="text-xs font-semibold">{formatDate(order.payment.paidAt, "long")}</dd>
                </div>
              ) : null}
              {order.receiptNumber ? (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Receipt</dt>
                  <dd className="text-xs font-semibold">{order.receiptNumber}</dd>
                </div>
              ) : null}
            </dl>
            {order.payment?.collectionNote ? (
              <p className="mt-3 rounded-none border border-border bg-muted/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                {order.payment.collectionNote}
              </p>
            ) : null}
            {order.paymentMethod === "CASH_ON_DELIVERY" &&
            order.paymentStatus !== "PAID" &&
            order.paymentStatus !== "REFUNDED" &&
            order.status !== "CANCELLED" &&
            order.status !== "RETURNED" ? (
              <p className="mt-3 rounded-none border border-warning/25 bg-warning-soft p-2.5 text-[11px] leading-relaxed text-warning">
                Cash payment due. Please have{" "}
                {new Intl.NumberFormat("en-US").format(order.totalAmount)} ready
                when your order is delivered. The order is already confirmed.
              </p>
            ) : null}
          </Card>

          <Card className="p-5">
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
              Fulfilment
            </CardTitle>
            <ol className="mt-4 space-y-3">
              {steps.map((step) => {
                const orderIndex = steps.indexOf(order.status as (typeof steps)[number]);
                const stepIndex = steps.indexOf(step);
                const complete =
                  orderIndex >= stepIndex && !["CANCELLED", "RETURNED"].includes(order.status);
                return (
                  <li key={step} className="flex items-center gap-2.5 text-xs">
                    <span
                      className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded-none border",
                        complete
                          ? "border-success bg-success text-primary-foreground"
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

      <ReceiptDialog
        orderId={orderId}
        guestToken={guestToken}
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
      />

      <Dialog
        open={retryOpen}
        onClose={() => {
          if (!paying) setRetryOpen(false);
        }}
        title="Retry payment"
        description="Choose a payment method for this order. You can switch to another available method if your previous attempt failed or was cancelled."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setRetryOpen(false)}
              disabled={paying}
            >
              Cancel
            </Button>
            <Button
              loading={paying}
              disabled={paying || !isPaymentMethodAvailable(retryMethod, providersQuery.data)}
              onClick={() => void startPayment(order, retryMethod)}
            >
              Continue with {PAYMENT_METHOD_META[retryMethod].label}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <PaymentMethodSelector
            value={retryMethod}
            onChange={setRetryMethod}
            providers={providersQuery.data}
            disabled={paying}
          />
          {providersQuery.isLoading ? (
            <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <RotateCcw className="h-3 w-3 animate-spin" aria-hidden="true" />
              Checking payment method availability…
            </p>
          ) : null}
          {providersQuery.isError ? (
            <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              Could not load payment methods. Please try again.
            </p>
          ) : null}
          {providersQuery.data &&
          getAvailablePaymentMethods(providersQuery.data).length === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              No payment methods are currently enabled for this order.
            </p>
          ) : null}
        </div>
      </Dialog>

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
          guestToken={cardSession.guestToken}
          onResolved={() => {
            setCardSession(null);
            refreshOrder();
          }}
        />
      ) : null}
    </div>
  );
}
