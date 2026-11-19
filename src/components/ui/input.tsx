import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-2xl border border-[var(--input)] bg-[var(--card)] px-4 text-sm text-[var(--foreground)] shadow-sm outline-none transition-[color,background-color,border-color,box-shadow] duration-200 placeholder:text-[var(--muted-foreground)] focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-[var(--muted)] disabled:opacity-60 aria-[invalid=true]:border-[var(--destructive)] aria-[invalid=true]:focus:ring-[var(--destructive)]/20";

const pillField = "rounded-full px-4";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, pillField, "h-11", className)}
      {...props}
    />
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, "py-3 leading-relaxed", className)}
      {...props}
    />
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        fieldBase,
        pillField,
        "h-11 appearance-none bg-[length:16px] pr-10",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230f766e' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
      }}
      {...props}
    >
      {children}
    </select>
  );
});

export function Label({
  className,
  children,
  htmlFor,
  required,
}: {
  className?: string;
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]",
        className,
      )}
    >
      {children}
      {required ? <span className="ml-1 text-[var(--destructive)]">*</span> : null}
    </label>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-medium text-[var(--destructive)]">{children}</p>;
}

export function FieldHint({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{children}</p>;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      <FieldError>{error}</FieldError>
      <FieldHint>{hint}</FieldHint>
    </div>
  );
}
