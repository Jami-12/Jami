"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { Button } from "@/components/ui/button";
import { FieldError, FormField, Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/services";
import { adoptGuestState } from "@/lib/auth-client";
import { roleHome, safeNextPath } from "@/lib/auth-routing";
import { getErrorMessage } from "@/lib/utils";
import { registerSchema, type RegisterValues } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth-store";

export function RegisterForm({ next }: { next?: string }) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: RegisterValues) =>
      authApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      }),
    onSuccess: (result) => {
      setSession(result);
      void adoptGuestState();
      toast.success("Welcome to Aether. Your account is ready.");
      router.replace(safeNextPath(next, roleHome(result.user.role)));
      router.refresh();
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Could not create your account");
      setFormError(message);
      toast.error(message);
    },
  });

  return (
    <div>
      <form
        onSubmit={handleSubmit((values) => {
          setFormError(null);
          mutation.mutate(values);
        })}
        className="space-y-4"
        noValidate
      >
        {formError ? (
          <p className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {formError}
          </p>
        ) : null}

        <FormField label="Full name" htmlFor="register-name" required error={errors.name?.message}>
          <Input
            id="register-name"
            autoComplete="name"
            placeholder="Ayesha Rahman"
            invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </FormField>

        <FormField label="Email" htmlFor="register-email" required error={errors.email?.message}>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </FormField>

        <FormField label="Phone (optional)" htmlFor="register-phone" error={errors.phone?.message}>
          <Input
            id="register-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+880 1XXX XXXXXX"
            invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="register-password"
          required
          error={errors.password?.message}
          hint="At least 8 characters with one letter and one number."
        >
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className="pr-11"
              invalid={Boolean(errors.password)}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="register-confirm"
          required
          error={errors.confirmPassword?.message}
        >
          <Input
            id="register-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
        </FormField>

        <div>
          <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary-700 focus:ring-primary-400"
              {...register("acceptTerms")}
            />
            <span>
              I agree to the{" "}
              <Link href="/#terms" className="font-semibold text-primary-600 hover:underline dark:text-accent-300">
                terms of sale
              </Link>{" "}
              and{" "}
              <Link href="/#privacy" className="font-semibold text-primary-600 hover:underline dark:text-accent-300">
                privacy policy
              </Link>
              .
            </span>
          </label>
          <FieldError>{errors.acceptTerms?.message}</FieldError>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
          Create account
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          or
        </span>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <GoogleAuthButton label="Sign up with Google" />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-semibold text-primary-600 hover:underline dark:text-accent-300"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
