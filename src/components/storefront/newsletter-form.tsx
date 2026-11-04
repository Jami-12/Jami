"use client";

import * as React from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import { newsletterSchema } from "@/lib/validations";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">(
    "idle",
  );
  const [error, setError] = React.useState<string | undefined>();
  const id = React.useId();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email");
      return;
    }
    setError(undefined);
    setStatus("loading");
    window.setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 650);
  };

  if (status === "success") {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-3">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
          You&apos;re on the list. Look out for studio notes on Sunday.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor={`${id}-email`} className="text-xs font-semibold text-muted-foreground">
        Email address
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id={`${id}-email`}
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(undefined);
          }}
          placeholder="you@studio.com"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="email"
          className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-card px-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-ring/25 aria-[invalid=true]:border-red-500"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:bg-primary-800 disabled:opacity-60"
          aria-label="Subscribe to the newsletter"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          One thoughtful email every other Sunday. Unsubscribe anytime.
        </p>
      )}
    </form>
  );
}
