"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  KeyRound,
  Mail,
  RotateCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormField,
  Input,
} from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authApi } from "@/lib/api/services";
import {
  forgotPasswordEmailSchema,
  resetPasswordSchema,
  verificationCodeSchema,
  VERIFICATION_CODE_LENGTH,
} from "@/lib/validations";
import { getErrorMessage } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;
type Busy = "send" | "verify" | "reset" | null;

const STEPS = ["Email", "Verify", "Password"] as const;
const RESEND_SECONDS = 60;

function firstIssue(error: { issues: Array<{ message?: string }> }, fallback: string) {
  return error.issues[0]?.message ?? fallback;
}

export function ForgotPasswordForm() {
  const router = useRouter();

  const [step, setStep] = React.useState<Step>(1);
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [resetToken, setResetToken] = React.useState("");
  const [busy, setBusy] = React.useState<Busy>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [resendIn, setResendIn] = React.useState(0);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  React.useEffect(() => {
    if (step !== 4) return;
    const timer = window.setTimeout(() => router.replace("/login?reset=success"), 1400);
    return () => window.clearTimeout(timer);
  }, [step, router]);

  const startResend = React.useCallback(() => setResendIn(RESEND_SECONDS), []);

  const sendCode = React.useCallback(
    async (address: string) => {
      setError(null);
      setBusy("send");
      try {
        await authApi.sendPasswordResetCode({ email: address });
        toast.success("Verification code sent", {
          description: `Check ${address} for your 6-digit code.`,
        });
        setCode("");
        setStep(2);
        startResend();
      } catch (caught) {
        const message = getErrorMessage(caught, "Could not send the verification code");
        setError(message);
        toast.error(message);
      } finally {
        setBusy(null);
      }
    },
    [startResend],
  );

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = forgotPasswordEmailSchema.safeParse({ email });
    if (!parsed.success) {
      const message = firstIssue(parsed.error, "Enter a valid email address");
      setError(message);
      toast.error(message);
      return;
    }
    setEmail(parsed.data.email);
    await sendCode(parsed.data.email);
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = verificationCodeSchema.safeParse({ code });
    if (!parsed.success) {
      const message = firstIssue(parsed.error, "Enter the 6-digit code");
      setError(message);
      toast.error(message);
      return;
    }

    setError(null);
    setBusy("verify");
    try {
      const result = await authApi.verifyPasswordResetCode({
        email,
        code: parsed.data.code,
      });
      setResetToken(result.resetToken);
      toast.success("Code verified", { description: "Choose a new password to continue." });
      setStep(3);
    } catch (caught) {
      const message = getErrorMessage(caught, "Could not verify the code");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(null);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || busy) return;
    await sendCode(email);
  };

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = resetPasswordSchema.safeParse({ newPassword, confirmPassword });
    if (!parsed.success) {
      const message = firstIssue(parsed.error, "Check your new password");
      setError(message);
      toast.error(message);
      return;
    }
    if (!resetToken) {
      const message = "Your verification session expired. Please request a new code.";
      setError(message);
      toast.error(message);
      setStep(1);
      return;
    }

    setError(null);
    setBusy("reset");
    try {
      await authApi.resetPassword({
        resetToken,
        newPassword: parsed.data.newPassword,
      });
      toast.success("Password reset successfully", {
        description: "Sign in with your new password.",
      });
      setStep(4);
    } catch (caught) {
      const message = getErrorMessage(caught, "Could not reset your password");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" aria-label="Reset progress">
        {STEPS.map((label, index) => {
          const position = (index + 1) as Step;
          const done = step > position;
          const active = step === position;
          return (
            <React.Fragment key={label}>
              <Badge
                tone={done ? "success" : active ? "info" : "neutral"}
                className={active || done ? "" : "opacity-70"}
              >
                <span className="inline-flex h-4 w-4 items-center justify-center border border-current text-[9px]">
                  {done ? <Check className="h-3 w-3" aria-hidden="true" /> : index + 1}
                </span>
                {label}
              </Badge>
              {index < STEPS.length - 1 ? (
                <span className="h-px w-4 bg-border sm:w-6" aria-hidden="true" />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 border border-danger/25 bg-danger-soft p-3 text-xs leading-relaxed text-danger"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {step === 1 ? (
        <form className="mt-6 space-y-4" onSubmit={handleEmailSubmit}>
          <div className="border border-border bg-muted/40 p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Mail className="h-4 w-4 text-info" aria-hidden="true" />
              Account email
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              We will send a one-time verification code to this address.
            </p>
          </div>

          <FormField label="Email address" htmlFor="forgot-email" required>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              invalid={Boolean(error && error.includes("email"))}
            />
          </FormField>

          <Button type="submit" size="lg" className="w-full" loading={busy === "send"}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            Send Verification Code
          </Button>
        </form>
      ) : null}

      {step === 2 ? (
        <form className="mt-6 space-y-4" onSubmit={handleVerify}>
          <div className="border border-border bg-muted/40 p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-info" aria-hidden="true" />
              Check your inbox
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Enter the 6-digit code sent to <span className="font-semibold text-foreground">{email}</span>.
              Codes expire after 10 minutes.
            </p>
          </div>

          <FormField
            label="Verification code"
            htmlFor="forgot-code"
            hint="The code must be exactly 6 digits."
            required
          >
            <InputOTP
              id="forgot-code"
              maxLength={VERIFICATION_CODE_LENGTH}
              value={code}
              onChange={(value) => {
                setCode(value.replace(/\D/g, "").slice(0, VERIFICATION_CODE_LENGTH));
                setError(null);
              }}
              containerClassName="justify-center sm:justify-start"
            >
              <InputOTPGroup className="gap-2">
                {Array.from({ length: VERIFICATION_CODE_LENGTH }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="h-11 w-10 border border-[var(--border)] bg-[var(--card)] text-base shadow-none"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </FormField>

          <Button type="submit" size="lg" className="w-full" loading={busy === "verify"}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Verify Code
          </Button>

          <div className="flex items-center justify-between gap-3 text-xs">
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => {
                setStep(1);
                setError(null);
              }}
              disabled={Boolean(busy)}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Change email
            </Button>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={handleResend}
              disabled={resendIn > 0 || Boolean(busy)}
            >
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </Button>
          </div>
        </form>
      ) : null}

      {step === 3 ? (
        <form className="mt-6 space-y-4" onSubmit={handleReset}>
          <div className="border border-border bg-muted/40 p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-foreground">
              <KeyRound className="h-4 w-4 text-info" aria-hidden="true" />
              New password
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Use at least 8 characters with one letter and one number.
            </p>
          </div>

          <FormField label="New password" htmlFor="forgot-new-password" required>
            <Input
              id="forgot-new-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </FormField>

          <FormField label="Confirm password" htmlFor="forgot-confirm-password" required>
            <Input
              id="forgot-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </FormField>

          <Button type="submit" size="lg" className="w-full" loading={busy === "reset"}>
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Reset Password
          </Button>

          <div className="flex justify-start">
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => {
                setStep(2);
                setError(null);
              }}
              disabled={Boolean(busy)}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to code
            </Button>
          </div>
        </form>
      ) : null}

      {step === 4 ? (
        <div className="mt-6 border border-success/25 bg-success-soft p-5 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-success" aria-hidden="true" />
          <p className="mt-3 text-sm font-bold text-success">Password reset complete</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Redirecting you to sign in…
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/login?reset=success">Go to login</Link>
          </Button>
        </div>
      ) : null}

      {step !== 4 ? (
        <div className="mt-6 flex items-center justify-between text-xs font-semibold">
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
          <Link href="/register" className="text-muted-foreground hover:text-foreground">
            Create an account
          </Link>
        </div>
      ) : null}
    </div>
  );
}
