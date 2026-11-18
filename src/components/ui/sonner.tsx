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
            "!rounded-2xl !border !border-border !bg-card/95 !text-card-foreground !shadow-[0_28px_60px_-32px_rgba(23,43,58,0.6)] !backdrop-blur-xl",
          title: "!text-sm !font-semibold !tracking-tight",
          description: "!text-xs !leading-relaxed !text-muted-foreground",
          closeButton:
            "!border-border !bg-card !text-muted-foreground hover:!text-foreground",
          actionButton:
            "!rounded-full !bg-primary !text-primary-foreground !font-semibold dark:!bg-accent-300 dark:!text-[#172B3A]",
          cancelButton: "!rounded-full !bg-muted !text-foreground !font-semibold",
        },
      }}
    />
  );
}
