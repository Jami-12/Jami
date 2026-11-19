"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search, ShieldCheck } from "lucide-react";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { ListPagination } from "@/components/dashboard/list-pagination";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { FormField, Input, Select } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { auditApi, usersApi } from "@/lib/api/services";
import { formatDate, humanizeEnum, truncate } from "@/lib/utils";
import type { AuditLog } from "@/types";

const ROLE_TONE: Record<string, "neutral" | "info" | "accent"> = {
  CUSTOMER: "neutral",
  ADMIN: "info",
  SUPER_ADMIN: "accent",
};

function prettyJson(value: unknown): string {
  if (value === null || value === undefined) return "—";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function AuditView() {
  const [action, setAction] = React.useState("");
  const [entity, setEntity] = React.useState("");
  const [userId, setUserId] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const debounced = useDebouncedValue(search, 300);
  const [inspect, setInspect] = React.useState<AuditLog | null>(null);

  React.useEffect(
    () => setPage(1),
    [action, entity, userId, debounced, sortOrder, limit],
  );

  const users = useQuery({
    queryKey: ["users", "audit-options"],
    queryFn: () => usersApi.list({ limit: 100, sortOrder: "asc" }),
    staleTime: 5 * 60_000,
  });

  const query = useQuery({
    queryKey: ["audit", { page, limit, action, entity, userId, search: debounced, sortOrder }],
    queryFn: () =>
      auditApi.list({
        page,
        limit,
        action: action.trim() || undefined,
        entity: entity.trim() || undefined,
        userId: userId === "ALL" ? undefined : userId,
        search: debounced.trim() || undefined,
        sortOrder,
      }),
  });

  const rows = query.data?.items ?? [];
  const userOptions = users.data?.items ?? [];

  const columns: DataColumn<AuditLog>[] = [
    {
      header: "Action",
      cell: (log) => (
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-bold">{log.action}</p>
          <p className="max-w-72 truncate text-[11px] text-muted-foreground">
            {log.description || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Entity",
      cell: (log) => (
        <div>
          <Badge tone="neutral">{log.entity}</Badge>
          {log.entityId ? (
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              {log.entityId.slice(0, 10)}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      header: "Actor",
      cell: (log) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{log.user.name}</p>
          <div className="mt-0.5">
            <Badge tone={ROLE_TONE[log.user.role] ?? "neutral"}>
              {humanizeEnum(log.user.role)}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      header: "IP",
      cell: (log) => (
        <span className="font-mono text-[10px] text-muted-foreground">{log.ipAddress ?? "—"}</span>
      ),
    },
    {
      header: "When",
      cell: (log) => (
        <div>
          <p className="text-[11px]">{formatDate(log.createdAt)}</p>
          <p className="text-[10px] text-muted-foreground">{formatDate(log.createdAt, "long")}</p>
        </div>
      ),
    },
    {
      header: "",
      cell: (log) => (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInspect(log)}
            aria-label={`View details for ${log.action}`}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            Details
          </Button>
        </div>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-muted/30">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Security trail
            </p>
            <CardTitle className="font-display text-xl">Audit logs</CardTitle>
            <CardDescription>Immutable record of privileged actions across the platform.</CardDescription>
          </div>
          <Badge tone="accent" dot>
            <ShieldCheck className="mr-1 h-3 w-3" aria-hidden="true" />
            Append-only
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Matching entries"
          value={query.data?.meta.total ?? "—"}
          hint={`Page ${query.data?.meta.page ?? page} of ${query.data?.meta.totalPages ?? 1}`}
          icon={ShieldCheck}
        />
        <StatCard
          label="Distinct actions"
          value={new Set(rows.map((row) => row.action)).size}
          hint="On this page"
          tone="accent"
        />
        <StatCard
          label="Distinct entities"
          value={new Set(rows.map((row) => row.entity)).size}
          hint="On this page"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Filters</CardTitle>
          <CardDescription>Search descriptions and narrow by action, entity or actor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <div className="relative sm:col-span-2 xl:col-span-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search description…"
                aria-label="Search audit logs"
                className="pl-9"
              />
            </div>
            <FormField label="Action" htmlFor="audit-action">
              <Input
                id="audit-action"
                value={action}
                onChange={(event) => setAction(event.target.value)}
                placeholder="e.g. CREATE_PRODUCT"
              />
            </FormField>
            <FormField label="Entity" htmlFor="audit-entity">
              <Input
                id="audit-entity"
                value={entity}
                onChange={(event) => setEntity(event.target.value)}
                placeholder="e.g. Product"
              />
            </FormField>
            <FormField label="Actor" htmlFor="audit-user">
              <Select id="audit-user" value={userId} onChange={(event) => setUserId(event.target.value)}>
                <option value="ALL">All users</option>
                {userOptions.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Sort" htmlFor="audit-sort">
              <Select
                id="audit-sort"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as "asc" | "desc")}
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </Select>
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0 pb-4 pt-4 sm:px-0">
          <DataTable
            columns={columns}
            rows={rows}
            getKey={(log) => log.id}
            loading={query.isLoading}
            empty="No audit entries match these filters."
          />
          <div className="px-4 sm:px-5">
            <ListPagination
              page={query.data?.meta.page ?? page}
              pageCount={query.data?.meta.totalPages ?? 1}
              totalItems={query.data?.meta.total ?? 0}
              pageSize={query.data?.meta.limit ?? limit}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setLimit(size);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(inspect)}
        onClose={() => setInspect(null)}
        title={inspect ? humanizeEnum(inspect.action) : "Audit entry"}
        description={inspect ? `${inspect.entity} · ${formatDate(inspect.createdAt, "long")}` : undefined}
        size="xl"
        footer={
          <Button variant="outline" size="sm" onClick={() => setInspect(null)}>
            Close
          </Button>
        }
      >
        {inspect ? (
          <div className="space-y-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Actor
                </dt>
                <dd className="mt-1 font-semibold">
                  {inspect.user.name}{" "}
                  <span className="font-normal text-muted-foreground">({inspect.user.email})</span>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Entity
                </dt>
                <dd className="mt-1 font-mono text-xs">
                  {inspect.entity}
                  {inspect.entityId ? ` · ${inspect.entityId}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  IP address
                </dt>
                <dd className="mt-1 font-mono text-xs">{inspect.ipAddress ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Recorded
                </dt>
                <dd className="mt-1 text-xs">{formatDate(inspect.createdAt, "long")}</dd>
              </div>
            </dl>

            {inspect.description ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 text-sm">{truncate(inspect.description, 2000)}</p>
              </div>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Previous data
                </p>
                <pre className="max-h-72 overflow-auto rounded-xl border border-border bg-muted/50 p-3 text-[11px] leading-relaxed">
                  {prettyJson(inspect.oldData)}
                </pre>
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  New data
                </p>
                <pre className="max-h-72 overflow-auto rounded-xl border border-border bg-muted/50 p-3 text-[11px] leading-relaxed">
                  {prettyJson(inspect.newData)}
                </pre>
              </div>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
