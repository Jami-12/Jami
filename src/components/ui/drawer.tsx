"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useFocusTrap } from "@/hooks/use-focus-trap";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "right" | "left";
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "right",
  className,
}: DrawerProps) {
  const [mounted, setMounted] = React.useState(false);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const panelRef = useFocusTrap<HTMLDivElement>(open && mounted, onClose);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60]">
          <motion.button
            type="button"
            aria-label="Close panel"
            className="absolute inset-0 bg-[var(--color-primary-950)]/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            tabIndex={-1}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            initial={{ x: side === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "right" ? "100%" : "-100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute inset-y-0 flex w-full max-w-[27rem] flex-col border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-[var(--shadow-lift)]",
              side === "right" ? "right-0 border-l" : "left-0 border-r",
              className,
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
              <div className="min-w-0">
                <h2 id={titleId} className="font-display text-xl font-semibold tracking-tight">
                  {title}
                </h2>
                {description ? (
                  <p
                    id={descriptionId}
                    className="mt-0.5 text-sm text-[var(--muted-foreground)]"
                  >
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
              >
                <X className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>
            <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer ? (
              <div className="border-t border-[var(--border)] bg-[var(--muted)]/40 px-5 py-4">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
