"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { paymentsApi, settingsApi } from "@/lib/api/services";
import { PAYMENT_METHOD_META } from "@/lib/constants";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/utils";
import type { PaymentMethod, SiteSettings, UpdateSettingsInput } from "@/types";

type ToggleKey = "codEnabled" | "bkashEnabled" | "nagadEnabled" | "stripeEnabled";

interface ToggleMeta {
  key: ToggleKey;
  method: PaymentMethod;
  providerKey: "cashOnDelivery" | "bkash" | "nagad" | "card";
  note: string;
}

const TOGGLES: ToggleMeta[] = [
  {
    key: "codEnabled",
    method: "CASH_ON_DELIVERY",
    providerKey: "cashOnDelivery",
    note: "Cash is collected by the courier or by staff from the Cash Collection screen.",
  },
  {
    key: "bkashEnabled",
    method: "BKASH",
    providerKey: "bkash",
    note: "Requires bKash credentials and a public HTTPS callback URL on the server.",
  },
  {
    key: "nagadEnabled",
    method: "NAGAD",
    providerKey: "nagad",
    note: "Requires Nagad credentials and a public callback URL on the server.",
  },
  {
    key: "stripeEnabled",
    method: "CARD",
    providerKey: "card",
    note: "Requires Stripe secret/publishable keys. Card checkout also needs the publishable key in the browser.",
  },
];

export function PaymentMethodSettings() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { settings, setSettings } = useSiteSettings();

  const providersQuery = useQuery({
    queryKey: queryKeys.paymentProviders.all(),
    queryFn: paymentsApi.providers,
    staleTime: 60_000,
  });

  const mutation = useMutation<
    SiteSettings,
    Error,
    { key: ToggleKey; value: boolean },
    { previous?: SiteSettings }
  >({
    mutationFn: ({ key, value }) =>
      settingsApi.update({ [key]: value } as UpdateSettingsInput),
    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: ["settings"] });
      const previous = queryClient.getQueryData<SiteSettings>(["settings"]);
      queryClient.setQueryData<SiteSettings>(["settings"], (current) =>
        current ? ({ ...current, [key]: value } as SiteSettings) : current,
      );
      return { previous };
    },
    onSuccess: (updated, { key, value }) => {
      setSettings(updated);
      invalidateKeys(queryClient, relatedKeys("settings"));
      void queryClient.invalidateQueries({
        queryKey: queryKeys.paymentProviders.all(),
      });
      router.refresh();
      const label =
        TOGGLES.find((item) => item.key === key)?.method
          ? PAYMENT_METHOD_META[
              TOGGLES.find((item) => item.key === key)!.method
            ].label
          : "Payment method";
      toast.success(`${label} ${value ? "enabled" : "disabled"}`);
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["settings"], context.previous);
      }
      toast.error(getErrorMessage(error, "Could not update payment method"));
    },
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Control which payment methods appear at checkout and can be initiated by
        customers. Disabled methods are hidden from storefront checkout and
        rejected by the server if called directly.
      </p>

      {providersQuery.isLoading ? (
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          Checking provider configuration…
        </p>
      ) : null}

      {providersQuery.isError ? (
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Could not load provider status. Toggles still save, but server
          configuration status may be stale.
        </p>
      ) : null}

      <div className="grid gap-3">
        {TOGGLES.map((toggle) => {
          const enabled = settings[toggle.key];
          const providerConfigured = providersQuery.data
            ? Boolean(providersQuery.data[toggle.providerKey])
            : null;
          const cardKeyMissing =
            toggle.key === "stripeEnabled" &&
            Boolean(providersQuery.data?.card) &&
            !providersQuery.data?.cardPublishableKey;

          return (
            <Card
              key={toggle.key}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">
                    {PAYMENT_METHOD_META[toggle.method].label}
                  </p>
                  <Badge tone={enabled ? "success" : "neutral"} dot>
                    {enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  {providerConfigured === false ? (
                    <Badge tone="warning">Server not configured</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {PAYMENT_METHOD_META[toggle.method].description}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {toggle.note}
                </p>
                {cardKeyMissing ? (
                  <p className="mt-2 text-[11px] leading-relaxed text-warning">
                    Stripe is configured on the server, but no publishable key is
                    exposed to the browser. Add STRIPE_PUBLISHABLE_KEY / the
                    provider status key so card checkout can load.
                  </p>
                ) : null}
                {enabled && providerConfigured === false ? (
                  <p className="mt-2 text-[11px] leading-relaxed text-warning">
                    This method is enabled in the dashboard, but server
                    configuration or credentials prevent it from being offered.
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Switch
                  checked={enabled}
                  loading={mutation.isPending && mutation.variables?.key === toggle.key}
                  onCheckedChange={(value) =>
                    mutation.mutate({ key: toggle.key, value })
                  }
                  aria-label={`${enabled ? "Disable" : "Enable"} ${
                    PAYMENT_METHOD_META[toggle.method].label
                  }`}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
