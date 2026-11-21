"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Store } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ImageUploadField } from "@/components/admin/shared/image-upload-field";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
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
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { settingsApi } from "@/lib/api/services";
import { relatedKeys } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/utils";

interface StoreFormValues {
  siteName: string;
}

const SITE_NAME_VALIDATION = {
  required: "Site name is required",
  maxLength: { value: 120, message: "Use at most 120 characters" },
  validate: (value: string) => value.trim().length > 0 || "Site name is required",
} as const;

export function StoreLogoForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { settings, setSettings } = useSiteSettings();
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoCleared, setLogoCleared] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<StoreFormValues>({
    defaultValues: { siteName: settings.siteName ?? "" },
  });

  const siteNamePreview = watch("siteName");

  React.useEffect(() => {
    if (!logoFile) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  React.useEffect(() => {
    reset({ siteName: settings.siteName ?? "" });
  }, [settings.siteName, reset]);

  const onSubmit = async (values: StoreFormValues) => {
    if (busy) return;
    setBusy(true);
    try {
      const siteName = values.siteName.trim();
      const updated = await settingsApi.update({
        siteName,
        ...(logoFile
          ? { logo: logoFile }
          : logoCleared && settings.navbarLogoUrl
            ? { navbarLogoUrl: null }
            : {}),
      });

      // Sync every consumer immediately: the site-settings provider (used by
      // the global Brand), the shared query cache, and the server tree.
      setSettings(updated);
      queryClient.setQueryData(["settings"], updated);
      invalidateKeys(queryClient, relatedKeys("settings"));
      setLogoFile(null);
      setLogoCleared(false);
      reset({ siteName: updated.siteName });
      router.refresh();
      toast.success("Store settings saved");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save store settings"));
    } finally {
      setBusy(false);
    }
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoCleared(Boolean(settings.navbarLogoUrl));
  };

  const chooseLogo = (file: File | null) => {
    setLogoCleared(false);
    setLogoFile(file);
  };

  const hasLogo = !logoCleared && (Boolean(settings.navbarLogoUrl) || Boolean(logoFile));
  const savedLogo = logoCleared ? null : (settings.navbarLogoUrl ?? null);
  const liveLogo = logoCleared ? null : (filePreview ?? savedLogo);
  const liveName = siteNamePreview?.trim() || settings.siteName || "Your store";

  return (
    <form
      id="super-admin-store-logo-form"
      onSubmit={handleSubmit(onSubmit)}
      className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      noValidate
    >
      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-display text-lg">Store identity</CardTitle>
            <CardDescription>
              The site name appears in the header, page titles and storefront messaging.
            </CardDescription>
          </div>
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-accent-200">
            <Store className="h-4 w-4" aria-hidden="true" />
          </span>
        </CardHeader>
        <CardContent className="space-y-5">
          <FormField
            label="Site name"
            htmlFor="super-admin-site-name"
            required
            error={errors.siteName?.message}
            hint="Shown anywhere the brand does not use a logo."
          >
            <Input
              id="super-admin-site-name"
              placeholder="Your store name"
              invalid={Boolean(errors.siteName)}
              disabled={busy}
              {...register("siteName", SITE_NAME_VALIDATION)}
            />
          </FormField>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Live preview
            </p>
            <div className="overflow-hidden rounded-none border border-border bg-[var(--background)]">
              <div className="flex h-16 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  {liveLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={liveLogo} alt="" className="h-9 w-9 rounded-none object-contain" />
                  ) : (
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-primary-700 text-xs font-bold text-white dark:bg-accent-300 dark:text-primary-950">
                      {liveName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="truncate font-display text-sm font-semibold">{liveName}</span>
                </div>
                <div className="hidden items-center gap-3 text-[11px] font-medium text-muted-foreground sm:flex">
                  <span>Shop</span>
                  <span>Collections</span>
                  <span>About</span>
                </div>
                <Badge tone={hasLogo ? "success" : "neutral"}>
                  {hasLogo ? "Logo active" : "Text mark"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-5 sm:px-5">
                <div className="space-y-1.5">
                  <div className="h-2.5 w-32 rounded-none bg-muted" />
                  <div className="h-2.5 w-48 rounded-none bg-muted/70" />
                  <div className="h-2.5 w-24 rounded-none bg-muted/50" />
                </div>
                <span className="rounded-none border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
                  Storefront
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end border-t border-border pt-5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy || (!isDirty && !logoFile && !logoCleared)}
            onClick={() => {
              setLogoFile(null);
              setLogoCleared(false);
              reset({ siteName: settings.siteName ?? "" });
            }}
          >
            Discard
          </Button>
          <Button type="submit" size="sm" loading={busy} disabled={busy}>
            Save store settings
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Navbar logo</CardTitle>
          <CardDescription>
            Upload a logo to replace the text mark across the navbar, footer and dashboard shell.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUploadField
            id="super-admin-navbar-logo"
            label="Logo"
            description="Square image recommended. Uploaded with the site name when you save."
            value={savedLogo}
            file={logoFile}
            onFileChange={chooseLogo}
            onClearExisting={clearLogo}
            aspect="square"
            disabled={busy}
          />
          <Separator />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {logoCleared
                ? "The logo will be removed when you save."
                : hasLogo
                  ? "The new logo appears everywhere as soon as settings are saved."
                  : "No logo saved — the site name is shown instead."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearLogo}
              disabled={busy || !hasLogo}
            >
              Remove logo
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
