"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Percent } from "lucide-react";
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
import { FormField, Input, Select } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { settingsApi } from "@/lib/api/services";
import { relatedKeys } from "@/lib/query-keys";
import { cn, getErrorMessage } from "@/lib/utils";
import type { DiscountType, SiteSettings, UpdateSettingsInput } from "@/types";

type DiscountChoice = "NONE" | DiscountType;

interface FlatDiscountFormValues {
  enabled: boolean;
  type: DiscountChoice;
  value: string;
  minAmount: string;
}

type FlatDiscountField = "value" | "minAmount";
type FieldErrors = Partial<Record<FlatDiscountField, string>>;

function toForm(settings: SiteSettings): FlatDiscountFormValues {
  return {
    enabled: settings.flatDiscountEnabled,
    type: settings.flatDiscountType ?? "NONE",
    value: String(settings.flatDiscountValue ?? 0),
    minAmount:
      settings.flatDiscountMinAmount === null ||
      settings.flatDiscountMinAmount === undefined
        ? ""
        : String(settings.flatDiscountMinAmount),
  };
}

/** Returns null for blank or invalid input so validation can report it. */
function parseAmount(value: string): number | null {
  const text = value.trim();
  if (!text) return null;
  const amount = Number(text);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

/**
 * Store-wide automatic discount control. Used both as a Settings tab and as a
 * compact card on the Discounts page; both instances share the site-settings
 * cache, so a save updates every consumer immediately.
 */
export function FlatDiscountSettings({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { settings, setSettings } = useSiteSettings();

  const [draft, setDraft] = React.useState<FlatDiscountFormValues>(() =>
    toForm(settings),
  );
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [busy, setBusy] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft({
      enabled: settings.flatDiscountEnabled,
      type: settings.flatDiscountType ?? "NONE",
      value: String(settings.flatDiscountValue ?? 0),
      minAmount:
        settings.flatDiscountMinAmount === null ||
        settings.flatDiscountMinAmount === undefined
          ? ""
          : String(settings.flatDiscountMinAmount),
    });
    setErrors({});
  }, [
    settings.flatDiscountEnabled,
    settings.flatDiscountType,
    settings.flatDiscountValue,
    settings.flatDiscountMinAmount,
  ]);

  const isDirty = (() => {
    const saved = toForm(settings);
    return (
      draft.enabled !== saved.enabled ||
      draft.type !== saved.type ||
      draft.value !== saved.value ||
      draft.minAmount !== saved.minAmount
    );
  })();

  /** NONE or a disabled switch always persists a null type. */
  const effectiveType: DiscountType | null =
    draft.enabled && draft.type !== "NONE" ? draft.type : null;

  const value = effectiveType ? parseAmount(draft.value) : 0;
  const minAmount =
    effectiveType && draft.minAmount.trim() !== ""
      ? parseAmount(draft.minAmount)
      : null;

  const active = draft.enabled && effectiveType !== null && (value ?? 0) > 0;

  const status = busy
    ? "Saving"
    : isDirty
      ? "Unsaved changes"
      : lastSaved
        ? "Saved"
        : "Current";
  const statusTone = busy ? "info" : isDirty ? "warning" : "success";

  const updateField = <K extends keyof FlatDiscountFormValues>(
    field: K,
    next: FlatDiscountFormValues[K],
  ) => {
    setDraft((current) => ({ ...current, [field]: next }));
    if (field === "value" || field === "minAmount") {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    const nextErrors: FieldErrors = {};
    if (effectiveType && value === null) {
      nextErrors.value = "Enter a value of 0 or more";
    } else if (
      effectiveType === "PERCENTAGE" &&
      value !== null &&
      value > 100
    ) {
      nextErrors.value = "Percentage cannot exceed 100";
    }
    if (
      effectiveType &&
      draft.minAmount.trim() !== "" &&
      minAmount === null
    ) {
      nextErrors.minAmount = "Use 0 or more, or leave blank";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    try {
      const input: UpdateSettingsInput = {
        flatDiscountEnabled: draft.enabled,
        flatDiscountType: effectiveType,
        flatDiscountValue: value ?? 0,
        flatDiscountMinAmount: minAmount,
      };
      const updated = await settingsApi.update(input);

      setSettings(updated);
      queryClient.setQueryData(SITE_SETTINGS_QUERY_KEY, updated);
      setLastSaved(updated.updatedAt || new Date().toISOString());
      invalidateKeys(queryClient, relatedKeys("settings"));
      router.refresh();
      toast.success(
        active
          ? "Store-wide discount saved"
          : draft.enabled
            ? "Discount type cleared"
            : "Store-wide discount turned off",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save the flat discount"));
    } finally {
      setBusy(false);
    }
  };

  const summary = active
    ? `${effectiveType === "PERCENTAGE" ? `${value}% off` : `${value} BDT off`} on orders${
        minAmount !== null ? ` of at least ${minAmount} BDT` : " of any subtotal"
      }.`
    : draft.enabled
      ? "Choose a type and value to start discounting every order."
      : "No store-wide discount is applied. The type is saved as null.";

  return (
    <form onSubmit={submit} noValidate className="w-full min-w-0">
      <Card className="w-full min-w-0">
        <CardHeader
          className={cn(
            "gap-3 border-b border-border",
            compact ? "p-4 sm:p-5" : "sm:flex-row sm:items-start sm:justify-between",
          )}
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-accent-200">
              <Percent className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1">
              <CardTitle className="font-display text-lg">
                Store-wide flat discount
              </CardTitle>
              {compact ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Automatic discount applied before coupons on every order.
                </p>
              ) : (
                <CardDescription>
                  Set one automatic discount for the whole store. It is applied
                  to the product subtotal before coupons and is capped at that
                  subtotal.
                </CardDescription>
              )}
            </div>
          </div>
          <Badge tone={statusTone} dot className="w-fit">
            {status}
          </Badge>
        </CardHeader>

        <CardContent
          className={cn(
            "w-full min-w-0 space-y-4",
            compact ? "p-4 pt-5 sm:p-5 sm:pt-5" : "pt-5",
          )}
        >
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {active
                  ? "Active store-wide offer"
                  : draft.enabled
                    ? "Enabled — no type selected"
                    : "Disabled"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {summary}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone={active ? "success" : "neutral"} dot>
                {active ? "Applying" : "Inactive"}
              </Badge>
              <Switch
                checked={draft.enabled}
                disabled={busy}
                onCheckedChange={(value) => {
                  updateField("enabled", value);
                  setErrors({});
                }}
                aria-label={
                  draft.enabled
                    ? "Disable store-wide flat discount"
                    : "Enable store-wide flat discount"
                }
              />
            </div>
          </div>

          {draft.enabled ? (
            <div
              className={cn(
                "grid w-full min-w-0",
                compact ? "gap-3 sm:grid-cols-3" : "gap-4 sm:grid-cols-3",
              )}
            >
              <FormField
                label="Discount type"
                htmlFor="flat-discount-type"
                hint="NONE clears the saved type."
                className="min-w-0"
              >
                <Select
                  id="flat-discount-type"
                  value={draft.type}
                  disabled={busy}
                  onChange={(event) => {
                    updateField("type", event.target.value as DiscountChoice);
                    setErrors({});
                  }}
                >
                  <option value="NONE">None</option>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed amount (BDT)</option>
                </Select>
              </FormField>

              {effectiveType ? (
                <>
                  <FormField
                    label="Discount value"
                    htmlFor="flat-discount-value"
                    required
                    error={errors.value}
                    hint={
                      effectiveType === "PERCENTAGE"
                        ? "Up to 100%."
                        : "Fixed amount in BDT."
                    }
                    className="min-w-0"
                  >
                    <div className="relative">
                      <Input
                        id="flat-discount-value"
                        type="number"
                        min="0"
                        max={effectiveType === "PERCENTAGE" ? 100 : undefined}
                        step="0.01"
                        inputMode="decimal"
                        value={draft.value}
                        disabled={busy}
                        invalid={Boolean(errors.value)}
                        onChange={(event) =>
                          updateField("value", event.target.value)
                        }
                        className={cn(
                          effectiveType === "PERCENTAGE" ? "pr-10" : "pr-14",
                        )}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        {effectiveType === "PERCENTAGE" ? "%" : "BDT"}
                      </span>
                    </div>
                  </FormField>

                  <FormField
                    label="Minimum order"
                    htmlFor="flat-discount-min"
                    error={errors.minAmount}
                    hint="Blank means no minimum."
                    className="min-w-0"
                  >
                    <div className="relative">
                      <Input
                        id="flat-discount-min"
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="No minimum"
                        value={draft.minAmount}
                        disabled={busy}
                        invalid={Boolean(errors.minAmount)}
                        onChange={(event) =>
                          updateField("minAmount", event.target.value)
                        }
                        className="pr-14"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        BDT
                      </span>
                    </div>
                  </FormField>
                </>
              ) : (
                <div className="rounded-none border border-dashed border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground sm:col-span-2">
                  Choose Percentage or Fixed amount to activate the discount.
                  Saving with NONE stores <code>flatDiscountType = null</code>.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-none border border-dashed border-border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
              Disabled: no store-wide discount is calculated. The type is saved
              as <code>null</code> and a blank minimum is saved as{" "}
              <code>null</code>.
            </div>
          )}
        </CardContent>

        <CardFooter
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5",
            compact && "p-4 pt-5 sm:p-5 sm:pt-5",
          )}
        >
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Applied before coupons; capped at the order subtotal.
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
              Save discount
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
