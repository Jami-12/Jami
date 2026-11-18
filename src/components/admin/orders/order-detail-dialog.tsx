"use client";

import { Banknote, CheckCircle2, FileText, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { ORDER_TRANSITIONS, PAYMENT_METHOD_META } from "@/lib/constants";
import { formatCurrency, formatDate, humanizeEnum } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

export function OrderDetailDialog({
  order,
  open,
  onClose,
  loading,
  cashDue,
  onCollectCash,
  onReceipt,
  onUpdateStatus,
  updatePending,
  updateNext,
}: {
  order: Order | undefined;
  open: boolean;
  onClose: () => void;
  loading: boolean;
  cashDue: boolean;
  onCollectCash: () => void;
  onReceipt: () => void;
  onUpdateStatus: (next: OrderStatus) => void;
  updatePending: boolean;
  updateNext?: OrderStatus;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={order ? `Order ${order.orderNumber}` : "Order details"}
      description={order ? formatDate(order.createdAt, "long") : undefined}
      size="xl"
      footer={
        <>
          {cashDue ? (
            <Button size="sm" onClick={onCollectCash}>
              <Banknote className="h-4 w-4" aria-hidden="true" />
              Record cash collection
            </Button>
          ) : null}
          {order ? (
            <Button variant="outline" size="sm" onClick={onReceipt}>
              <FileText className="h-4 w-4" aria-hidden="true" />
              Receipt
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      {loading || !order ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Fulfilment
              </p>
              <div className="mt-1.5">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Payment
              </p>
              <div className="mt-1.5">
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Method
              </p>
              <p className="mt-1.5 text-xs font-semibold">
                {PAYMENT_METHOD_META[order.paymentMethod].label}
              </p>
            </div>
          </div>

          {cashDue ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
                Cash payment due
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Collect {formatCurrency(order.totalAmount)} from the customer when the
                order is delivered, then record it here. The order exists now and is
                visible in the customer&apos;s order history.
              </p>
              <Button className="mt-2" size="sm" variant="outline" onClick={onCollectCash}>
                <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
                Record cash collection
              </Button>
            </div>
          ) : null}

          {order.payment?.collectedAt ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Cash collection recorded
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {order.payment.collectedByName ?? "Staff"} ·{" "}
                {formatDate(order.payment.collectedAt, "long")}
                {order.payment.transactionId
                  ? ` · Ref ${order.payment.transactionId}`
                  : ""}
              </p>
              {order.payment.collectionNote ? (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {order.payment.collectionNote}
                </p>
              ) : null}
            </div>
          ) : null}

          {ORDER_TRANSITIONS[order.status].length > 0 ? (
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold">
                <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                Move this order forward
              </p>
              <div className="flex flex-wrap gap-2">
                {ORDER_TRANSITIONS[order.status].map((next) => (
                  <Button
                    key={next}
                    size="sm"
                    variant={next === "CANCELLED" ? "danger" : "primary"}
                    loading={updatePending && updateNext === next}
                    onClick={() => onUpdateStatus(next)}
                  >
                    Mark {humanizeEnum(next).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <p className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
              This order is in a terminal state and cannot move further.
            </p>
          )}

          <div>
            <p className="mb-2 text-xs font-bold">Items</p>
            <ul className="divide-y divide-border rounded-xl border border-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 p-3">
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <SmartImage
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{item.productName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatCurrency(item.finalUnitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Shipping address
              </p>
              {order.address ? (
                <p className="mt-1.5 text-xs leading-relaxed">
                  {order.address.fullName}
                  <br />
                  {order.address.addressLine}
                  {order.address.area ? `, ${order.address.area}` : ""}
                  <br />
                  {order.address.district}
                  {order.address.division ? `, ${order.address.division}` : ""}
                  <br />
                  {order.address.phone}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  No address on file.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Summary
              </p>
              <dl className="mt-1.5 space-y-1 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatCurrency(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd>−{formatCurrency(order.discountAmount)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>{formatCurrency(order.shippingCost)}</dd>
                </div>
                <div className="flex justify-between gap-2 border-t border-border pt-1 font-bold">
                  <dt>Total</dt>
                  <dd>{formatCurrency(order.totalAmount)}</dd>
                </div>
              </dl>
              {order.notes ? (
                <p className="mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
                  Note: {order.notes}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
