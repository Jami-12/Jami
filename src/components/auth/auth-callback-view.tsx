"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authApi } from "@/lib/api/services";
import { adoptGuestState } from "@/lib/auth-client";
import { roleHome } from "@/lib/auth-routing";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function AuthCallbackView() {
  const router = useRouter();
  const params = useSearchParams();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [error, setError] = React.useState<string | null>(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (started.current) return;
    started.current = true;

    const oauthError = params.get("error");
    if (oauthError) {
      setError(oauthError);
      return;
    }

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (!accessToken || !refreshToken) {
      setError("The sign-in callback did not include a session. Please try again.");
      return;
    }

    setTokens(accessToken, refreshToken);

    authApi
      .me()
      .then((user) => {
        setUser(user);
        void adoptGuestState();
        toast.success(`Welcome, ${user.name.split(" ")[0]}`);
        router.replace(roleHome(user.role));
        router.refresh();
      })
      .catch((callbackError: unknown) => {
        clearSession();
        setError(
          getErrorMessage(
            callbackError,
            "Google sign-in could not be completed. Please try again.",
          ),
        );
      });
  }, [params, router, setTokens, setUser, clearSession]);

  if (error) {
    return (
      <Card className="p-7 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold">Sign-in did not complete</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{error}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Continue browsing</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500 dark:text-accent-300" aria-hidden="true" />
      <h1 className="mt-4 text-lg font-extrabold">Completing sign-in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Verifying your Google session and loading your account…
      </p>
      <span className="sr-only" role="status">
        Loading
      </span>
    </Card>
  );
}
