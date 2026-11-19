"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";

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
import { SmartImage } from "@/components/ui/smart-image";
import { Switch } from "@/components/ui/switch";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  clampPage,
  useOptimisticMutation,
} from "@/hooks/use-optimistic-mutation";
import { brandsApi, categoriesApi } from "@/lib/api/services";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import type { Brand, Category } from "@/types";

type Mode = "categories" | "brands";
type Item = Category | Brand;

function isCategory(item: Item): item is Category {
  return "image" in item;
}

export function TaxonomyAdmin({ mode }: { mode: Mode }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [deleting, setDeleting] = React.useState<Item | null>(null);
  const [statusPendingId, setStatusPendingId] = React.useState<string | null>(null);
  const debounced = useDebouncedValue(search, 300);

  React.useEffect(() => setPage(1), [mode, debounced, limit]);

  const listKey = queryKeys.taxonomy.list(mode, debounced);
  const invalidateKeys = React.useMemo(() => relatedKeys(mode), [mode]);

  const query = useQuery<Item[]>({
    queryKey: listKey,
    queryFn: async (): Promise<Item[]> =>
      mode === "categories"
        ? categoriesApi.list(debounced.trim() || undefined)
        : brandsApi.list(debounced.trim() || undefined),
    staleTime: 60_000,
  });

  const toggle = useOptimisticMutation<Category | Brand, Error, Item>({
    mutationFn: (item: Item) =>
      mode === "categories"
        ? categoriesApi.updateStatus(item.id, !item.isActive)
        : brandsApi.updateStatus(item.id, !item.isActive),
    optimisticKeys: [listKey],
    applyOptimistic: (current, item) =>
      Array.isArray(current)
        ? current.map((entry: Item) =>
            entry.id === item.id ? { ...entry, isActive: !entry.isActive } : entry,
          )
        : current,
    invalidateKeys,
    successMessage: (_, item) => (item.isActive ? "Disabled" : "Enabled"),
    errorMessage: "Could not update the status",
    onMutate: (item) => setStatusPendingId(item.id),
    onSettled: () => setStatusPendingId(null),
  });

  const remove = useOptimisticMutation({
    mutationFn: (id: string) =>
      mode === "categories" ? categoriesApi.remove(id) : brandsApi.remove(id),
    optimisticKeys: [listKey],
    applyOptimistic: (current, id) =>
      Array.isArray(current) ? current.filter((entry: Item) => entry.id !== id) : current,
    invalidateKeys,
    successMessage: "Deleted",
    errorMessage: "Could not delete",
    onSuccess: () => {
      setDeleting(null);
      const cached = queryClient.getQueryData<unknown>(listKey);
      if (Array.isArray(cached)) {
        const safe = clampPage(page, Math.max(0, cached.length - 1), limit);
        if (safe !== page) setPage(safe);
      }
    },
  });

  const rows = query.data ?? [];
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(page, totalPages);
  const pagedRows = rows.slice((safePage - 1) * limit, safePage * limit);

  React.useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const label = mode === "categories" ? "category" : "brand";
  const labelTitle = mode === "categories" ? "Categories" : "Brands";

  const columns: DataColumn<Item>[] = [
    {
      header: labelTitle.slice(0, -1),
      cell: (item) => (
        <div className="flex items-center gap-3">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
            <SmartImage
              src={isCategory(item) ? (item.image ?? null) : ((item as Brand).logo ?? null)}
              alt={item.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
          <div>
            <p className="text-xs font-bold">{item.name}</p>
            <p className="text-[11px] text-muted-foreground">/{item.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Products",
      cell: (item) => <span className="font-semibold">{item.productCount}</span>,
    },
    {
      header: "Description",
      cell: (item) => (
        <span className="line-clamp-1 max-w-72 text-xs text-muted-foreground">
          {item.description || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <div className="flex items-center gap-2.5">
          <Switch
            checked={item.isActive}
            loading={statusPendingId === item.id}
            onCheckedChange={() => toggle.mutate(item)}
            aria-label={item.isActive ? `Disable ${item.name}` : `Enable ${item.name}`}
          />
          <Badge tone={item.isActive ? "success" : "neutral"} dot>
            {item.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      header: "",
      cell: (item) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${item.name}`}>
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/${mode}/${item.id}/edit`}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit {label}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 dark:text-red-400"
                onClick={() => setDeleting(item)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete {label}
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
        eyebrow="Catalogue"
        title={labelTitle}
        description={
          mode === "categories"
            ? "Organise products into browsable groups and control their storefront visibility."
            : "Manage makers and labels shown in filters and brand sections."
        }
        actions={
          <Button asChild>
            <Link href={`/admin/${mode}/new`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New {label}
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${mode}…`}
              aria-label={`Search ${mode}`}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <AdminListCard
        title={`All ${mode}`}
        description={`Showing ${totalItems} ${mode}. Changes to visibility apply immediately.`}
        count={totalItems}
        countLabel={mode}
        columns={columns}
        rows={pagedRows}
        getKey={(item) => item.id}
        loading={query.isLoading}
        empty={`No ${mode} match your search.`}
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
        title={`Delete this ${label}?`}
        description={
          mode === "categories"
            ? "Categories with products cannot be deleted until those products are reassigned."
            : "Brands with products cannot be deleted until those products are reassigned."
        }
        confirmLabel="Delete"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}
