"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, PackageSearch, Search, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Price } from "@/components/ui/price";
import { SmartImage } from "@/components/ui/smart-image";
import { ordersApi } from "@/lib/api/services";
import { cn, formatRelative } from "@/lib/utils";
import type { OrderTrackingResult } from "@/types";

export function OrderTracking() {
  const [code, setCode] = React.useState("");
  const [result, setResult] = React.useState<OrderTrackingResult | null>(null);

  const track = useMutation({
    mutationFn: (value: string) => ordersApi.track(value.trim()),
    onSuccess: (data) => setResult(data),
    onError: () => setResult(null),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (code.trim().length >= 4) track.mutate(code);
  };

  return (
    <section
      aria-labelledby="order-tracking-heading"
      className="border-y border-border bg-muted/30"
    >
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-muted-foreground">Stay in the loop</p>
          <h2
            id="order-tracking-heading"
            className="mt-4 font-display text-2xl font-semibold not-italic tracking-tight sm:text-3xl"
          >
            Track your order
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Enter the order number or receipt code from your confirmation email
            to see exactly where your parcel is.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="mx-auto mt-7 flex max-w-xl flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              aria-label="Order number or code"
              placeholder="e.g. ORD-20261121-000123"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              minLength={4}
              maxLength={80}
              className="pl-9"
            />
          </div>
          <Button type="submit" loading={track.isPending} disabled={code.trim().length < 4}>
            <PackageSearch className="h-4 w-4" aria-hidden="true" />
            Track order
          </Button>
        </form>

        {track.isError ? (
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-destructive" role="alert">
            No order found for that code. Please check it and try again.
          </p>
        ) : null}

        {result ? (
          <Card className="mx-auto mt-8 max-w-3xl overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-foreground px-5 py-4 text-background">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-background/70">
                  Order
                </p>
                <p className="font-display text-lg font-semibold">{result.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-background/70">
                  Status
                </p>
                <p className="text-sm font-semibold capitalize">
                  {result.status.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
              {/* Timeline */}
              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Progress
                </p>
                <ol className="relative space-y-5 border-l border-border pl-5">
                  {result.timeline.map((event, index) => (
                    <li key={`${event.label}-${index}`} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[1.6rem] top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-[var(--card)]",
                          event.current
                            ? "bg-foreground text-background"
                            : "bg-muted-foreground/40 text-transparent",
                        )}
                      >
                        <Check className="h-2.5 w-2.5" aria-hidden="true" />
                      </span>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          event.current ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {event.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {event.description}
                      </p>
                      {event.timestamp ? (
                        <p className="mt-0.5 text-[10px] text-muted-foreground/80">
                          {formatRelative(event.timestamp)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Items + summary */}
              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Order summary
                </p>
                <ul className="space-y-3">
                  {result.items.map((item, index) => {
                    return (
                      <li key={`${item.productName}-${index}`} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-border bg-muted">
                          <SmartImage src={item.productImage} alt={item.productName} fill sizes="48px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-xs font-semibold">
                            {item.productName ?? "Product"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Qty {item.quantity}
                          </p>
                          {item.size || item.color ? (
                            <p className="break-words text-[10px] text-muted-foreground">
                              {[item.size ? `Size: ${item.size}` : null, item.color ? `Color: ${item.color}` : null]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          ) : null}
                        </div>
                        <Price amount={item.totalPrice} size="sm" />
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                    {result.itemCount} item{result.itemCount === 1 ? "" : "s"}
                  </span>
                  <Price amount={result.totalAmount} size="lg" />
                </div>
                <p className="mt-2 text-right text-[10px] text-muted-foreground">
                  Placed {formatRelative(result.placedAt)}
                </p>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
