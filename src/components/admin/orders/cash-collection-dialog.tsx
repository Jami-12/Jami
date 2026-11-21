"use client";

import { Banknote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField, Input, Textarea } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { Order } from "@/types";

export function CashCollectionDialog({
  order,
  open,
  onClose,
  note,
  reference,
  onNoteChange,
  onReferenceChange,
  onSubmit,
  pending,
}: {
  order: Order | undefined;
  open: boolean;
  onClose: () => void;
  note: string;
  reference: string;
  onNoteChange: (value: string) => void;
  onReferenceChange: (value: string) => void;
  onSubmit: () => void;
  pending: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!pending) onClose();
      }}
      title="Record cash collection"
      description={
        order
          ? `Order ${order.orderNumber} · ${formatCurrency(order.totalAmount)}`
          : undefined
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSubmit} loading={pending}>
            <Banknote className="h-4 w-4" aria-hidden="true" />
            Confirm payment received
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="rounded-none border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          This records the cash as collected, marks the payment{" "}
          <strong className="font-semibold text-foreground">PAID</strong> and posts
          the income to the ledger. The order&apos;s fulfilment status is not changed.
        </p>
        <FormField
          label="Collection note"
          htmlFor="collection-note"
          hint="Optional — who received it or handover details."
        >
          <Textarea
            id="collection-note"
            rows={3}
            maxLength={500}
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="e.g. Collected by courier, signed by customer"
          />
        </FormField>
        <FormField
          label="Reference"
          htmlFor="collection-reference"
          hint="Optional — receipt or courier reference."
        >
          <Input
            id="collection-reference"
            maxLength={120}
            value={reference}
            onChange={(event) => onReferenceChange(event.target.value)}
            placeholder="e.g. COD-2026-0042"
          />
        </FormField>
      </div>
    </Dialog>
  );
}
