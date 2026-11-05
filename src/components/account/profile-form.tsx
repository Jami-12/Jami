"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ImageIcon, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import { PageSection } from "@/components/dashboard/page-section";
import { Skeleton } from "@/components/ui/skeleton";
import { usersApi } from "@/lib/api/services";
import { getErrorMessage, humanizeEnum } from "@/lib/utils";
import { profileSchema, type ProfileValues } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth-store";

export function ProfileForm() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const profile = useQuery({
    queryKey: ["users", "me"],
    queryFn: usersApi.me,
    staleTime: 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      image: user?.image ?? "",
    },
  });

  React.useEffect(() => {
    if (!profile.data && !user) return;
    const source = profile.data ?? user;
    reset({
      name: source?.name ?? "",
      phone: source?.phone ?? "",
      image: source?.image ?? "",
    });
  }, [profile.data, user, reset]);

  const image = watch("image");

  const mutation = useMutation({
    mutationFn: (values: ProfileValues) =>
      usersApi.updateMe({
        name: values.name,
        phone: values.phone?.trim() ? values.phone.trim() : null,
        image: values.image?.trim() ? values.image.trim() : null,
      }),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update your profile")),
  });

  return (
    <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <PageSection
        title="Personal details"
        description="These details appear on receipts and delivery updates."
      >
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <div className="flex items-center gap-4">
            <Avatar name={watch("name") || user?.name || "Account"} size="lg" />
            <div>
              <p className="text-sm font-bold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <FormField label="Full name" htmlFor="profile-name" required error={errors.name?.message}>
            <Input
              id="profile-name"
              autoComplete="name"
              invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </FormField>

          <FormField label="Phone" htmlFor="profile-phone" error={errors.phone?.message}>
            <Input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+880 1XXX XXXXXX"
              invalid={Boolean(errors.phone)}
              {...register("phone")}
            />
          </FormField>

          <FormField
            label="Profile image URL"
            htmlFor="profile-image"
            hint="Paste a public image URL. Leave blank to use your initials."
            error={errors.image?.message}
          >
            <Input
              id="profile-image"
              type="url"
              placeholder="https://…"
              invalid={Boolean(errors.image)}
              {...register("image")}
            />
          </FormField>

          {image ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
              <ImageIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="truncate text-xs text-muted-foreground">{image}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!isDirty || mutation.isPending}
              onClick={() =>
                reset({
                  name: user?.name ?? "",
                  phone: user?.phone ?? "",
                  image: user?.image ?? "",
                })
              }
            >
              Reset
            </Button>
            <Button type="submit" size="sm" loading={mutation.isPending} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </form>
      </PageSection>

      <PageSection title="Account" description="Sign-in method and account status.">
        {profile.isLoading && !profile.data ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <dl className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-0.5 font-semibold">{profile.data?.email ?? user?.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Phone
                </dt>
                <dd className="mt-0.5 font-semibold">{profile.data?.phone ?? "Not set"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Sign-in method
                </dt>
                <dd className="mt-1">
                  <Badge tone="info">
                    {humanizeEnum(profile.data?.provider ?? "LOCAL")}
                  </Badge>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Account status
                </dt>
                <dd className="mt-1">
                  <Badge tone={profile.data?.isActive === false ? "danger" : "success"} dot>
                    {profile.data?.isActive === false ? "Inactive" : "Active"}
                  </Badge>
                </dd>
              </div>
            </div>
            {typeof profile.data?.orderCount === "number" ? (
              <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                {profile.data.orderCount} lifetime order
                {profile.data.orderCount === 1 ? "" : "s"} on this account.
              </p>
            ) : null}
          </dl>
        )}
      </PageSection>
    </div>
  );
}
