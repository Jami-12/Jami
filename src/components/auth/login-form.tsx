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
import { FormField, Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/services";
import { adoptGuestState } from "@/lib/auth-client";
import { roleHome, safeNextPath } from "@/lib/auth-routing";
import { getErrorMessage } from "@/lib/utils";
import { loginSchema, type LoginValues } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth-store";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: LoginValues) =>
      authApi.login({ email: values.email, password: values.password }),
    onSuccess: (result) => {
      setSession(result);
      void adoptGuestState();
      toast.success(`Welcome back, ${result.user.name.split(" ")[0]}`);
      router.replace(safeNextPath(next, roleHome(result.user.role)));
      router.refresh();
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Could not sign you in");
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

        <FormField label="Email" htmlFor="login-email" required error={errors.email?.message}>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </FormField>

        <div>
          <FormField label="Password" htmlFor="login-password" required error={errors.password?.message}>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-primary-600 hover:underline dark:text-accent-300"
          >
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
          Sign in
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

      <GoogleAuthButton />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="font-semibold text-primary-600 hover:underline dark:text-accent-300"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
