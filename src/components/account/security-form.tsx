"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageSection } from "@/components/dashboard/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { FormField, Input } from "@/components/ui/input";
import { authApi, usersApi } from "@/lib/api/services";
import { getErrorMessage } from "@/lib/utils";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validations";

export function SecurityForm() {
  const [show, setShow] = React.useState(false);
  const [pendingValues, setPendingValues] = React.useState<ChangePasswordValues | null>(null);

  const profile = useQuery({
    queryKey: ["users", "me"],
    queryFn: usersApi.me,
    staleTime: 60_000,
  });

  const googleOnly = profile.data?.provider === "GOOGLE";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordValues) =>
      authApi.changePassword({
        currentPassword: values.currentPassword?.trim() || undefined,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      toast.success("Password updated. Use it next time you sign in.");
      reset();
      setPendingValues(null);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update your password")),
  });

  const confirmChange = () => {
    if (!pendingValues) return;
    mutation.mutate(pendingValues);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <PageSection
        title={googleOnly ? "Set a password" : "Change password"}
        description={
          googleOnly
            ? "Add a password so you can also sign in with your email address."
            : "Choose a strong password you do not use anywhere else."
        }
      >
        <form
          onSubmit={handleSubmit((values) => setPendingValues(values))}
          className="max-w-md space-y-4"
          noValidate
        >
          {!googleOnly ? (
            <FormField
              label="Current password"
              htmlFor="security-current"
              required
              error={errors.currentPassword?.message}
            >
              <div className="relative">
                <Input
                  id="security-current"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-11"
                  invalid={Boolean(errors.currentPassword)}
                  {...register("currentPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShow((value) => !value)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>
          ) : null}

          <FormField
            label="New password"
            htmlFor="security-new"
            required
            hint="At least 8 characters with a letter and a number."
            error={errors.newPassword?.message}
          >
            <Input
              id="security-new"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              invalid={Boolean(errors.newPassword)}
              {...register("newPassword")}
            />
          </FormField>

          <FormField
            label="Confirm new password"
            htmlFor="security-confirm"
            required
            error={errors.confirmPassword?.message}
          >
            <Input
              id="security-confirm"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
          </FormField>

          <Button type="submit" size="sm" loading={mutation.isPending}>
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            {googleOnly ? "Set password" : "Update password"}
          </Button>
        </form>
      </PageSection>

      <PageSection title="Account security" description="How your account is protected.">
        <ul className="space-y-4 text-sm">
          <li className="flex items-start gap-3">
            <Lock className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-semibold">Sign-in method</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {googleOnly
                  ? "Google sign-in is connected. Adding a password enables email sign-in too."
                  : "Email and password sign-in is enabled."}
              </p>
              <div className="mt-1.5">
                <Badge tone="info">{googleOnly ? "Google" : "Email & password"}</Badge>
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-semibold">Session security</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Sessions refresh automatically. Signing out on this device removes
                your stored tokens immediately.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <KeyRound className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-semibold">Forgot your password?</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Self-service reset is not available yet. Contact support and the
                team will verify your identity before restoring access.
              </p>
            </div>
          </li>
        </ul>
      </PageSection>

      <ConfirmDialog
        open={Boolean(pendingValues)}
        onClose={() => setPendingValues(null)}
        onConfirm={confirmChange}
        title={googleOnly ? "Set a password?" : "Change your password?"}
        description={
          googleOnly
            ? "You will be able to sign in with your email address and this password."
            : "Make sure your new password is saved somewhere secure. You will use it next time you sign in."
        }
        confirmLabel={googleOnly ? "Set password" : "Update password"}
        loading={mutation.isPending}
      />
    </div>
  );
}
