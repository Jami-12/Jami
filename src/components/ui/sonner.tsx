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
            "!rounded-2xl !border !border-[var(--border)] !bg-[var(--card)]/95 !text-[var(--card-foreground)] !shadow-[var(--shadow-lift)] !backdrop-blur-xl",
          title: "!text-sm !font-semibold !tracking-tight !text-[var(--foreground)]",
          description: "!text-xs !leading-relaxed !text-[var(--muted-foreground)]",
          closeButton:
            "!border-[var(--border)] !bg-[var(--card)] !text-[var(--muted-foreground)] hover:!text-[var(--foreground)] focus-visible:!ring-2 focus-visible:!ring-[var(--ring)]",
          actionButton:
            "!rounded-full !bg-[var(--primary)] !text-[var(--primary-foreground)] !font-semibold",
          cancelButton:
            "!rounded-full !bg-[var(--muted)] !text-[var(--foreground)] !font-semibold",
          success:
            "!border-[var(--success)]/30 !bg-[var(--card)] !text-[var(--foreground)]",
          info: "!border-[var(--info)]/30 !bg-[var(--card)] !text-[var(--foreground)]",
          warning:
            "!border-[var(--warning)]/30 !bg-[var(--card)] !text-[var(--foreground)]",
          error:
            "!border-[var(--danger)]/30 !bg-[var(--card)] !text-[var(--foreground)]",
        },
      }}
    />
  );
}
