"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  SITE_SETTINGS_QUERY_KEY,
  useSiteSettings,
} from "@/components/providers/site-settings-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField, Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { settingsApi } from "@/lib/api/services";
import { relatedKeys } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/utils";
import type { SiteSettings } from "@/types";

interface ShippingFormValues {
  enabled: boolean;
  fee: string;
  threshold: string;
}

type ShippingField = "fee" | "threshold";
type FieldErrors = Partial<Record<ShippingField, string>>;

function toForm(settings: SiteSettings): ShippingFormValues {
  return {
    enabled: settings.shippingEnabled,
    fee: String(settings.shippingFee ?? 0),
    threshold: String(settings.freeShippingThreshold ?? 0),
  };
}

/** Returns null for blank or invalid input so validation can report it. */
function parseAmount(value: string): number | null {
  const text = value.trim();
  if (!text) return null;
  const amount = Number(text);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

export function ShippingSettings() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { settings, setSettings } = useSiteSettings();

  const [draft, setDraft] = React.useState<ShippingFormValues>(() => toForm(settings));
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [busy, setBusy] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft({
      enabled: settings.shippingEnabled,
      fee: String(settings.shippingFee ?? 0),
      threshold: String(settings.freeShippingThreshold ?? 0),
    });
    setErrors({});
  }, [
    settings.shippingEnabled,
    settings.shippingFee,
    settings.freeShippingThreshold,
  ]);

  const isDirty =
    draft.enabled !== settings.shippingEnabled ||
    parseAmount(draft.fee) !== settings.shippingFee ||
    parseAmount(draft.threshold) !== settings.freeShippingThreshold;

  const fee = draft.enabled ? parseAmount(draft.fee) : 0;
  const threshold = draft.enabled ? parseAmount(draft.threshold) : 0;

  const status = busy
    ? "Saving"
    : isDirty
      ? "Unsaved changes"
      : lastSaved
        ? "Saved"
        : "Current";

  const statusTone = busy ? "info" : isDirty ? "warning" : "success";

  const updateField = (field: ShippingField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    const nextErrors: FieldErrors = {};
    if (draft.enabled && parseAmount(draft.fee) === null) {
      nextErrors.fee = "Enter a fee of 0 or more";
    }
    if (draft.enabled && parseAmount(draft.threshold) === null) {
      nextErrors.threshold = "Enter a threshold of 0 or more";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    try {
      const updated = await settingsApi.update(
        draft.enabled
          ? {
              shippingEnabled: true,
              shippingFee: parseAmount(draft.fee) ?? 0,
              freeShippingThreshold: parseAmount(draft.threshold) ?? 0,
            }
          : { shippingEnabled: false },
      );

      // Every consumer reads the same query cache, so the storefront sees the
      // new totals before a router refresh finishes.
      setSettings(updated);
      queryClient.setQueryData(SITE_SETTINGS_QUERY_KEY, updated);
      setLastSaved(updated.updatedAt || new Date().toISOString());
      invalidateKeys(queryClient, relatedKeys("settings"));
      router.refresh();
      toast.success(
        draft.enabled ? "Shipping settings saved" : "Shipping fee turned off",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save shipping settings"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="w-full min-w-0">
      <Card className="w-full min-w-0">
        <CardHeader className="gap-3 border-b border-border sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-accent-200">
              <Truck className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1">
              <CardTitle className="font-display text-lg">Shipping fee</CardTitle>
              <CardDescription>
                Charge a flat fee below the free-shipping threshold, or switch it
                off to give every order free shipping.
              </CardDescription>
            </div>
          </div>
          <Badge tone={statusTone} dot className="w-fit">
            {status}
          </Badge>
        </CardHeader>

        <CardContent className="w-full min-w-0 space-y-4 pt-5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {draft.enabled ? "Active fee" : "Off / free shipping"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {draft.enabled
                  ? "Checkout charges the fee until the product subtotal reaches the free-shipping threshold."
                  : "Checkout uses shippingFee = 0. The saved fee and threshold stay on file but are ignored until this is on."}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone={draft.enabled ? "success" : "neutral"} dot>
                {draft.enabled ? "On" : "Off"}
              </Badge>
              <Switch
                checked={draft.enabled}
                disabled={busy}
                onCheckedChange={(value) => {
                  setDraft((current) => ({ ...current, enabled: value }));
                  setErrors({});
                }}
                aria-label={
                  draft.enabled ? "Turn shipping fee off" : "Turn shipping fee on"
                }
              />
            </div>
          </div>

          <Separator />

          {draft.enabled ? (
            <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2">
              <FormField
                label="Shipping fee"
                htmlFor="shipping-fee"
                required
                error={errors.fee}
                hint="Flat charge in BDT when the threshold is not met."
                className="min-w-0"
              >
                <div className="relative">
                  <Input
                    id="shipping-fee"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={draft.fee}
                    disabled={busy}
                    invalid={Boolean(errors.fee)}
                    onChange={(event) => updateField("fee", event.target.value)}
                    className="pr-14"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    BDT
                  </span>
                </div>
              </FormField>

              <FormField
                label="Free shipping threshold"
                htmlFor="shipping-threshold"
                required
                error={errors.threshold}
                hint="Orders at or above this product subtotal ship free."
                className="min-w-0"
              >
                <div className="relative">
                  <Input
                    id="shipping-threshold"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={draft.threshold}
                    disabled={busy}
                    invalid={Boolean(errors.threshold)}
                    onChange={(event) =>
                      updateField("threshold", event.target.value)
                    }
                    className="pr-14"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    BDT
                  </span>
                </div>
              </FormField>
            </div>
          ) : (
            <div className="rounded-none border border-dashed border-border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
              Free shipping is active.{" "}
              <span className="font-semibold text-foreground">
                Checkout uses <code>shippingFee = 0</code>
              </span>{" "}
              regardless of the values saved above.
            </div>
          )}

          <div className="rounded-none border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">Live preview</p>
            <p className="mt-1">
              {draft.enabled ? (
                <>
                  Orders under{" "}
                  <span className="font-semibold text-foreground">
                    {threshold === null ? "—" : `${threshold} BDT`}
                  </span>{" "}
                  pay{" "}
                  <span className="font-semibold text-foreground">
                    {fee === null ? "—" : `${fee} BDT`}
                  </span>
                  ; orders at or above the threshold ship free.
                </>
              ) : (
                <>Every order ships free while the fee is off.</>
              )}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Applies to storefront and admin-created orders.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy || !isDirty}
              onClick={() => {
                setDraft(toForm(settings));
                setErrors({});
              }}
            >
              Discard
            </Button>
            <Button type="submit" size="sm" loading={busy} disabled={!isDirty}>
              Save shipping
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
