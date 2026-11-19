import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(function Table({ className, ...props }, ref) {
  return (
    <div className="relative w-full overflow-x-auto overscroll-x-contain">
      <table
        ref={ref}
        className={cn(
          "w-full min-w-full caption-bottom border-collapse text-sm text-[var(--foreground)]",
          className,
        )}
        {...props}
      />
    </div>
  );
});

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ className, ...props }, ref) {
  return (
    <thead
      ref={ref}
      className={cn("[&_tr]:border-b [&_tr]:border-[var(--border)]", className)}
      {...props}
    />
  );
});

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...props }, ref) {
  return (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
});

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableFooter({ className, ...props }, ref) {
  return (
    <tfoot
      ref={ref}
      className={cn(
        "border-t border-[var(--border)] bg-[var(--muted)]/60 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
});

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(function TableRow({ className, ...props }, ref) {
  return (
    <tr
      ref={ref}
      className={cn(
        "border-b border-[var(--border)] transition-colors hover:bg-[var(--muted)]/50",
        "data-[state=selected]:bg-[var(--muted)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
});

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(function TableHead({ className, ...props }, ref) {
  return (
    <th
      ref={ref}
      className={cn(
        "h-11 whitespace-nowrap px-4 text-left align-middle text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
});

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(function TableCell({ className, ...props }, ref) {
  return (
    <td
      ref={ref}
      className={cn("px-4 py-3.5 align-middle", className)}
      {...props}
    />
  );
});

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(function TableCaption({ className, ...props }, ref) {
  return (
    <caption
      ref={ref}
      className={cn("mt-4 text-sm text-[var(--muted-foreground)]", className)}
      {...props}
    />
  );
});

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
