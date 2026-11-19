"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, Search, ShieldCheck } from "lucide-react";

import { AdminListCard } from "@/components/admin/shared/admin-list-card";
import { AdminListHeader } from "@/components/admin/shared/admin-list-header";
import { ListPagination } from "@/components/dashboard/list-pagination";
import type { DataColumn } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { customersApi } from "@/lib/api/services";
import type { Tone } from "@/lib/constants";
import { formatDate, humanizeEnum } from "@/lib/utils";
import type { CustomerSummary, UserStatus } from "@/types";

const STATUS_TONE: Record<UserStatus, Tone> = {
  ACTIVE: "success",
  INACTIVE: "neutral",
  BLOCKED: "danger",
};

export function CustomersAdmin() {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const debounced = useDebouncedValue(search, 300);

  React.useEffect(() => setPage(1), [debounced, status, limit]);

  const query = useQuery({
    queryKey: ["admin", "customers", { page, limit, search: debounced, status }],
    queryFn: () =>
      customersApi.list({
        page,
        limit,
        search: debounced.trim() || undefined,
        status: status === "ALL" ? undefined : (status as UserStatus),
      }),
  });

  const rows = query.data?.items ?? [];
  const meta = query.data?.meta;

  const columns: DataColumn<CustomerSummary>[] = [
    {
      header: "Customer",
      cell: (customer) => (
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 font-display text-sm font-semibold text-primary-700 dark:bg-accent-300/15 dark:text-accent-200">
            {customer.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">{customer.name}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{customer.email}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Phone",
      cell: (customer) =>
        customer.phone ? (
          <span className="inline-flex items-center gap-1 text-xs">
            <Phone className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            {customer.phone}
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">—</span>
        ),
    },
    {
      header: "Orders",
      cell: (customer) => (
        <span className="text-xs">
          <span className="font-semibold">{customer.orderCount}</span>
          <span className="text-muted-foreground">
            {" "}
            · {customer.paidOrderCount} paid
          </span>
        </span>
      ),
    },
    {
      header: "Total spent",
      cell: (customer) => (
        <span className="text-xs font-semibold tabular-nums">
          ৳{customer.totalSpent.toLocaleString("en-US")}
        </span>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      header: "Last order",
      cell: (customer) => (
        <span className="text-[11px] text-muted-foreground">
          {customer.lastOrderAt ? formatDate(customer.lastOrderAt, "short") : "Never"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (customer) => (
        <Badge tone={STATUS_TONE[customer.status]} dot>
          {humanizeEnum(customer.status)}
        </Badge>
      ),
    },
    {
      header: "Joined",
      cell: (customer) => (
        <span className="text-[11px] text-muted-foreground">
          {formatDate(customer.createdAt, "short")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminListHeader
        eyebrow="People"
        title="Customers"
        description="A read-only directory of everyone who has shopped with you. Roles and access changes belong to super-admins."
        badge={
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Read-only
          </span>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or phone…"
              aria-label="Search customers"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by account status"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BLOCKED">Blocked</option>
          </Select>
        </CardContent>
      </Card>

      <AdminListCard
        title="Customer directory"
        description="Spend and order totals are lifetime figures across all paid orders."
        count={meta?.total}
        countLabel="customers"
        columns={columns}
        rows={rows}
        getKey={(customer) => customer.id}
        loading={query.isLoading}
        empty="No customers match these filters."
        pagination={
          <ListPagination
            page={page}
            totalPages={meta?.totalPages ?? 1}
            totalItems={meta?.total}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setLimit(size);
              setPage(1);
            }}
          />
        }
      />
    </div>
  );
}
