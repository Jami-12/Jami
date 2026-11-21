"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ImageUploadField } from "@/components/admin/shared/image-upload-field";
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
import { Skeleton } from "@/components/ui/skeleton";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { uploadsApi, usersApi } from "@/lib/api/services";
import { formResolver } from "@/lib/form-resolver";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/utils";
import { profileSchema, type ProfileValues } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth-store";

export function ProfileSettingsForm() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [existingImage, setExistingImage] = React.useState<string | null>(user?.image ?? null);

  const profile = useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: usersApi.me,
    staleTime: 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: formResolver<ProfileValues>(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      image: user?.image ?? "",
    },
  });

  React.useEffect(() => {
    const source = profile.data ?? user;
    if (!source) return;
    reset({
      name: source.name,
      phone: source.phone ?? "",
      image: source.image ?? "",
    });
    setExistingImage(source.image ?? null);
  }, [profile.data, user, reset]);

  const onSubmit = async (values: ProfileValues) => {
    try {
      const uploaded = avatarFile ? await uploadsApi.uploadImage(avatarFile, "avatar") : null;
      const updated = await usersApi.updateMe({
        name: values.name.trim(),
        phone: values.phone?.trim() || null,
        image: uploaded?.url ?? existingImage ?? null,
      });

      setUser(updated);
      queryClient.setQueryData(queryKeys.users.me(), updated);
      invalidateKeys(queryClient, relatedKeys("users"));
      setExistingImage(updated.image ?? null);
      setAvatarFile(null);
      reset({
        name: updated.name,
        phone: updated.phone ?? "",
        image: updated.image ?? "",
      });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update your profile"));
    }
  };

  const profileSource = profile.data ?? user;

  if (profile.isLoading && !user) {
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-80 w-full rounded-none" />
        <Skeleton className="h-80 w-full rounded-none" />
      </div>
    );
  }

  return (
    <form
      id="super-admin-profile-form"
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]"
      noValidate
    >
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>
            The name and contact number used on receipts and account activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Full name"
            htmlFor="super-admin-profile-name"
            required
            error={errors.name?.message}
            className="sm:col-span-2"
          >
            <Input
              id="super-admin-profile-name"
              autoComplete="name"
              invalid={Boolean(errors.name)}
              disabled={isSubmitting}
              {...register("name")}
            />
          </FormField>
          <FormField
            label="Phone"
            htmlFor="super-admin-profile-phone"
            hint="Optional — leave blank to remove your number."
            error={errors.phone?.message}
            className="sm:col-span-2"
          >
            <Input
              id="super-admin-profile-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+880 1XXX XXXXXX"
              invalid={Boolean(errors.phone)}
              disabled={isSubmitting}
              {...register("phone")}
            />
          </FormField>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end border-t border-border pt-5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isSubmitting || (!isDirty && !avatarFile)}
            onClick={() => {
              setAvatarFile(null);
              reset({
                name: profileSource?.name ?? "",
                phone: profileSource?.phone ?? "",
                image: profileSource?.image ?? "",
              });
            }}
          >
            Reset
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting} disabled={isSubmitting}>
            Save profile
          </Button>
        </CardFooter>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
          <CardDescription>
            A square image works best. The new photo uploads when you save.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploadField
            id="super-admin-profile-avatar"
            label="Avatar"
            description="JPEG, PNG or WebP. Replaces the image on your account."
            value={existingImage}
            file={avatarFile}
            onFileChange={setAvatarFile}
            onClearExisting={() => setExistingImage(null)}
            aspect="square"
            disabled={isSubmitting}
          />
        </CardContent>
      </Card>
    </form>
  );
}
