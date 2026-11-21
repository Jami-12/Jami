import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "destructive"
  | "subtle"
  | "link";

/** `default`, `icon-xs` and `icon-sm` are kept for newer shadcn registry parts. */
export type ButtonSize =
  | "sm"
  | "default"
  | "md"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";

const base =
 "inline-flex shrink-0 items-center justify-center gap-2 rounded-none border border-transparent font-semibold whitespace-nowrap transition-[color,background-color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";

const variants: Record<ButtonVariant, string> = {
  primary:
 "border-primary bg-primary text-primary-foreground hover:border-foreground hover:bg-background hover:text-foreground",
  default:
 "border-primary bg-primary text-primary-foreground hover:border-foreground hover:bg-background hover:text-foreground",
  secondary:
 "border-border bg-secondary text-secondary-foreground hover:border-foreground hover:bg-background hover:text-foreground",
  outline:
 "border-border bg-card text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
  ghost:
 "border-transparent bg-transparent text-[var(--muted-foreground)] hover:border-border hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
  danger:
 "border-danger/40 bg-danger-soft text-danger hover:border-danger hover:bg-danger hover:text-destructive-foreground",
  destructive:
 "border-danger/40 bg-danger-soft text-danger hover:border-danger hover:bg-danger hover:text-destructive-foreground",
  subtle:
 "border-transparent bg-[var(--muted)] text-[var(--foreground)] hover:border-foreground hover:bg-background",
  link: "rounded-none border-transparent bg-transparent px-0 text-foreground underline-offset-4 hover:no-underline hover:opacity-70",
};

const sizes: Record<ButtonSize, string> = {
 "icon-xs": "h-8 w-8 p-0",
 "icon-sm": "h-9 w-9 p-0",
 "icon-lg": "h-12 w-12 p-0",
  sm: "h-9 px-4 text-xs",
  default: "h-11 px-5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-sm sm:text-base",
  icon: "h-11 w-11 p-0",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Render the single child element (for example a `Link`) with button styles. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    loading = false,
    asChild = false,
    children,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) return null;

    const childElement = child as ReactElement<{ className?: string }>;
    return cloneElement(childElement, {
      className: cn(
        buttonVariants({ variant, size }),
        childElement.props.className,
        className,
      ),
    });
  }

  return (
    <button
      ref={ref}
      type={type}
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-none border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
});
