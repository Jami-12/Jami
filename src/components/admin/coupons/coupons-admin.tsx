"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminListCard } from "@/components/admin/shared/admin-list-card";
import { AdminListHeader } from "@/components/admin/shared/admin-list-header";
import { ListPagination } from "@/components/dashboard/list-pagination";
import type { DataColumn } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { couponsApi } from "@/lib/api/services";
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";
import type { Coupon } from "@/types";

export function CouponsAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("ALL");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [deleting, setDeleting] = React.useState<Coupon | null>(null);
  const [statusPendingId, setStatusPendingId] = React.useState<string | null>(null);
  const debounced = useDebouncedValue(search, 300);

  React.useEffect(() => setPage(1), [debounced, filter, limit]);

  const query = useQuery({
    queryKey: ["admin", "coupons", { search: debounced, filter }],
    queryFn: () =>
      couponsApi.list({
        search: debounced.trim() || undefined,
        isActive: filter === "ACTIVE" ? true : filter === "INACTIVE" ? false : undefined,
      }),
    staleTime: 30_000,
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });

  const toggle = useMutation<Coupon, Error, Coupon, { previous?: Coupon[] }>({
    mutationFn: (coupon: Coupon) => couponsApi.updateStatus(coupon.id, !coupon.isActive),
    onMutate: async (coupon) => {
      setStatusPendingId(coupon.id);
      const key = ["admin", "coupons", { search: debounced, filter }] as const;
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Coupon[]>(key);
      queryClient.setQueryData<Coupon[]>(key, (current) =>
        current?.map((entry) =>
          entry.id === coupon.id ? { ...entry, isActive: !entry.isActive } : entry,
        ),
      );
      return { previous };
    },
    onSuccess: (_result, coupon) => {
      toast.success(coupon.isActive ? "Coupon disabled" : "Coupon enabled");
    },
    onError: (error, _coupon, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["admin", "coupons", { search: debounced, filter }],
          context.previous,
        );
      }
      toast.error(getErrorMessage(error, "Could not update the coupon"));
    },
    onSettled: () => {
      setStatusPendingId(null);
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => couponsApi.remove(id),
    onSuccess: () => {
      toast.success("Coupon deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not delete the coupon")),
  });

  const rows = query.data ?? [];
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(page, totalPages);
  const pagedRows = rows.slice((safePage - 1) * limit, safePage * limit);

  React.useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const columns: DataColumn<Coupon>[] = [
    {
      header: "Code",
      cell: (coupon) => (
        <div>
          <p className="font-mono text-xs font-bold">{coupon.code}</p>
          <p className="max-w-56 truncate text-[11px] text-muted-foreground">
            {coupon.description || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Discount",
      cell: (coupon) =>
        coupon.discountPercent != null ? (
          <span className="font-semibold">{coupon.discountPercent}%</span>
        ) : (
          <span className="font-semibold">{formatCurrency(coupon.discountAmount ?? 0)}</span>
        ),
    },
    {
      header: "Min spend",
      cell: (coupon) => (coupon.minimumAmount ? formatCurrency(coupon.minimumAmount) : "—"),
    },
    {
      header: "Used",
      cell: (coupon) => (
        <span className="text-xs">
          {coupon.usedCount}
          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
        </span>
      ),
    },
    {
      header: "Window",
      cell: (coupon) => (
        <span className="text-[11px] text-muted-foreground">
          {coupon.startDate ? formatDate(coupon.startDate, "short") : "Now"} →{" "}
          {coupon.endDate ? formatDate(coupon.endDate, "short") : "Open"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (coupon) => (
        <div className="flex items-center gap-2.5">
          <Switch
            checked={coupon.isActive}
            loading={statusPendingId === coupon.id}
            onCheckedChange={() => toggle.mutate(coupon)}
            aria-label={coupon.isActive ? `Disable ${coupon.code}` : `Enable ${coupon.code}`}
          />
          <Badge tone={coupon.isActive ? "success" : "neutral"} dot>
            {coupon.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      header: "",
      cell: (coupon) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${coupon.code}`}>
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/coupons/${coupon.id}/edit`}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit coupon
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 dark:text-red-400"
                onClick={() => setDeleting(coupon)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete coupon
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  return (
    <div className="space-y-5">
      <AdminListHeader
        eyebrow="Marketing"
        title="Coupons"
        description="Create and manage discount codes. Toggle availability without deleting order history."
        actions={
          <Button asChild>
            <Link href="/admin/coupons/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New coupon
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            items={[
              { value: "ALL", label: "All" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
            value={filter}
            onChange={setFilter}
          />
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search codes…"
              aria-label="Search coupons"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <AdminListCard
        title="Discount codes"
        description="Codes are applied at checkout and validated against their window and limits."
        count={totalItems}
        countLabel="coupons"
        columns={columns}
        rows={pagedRows}
        getKey={(coupon) => coupon.id}
        loading={query.isLoading}
        empty="No coupons match these filters."
        pagination={
          <ListPagination
            page={safePage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setLimit(size);
              setPage(1);
            }}
          />
        }
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Delete this coupon?"
        description="Customers will no longer be able to redeem this code. Existing orders keep their discount."
        confirmLabel="Delete coupon"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}
