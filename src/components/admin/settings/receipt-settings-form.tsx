"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { ReceiptText } from "lucide-react";
import { toast } from "sonner";

import { ImageUploadField } from "@/components/admin/shared/image-upload-field";
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
import {
  FormField,
  Input,
  Textarea,
} from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { receiptSettingsApi, uploadsApi } from "@/lib/api/services";
import { queryKeys } from "@/lib/query-keys";
import { formatDate, getErrorMessage } from "@/lib/utils";
import type { ReceiptSettings } from "@/types";

const EMPTY_SETTINGS: ReceiptSettings = {
  id: "default",
  storeName: "",
  tagline: null,
  logoUrl: null,
  footerNote: null,
  contactPhone: null,
  contactEmail: null,
  contactAddress: null,
  showLogo: true,
  showSize: true,
  showColor: true,
  showPaymentMethod: true,
  showTransactionId: true,
  showCustomer: true,
  showShippingAddress: true,
  updatedAt: "",
};

const TOGGLES: Array<{
  name: keyof Pick<
    ReceiptSettings,
    | "showLogo"
    | "showSize"
    | "showColor"
    | "showPaymentMethod"
    | "showTransactionId"
    | "showCustomer"
    | "showShippingAddress"
  >;
  label: string;
  description: string;
}> = [
  { name: "showLogo", label: "Logo", description: "Show the uploaded logo in the receipt header." },
  { name: "showSize", label: "Size", description: "Show the selected size for each ordered item." },
  { name: "showColor", label: "Color", description: "Show the selected color for each ordered item." },
  { name: "showPaymentMethod", label: "Payment method", description: "Show how the customer paid." },
  { name: "showTransactionId", label: "Transaction ID", description: "Show the provider or cash-collection reference." },
  { name: "showCustomer", label: "Customer", description: "Show the customer's name and contact details." },
  { name: "showShippingAddress", label: "Shipping address", description: "Show the delivery address block." },
];

