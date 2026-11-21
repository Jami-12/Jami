"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/components/providers/theme-provider";

/**
 * Shadcn-styled Sonner toaster. Kept as a thin wrapper so any screen can mount
 * a toaster without repeating the design tokens.
 */
export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      position="top-center"
      theme={theme}
      richColors
      closeButton
      gap={10}
      offset={18}
      visibleToasts={3}
      toastOptions={{
        duration: 4200,
        classNames: {
          toast:
 "!rounded-none !border !border-[var(--border)] !bg-[var(--card)] !shadow-[var(--shadow-soft)]",
          title: "!text-sm !font-semibold !tracking-tight",
          description: "!text-xs !leading-relaxed !opacity-80",
          closeButton:
 "!border-[var(--border)] !bg-[var(--card)] !text-[var(--muted-foreground)] hover:!text-[var(--foreground)] focus-visible:!ring-2 focus-visible:!ring-[var(--ring)]",
          actionButton:
 "!rounded-none !bg-[var(--primary)] !text-[var(--primary-foreground)] !font-semibold",
          cancelButton:
 "!rounded-none !bg-[var(--muted)] !text-[var(--foreground)] !font-semibold",
          success:
 "!border-success/30 !bg-success-soft !text-success",
          info: "!border-info/30 !bg-info-soft !text-info",
          warning:
 "!border-warning/30 !bg-warning-soft !text-warning",
          error:
 "!border-danger/30 !bg-danger-soft !text-danger",
        },
      }}
    />
  );
}
