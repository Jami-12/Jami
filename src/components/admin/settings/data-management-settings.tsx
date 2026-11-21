"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  KeyRound,
  Mail,
  RotateCw,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField, Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { settingsApi } from "@/lib/api/services";
import {
  DATA_RESET_CONFIRMATION,
  VERIFICATION_CODE_LENGTH,
  verificationCodeSchema,
} from "@/lib/validations";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type Step = "request" | "verify" | "verified";
type Busy = "request" | "verify" | "execute" | null;

const RESEND_SECONDS = 60;

function firstIssue(error: { issues: Array<{ message?: string }> }, fallback: string) {
  return error.issues[0]?.message ?? fallback;
}

/**
 * SUPER_ADMIN-only danger zone. The route is already guarded client-side and
 * on the API; this component adds the Gmail-code + typed-phrase gates.
 */
export function DataManagementSettings() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.role ?? null);
  const adminEmail = useAuthStore((state) => state.user?.email ?? null);

  const [step, setStep] = React.useState<Step>("request");
  const [code, setCode] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [verificationToken, setVerificationToken] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [busy, setBusy] = React.useState<Busy>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [resendIn, setResendIn] = React.useState(0);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const startResend = React.useCallback(() => setResendIn(RESEND_SECONDS), []);

  const requestCode = React.useCallback(async () => {
    setError(null);
    setBusy("request");
    try {
      await settingsApi.requestDataResetCode();
      toast.success("Verification code sent", {
        description: adminEmail
          ? `Check ${adminEmail} for your 6-digit code.`
          : "Check your admin email for your 6-digit code.",
      });
      setCode("");
      setVerificationToken("");
      setStep("verify");
      startResend();
    } catch (caught) {
      const message = getErrorMessage(caught, "Could not send the verification code");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(null);
    }
  }, [adminEmail, startResend]);

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
      const result = await settingsApi.verifyDataResetCode(parsed.data.code);
      setVerificationToken(result.verificationToken);
      setStep("verified");
      toast.success("Code verified", {
        description: "You can now permanently delete all store data.",
      });
    } catch (caught) {
      const message = getErrorMessage(caught, "Could not verify the code");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(null);
    }
  };

  const handleExecute = async () => {
    if (confirmation !== DATA_RESET_CONFIRMATION || !verificationToken) return;

    setBusy("execute");
    try {
      const { summary } = await settingsApi.executeDataReset({
        verificationToken,
        confirmation: DATA_RESET_CONFIRMATION,
      });
      toast.success("Store data has been reset", {
        description: `${summary.totalRecords} records removed. Accounts, audit logs and settings were preserved.`,
      });
      setConfirmOpen(false);
      setConfirmation("");
      setCode("");
      setVerificationToken("");
      setError(null);
      setStep("request");
      await queryClient.invalidateQueries();
      router.refresh();
    } catch (caught) {
      const message = getErrorMessage(caught, "Could not reset store data");
      setError(message);
      toast.error(message);
      setConfirmOpen(false);
      setVerificationToken("");
      setStep("request");
    } finally {
      setBusy(null);
    }
  };

  if (role && role !== "SUPER_ADMIN") return null;

  const confirmationValid = confirmation === DATA_RESET_CONFIRMATION;

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-warning/30">
        <CardHeader className="gap-3 border-b border-border bg-warning-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-warning/40 bg-[var(--card)] text-warning">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-warning">
                Data management
              </p>
              <CardTitle className="font-display text-base">Reset store data</CardTitle>
              <CardDescription className="max-w-xl">
                Permanently remove catalogue, orders, payments and related records. Accounts,
                audit logs and site settings are preserved.
              </CardDescription>
            </div>
          </div>
          <Badge tone={step === "verified" ? "danger" : "warning"} dot className="w-fit">
            {step === "verified" ? "Unlocked" : "Verification required"}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-5 p-4 sm:p-5">
          {error ? (
            <p
              role="alert"
              className="flex items-start gap-2 border border-danger/25 bg-danger-soft p-3 text-xs leading-relaxed text-danger"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold text-foreground">Step 1 · Confirm your Gmail</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                A 6-digit code will be sent to the email on your super admin account
                {adminEmail ? (
                  <>
                    {" "}
                    (<span className="font-semibold text-foreground">{adminEmail}</span>)
                  </>
                ) : null}
                .
              </p>
            </div>
            {step !== "verified" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={requestCode}
                loading={busy === "request"}
                disabled={resendIn > 0 || Boolean(busy)}
              >
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {resendIn > 0
                  ? `Resend in ${resendIn}s`
                  : step === "request"
                    ? "Send Verification Code to Gmail"
                    : "Resend verification code"}
              </Button>
            ) : (
              <Badge tone="success" dot className="w-fit">
                <Check className="h-3 w-3" aria-hidden="true" />
                Gmail verified
              </Badge>
            )}
          </div>

          {step === "request" ? null : (
            <form className="space-y-4 border-t border-border pt-5" onSubmit={handleVerify}>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <FormField
                  label="Verification code"
                  htmlFor="data-reset-code"
                  hint="The code expires after 10 minutes."
                  required
                >
                  <InputOTP
                    id="data-reset-code"
                    maxLength={VERIFICATION_CODE_LENGTH}
                    value={code}
                    onChange={(value) => {
                      setCode(value.replace(/\D/g, "").slice(0, VERIFICATION_CODE_LENGTH));
                      setError(null);
                    }}
                    containerClassName="justify-start"
                    disabled={step === "verified"}
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

                {step === "verify" ? (
                  <Button
                    type="submit"
                    size="sm"
                    className="w-fit"
                    loading={busy === "verify"}
                  >
                    <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                    Verify Code
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-success">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Code accepted
                    <Button
                      type="button"
                      variant="link"
                      size="icon-xs"
                      aria-label="Request a new verification code"
                      onClick={requestCode}
                      disabled={resendIn > 0 || Boolean(busy)}
                    >
                      <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>
            </form>
          )}

          {step === "verified" ? (
            <div className="flex flex-col gap-3 border border-danger/30 bg-danger-soft p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-danger">Delete All Data is unlocked</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    This action is irreversible. You will be asked to type the exact confirmation
                    phrase before anything is removed.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setConfirmOpen(true)}
                disabled={Boolean(busy)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete All Data
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-danger">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              Permanently delete all store data?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes products, categories, brands, orders, payments, coupons, reviews,
              carts and finance records. Accounts, audit logs and site settings remain.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="data-reset-confirmation" className="text-foreground">
              Type <span className="font-bold text-danger">{DATA_RESET_CONFIRMATION}</span> to confirm
            </Label>
            <Input
              id="data-reset-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={DATA_RESET_CONFIRMATION}
              autoComplete="off"
              invalid={confirmation.length > 0 && !confirmationValid}
              disabled={busy === "execute"}
            />
            {confirmation.length > 0 && !confirmationValid ? (
              <p className="text-xs font-medium text-danger" role="alert">
                Confirmation phrase does not match.
              </p>
            ) : null}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy === "execute"}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="danger"
              onClick={(event) => {
                event.preventDefault();
                void handleExecute();
              }}
              disabled={!confirmationValid || busy === "execute"}
            >
              {busy === "execute" ? "Deleting…" : "Delete All Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