export function ReceiptSettingsForm() {
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoCleared, setLogoCleared] = React.useState(false);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.receipt(),
    queryFn: () => receiptSettingsApi.get(),
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty },
  } = useForm<ReceiptSettings>({ defaultValues: EMPTY_SETTINGS });

  React.useEffect(() => {
    if (settingsQuery.data) reset(settingsQuery.data);
  }, [settingsQuery.data, reset]);

  const values = watch();

  const mutation = useMutation({
    mutationFn: async (input: ReceiptSettings) => {
      let logoUrl = input.logoUrl;
      if (logoCleared) {
        logoUrl = null;
      } else if (logoFile) {
        const uploaded = await uploadsApi.uploadImage(logoFile, "banner");
        logoUrl = uploaded.url;
      }

      const updated = await receiptSettingsApi.update({
        storeName: input.storeName,
        tagline: input.tagline,
        logoUrl,
        footerNote: input.footerNote,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        contactAddress: input.contactAddress,
        showLogo: input.showLogo,
        showSize: input.showSize,
        showColor: input.showColor,
        showPaymentMethod: input.showPaymentMethod,
        showTransactionId: input.showTransactionId,
        showCustomer: input.showCustomer,
        showShippingAddress: input.showShippingAddress,
      });

      return updated;
    },
    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKeys.settings.receipt(), updated);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.settings.receipt() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.receiptAll() }),
      ]);
      setLogoFile(null);
      setLogoCleared(false);
      reset(updated);
      toast.success("Receipt settings saved");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not save receipt settings"));
    },
  });

  const discard = () => {
    setLogoFile(null);
    setLogoCleared(false);
    if (settingsQuery.data) reset(settingsQuery.data);
  };

  React.useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const previewLogo = logoCleared ? null : (logoPreview ?? values.logoUrl);

  return (
    <form
      onSubmit={handleSubmit((input) => mutation.mutate(input))}
      className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]"
    >
      <div className="space-y-5">
        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="font-display text-lg">Receipt branding</CardTitle>
              <CardDescription>
                These details are applied to every customer and admin receipt, including print and downloads.
              </CardDescription>
            </div>
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-accent-200">
              <ReceiptText className="h-4 w-4" aria-hidden="true" />
            </span>
          </CardHeader>
          <CardContent className="space-y-5">
            {settingsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading receipt settings…</p>
            ) : null}

            <Controller
              control={control}
              name="storeName"
              rules={{ required: "Store name is required" }}
              render={({ field, fieldState }) => (
                <FormField
                  label="Store name"
                  htmlFor="receipt-store-name"
                  required
                  error={fieldState.error?.message}
                  hint="Printed as the receipt headline."
                >
                  <Input id="receipt-store-name" placeholder="Your store name" disabled={mutation.isPending} {...field} />
                </FormField>
              )}
            />

            <Controller
              control={control}
              name="tagline"
              render={({ field }) => (
                <FormField label="Tagline" htmlFor="receipt-tagline" hint="Optional line beneath the store name.">
                  <Input id="receipt-tagline" placeholder="Quality you can trust" disabled={mutation.isPending} {...field} value={field.value ?? ""} />
                </FormField>
              )}
            />

            <Controller
              control={control}
              name="footerNote"
              render={({ field }) => (
                <FormField label="Footer note" htmlFor="receipt-footer" hint="Appears at the bottom of the receipt.">
                  <Textarea
                    id="receipt-footer"
                    rows={3}
                    placeholder="Thank you for shopping with us."
                    disabled={mutation.isPending}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormField>
              )}
            />

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="contactPhone"
                render={({ field }) => (
                  <FormField label="Contact phone" htmlFor="receipt-phone">
                    <Input id="receipt-phone" placeholder="+880 1XXX XXX XXX" disabled={mutation.isPending} {...field} value={field.value ?? ""} />
                  </FormField>
                )}
              />
              <Controller
                control={control}
                name="contactEmail"
                render={({ field }) => (
                  <FormField label="Contact email" htmlFor="receipt-email">
                    <Input id="receipt-email" type="email" placeholder="hello@example.com" disabled={mutation.isPending} {...field} value={field.value ?? ""} />
                  </FormField>
                )}
              />
            </div>

            <Controller
              control={control}
              name="contactAddress"
              render={({ field }) => (
                <FormField label="Contact address" htmlFor="receipt-address">
                  <Input id="receipt-address" placeholder="Shop address" disabled={mutation.isPending} {...field} value={field.value ?? ""} />
                </FormField>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Receipt details</CardTitle>
            <CardDescription>Choose which order details appear on the printed document.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {TOGGLES.map((toggle) => (
              <Controller
                key={toggle.name}
                control={control}
                name={toggle.name}
                render={({ field }) => (
                  <label
                    htmlFor={`receipt-${toggle.name}`}
                    className="flex cursor-pointer items-start justify-between gap-4 rounded-none border border-border p-3"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{toggle.label}</span>
                      <span className="mt-0.5 block break-words text-[11px] text-muted-foreground">
                        {toggle.description}
                      </span>
                    </span>
                    <Switch
                      id={`receipt-${toggle.name}`}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={mutation.isPending}
                    />
                  </label>
                )}
              />
            ))}
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
            <Button type="button" variant="ghost" size="sm" onClick={discard} disabled={mutation.isPending || (!isDirty && !logoFile && !logoCleared)}>
              Discard
            </Button>
            <Button type="submit" size="sm" loading={mutation.isPending} disabled={mutation.isPending}>
              Save receipt settings
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Logo</CardTitle>
            <CardDescription>Uploaded images are saved to the same store used by banners.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploadField
              id="receipt-logo"
              label="Receipt logo"
              description="A wide or square transparent PNG works best."
              value={logoCleared ? null : values.logoUrl}
              file={logoFile}
              onFileChange={(file) => {
                setLogoFile(file);
                setLogoCleared(false);
              }}
              onClearExisting={() => {
                setLogoFile(null);
                setLogoCleared(true);
                setValue("logoUrl", null, { shouldDirty: true });
              }}
              aspect="wide"
              disabled={mutation.isPending}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Live preview</CardTitle>
            <CardDescription>
              {settingsQuery.data?.updatedAt
                ? `Last saved ${formatDate(settingsQuery.data.updatedAt, "long")}`
                : "Save to publish these details to all receipts."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-none border border-border bg-[var(--background)] p-5">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div className="min-w-0">
                  {values.showLogo && previewLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewLogo} alt="" className="mb-3 max-h-14 max-w-40 object-contain" />
                  ) : null}
                  <p className="break-words font-display text-base font-bold uppercase tracking-wide">
                    {values.storeName || "Your store name"}
                  </p>
                  {values.tagline ? <p className="break-words text-[11px] italic text-muted-foreground">{values.tagline}</p> : null}
                  <p className="break-words text-[11px] text-muted-foreground">
                    {[values.contactAddress, values.contactPhone, values.contactEmail].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Badge tone="neutral">RECEIPT</Badge>
              </div>
              {values.showCustomer ? (
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Customer</p>
                  <p className="text-xs font-semibold">A customer</p>
                </div>
              ) : null}
              <div className="mt-4 space-y-1.5 text-xs">
                <p className="break-words font-semibold">Example product</p>
                {values.showSize || values.showColor ? (
                  <p className="break-words text-[10px] text-muted-foreground">
                    {[values.showSize ? "Size: M" : null, values.showColor ? "Color: Black" : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
                {values.showPaymentMethod ? (
                  <p className="text-[10px] text-muted-foreground">Payment method: Cash on delivery</p>
                ) : null}
                {values.showTransactionId ? (
                  <p className="text-[10px] text-muted-foreground">Transaction ID: COD-EXAMPLE</p>
                ) : null}
              </div>
              <p className="mt-5 break-words border-t border-border pt-3 text-[11px] italic text-muted-foreground">
                {values.footerNote || "Thank you for shopping with us."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
