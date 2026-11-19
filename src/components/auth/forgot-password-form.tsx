"use client";

import * as React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import { SITE } from "@/lib/constants";

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [prepared, setPrepared] = React.useState(false);

  const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent(
    "Password reset request",
  )}&body=${encodeURIComponent(
    `Please help me reset the password for my account${
      email ? ` (${email})` : ""
    }.`,
  )}`;

  return (
    <div>
      <div className="rounded-xl border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">How resets work</p>
        <p className="mt-1">
          Automated reset emails are not enabled for this store. For your
          security, a support agent verifies account ownership and issues a
          one-time reset from the store dashboard.
        </p>
      </div>

      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setPrepared(true);
        }}
      >
        <FormField
          label="Account email"
          htmlFor="forgot-email"
          hint="Optional — it helps support locate your account faster."
        >
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>

        <Button type="submit" size="lg" className="w-full">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Prepare support request
        </Button>
      </form>

      {prepared ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/25 dark:bg-emerald-500/10">
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
            Your request is ready to send
          </p>
          <p className="mt-1 text-xs leading-relaxed text-emerald-800/80 dark:text-emerald-200/80">
            We do not send an automated email. Use the button below to open your
            mail app with the request filled in, or write to{" "}
            <a href={`mailto:${SITE.email}`} className="font-semibold underline">
              {SITE.email}
            </a>
            .
          </p>
          <Button asChild size="sm" className="mt-3">
            <a href={mailto}>Open email request</a>
          </Button>
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between text-xs font-semibold">
        <Link href="/login" className="text-primary-600 hover:underline dark:text-accent-300">
          Back to sign in
        </Link>
        <Link href="/register" className="text-muted-foreground hover:text-foreground">
          Create an account
        </Link>
      </div>
    </div>
  );
}
