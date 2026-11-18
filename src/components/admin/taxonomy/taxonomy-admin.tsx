"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { PageSection } from "@/components/dashboard/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SmartImage } from "@/components/ui/smart-image";
import { Switch } from "@/components/ui/switch";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { brandsApi, categoriesApi } from "@/lib/api/services";
import { getErrorMessage } from "@/lib/utils";
import type { Brand, Category } from "@/types";

type Mode = "categories" | "brands";
type Item = Category | Brand;

function isCategory(item: Item): item is Category {
  return "image" in item;
}

export function TaxonomyAdmin({ mode }: { mode: Mode }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [deleting, setDeleting] = React.useState<Item | null>(null);
  const [statusPendingId, setStatusPendingId] = React.useState<string | null>(null);
  const debounced = useDebouncedValue(search, 300);

  const query = useQuery<Item[]>({
    queryKey: [mode, debounced],
    queryFn: async (): Promise<Item[]> =>
      mode === "categories"
        ? categoriesApi.list(debounced.trim() || undefined)
        : brandsApi.list(debounced.trim() || undefined),
    staleTime: 60_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [mode] });
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
    void queryClient.invalidateQueries({ queryKey: ["brands"] });
  };

  const toggle = useMutation<
    Category | Brand,
    Error,
    Item,
    { previous?: Item[] }
  >({
    mutationFn: (item: Item) =>
      mode === "categories"
        ? categoriesApi.updateStatus(item.id, !item.isActive)
        : brandsApi.updateStatus(item.id, !item.isActive),
    onMutate: async (item) => {
      setStatusPendingId(item.id);
      const key = [mode, debounced] as const;
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Item[]>(key);
      queryClient.setQueryData<Item[]>(key, (current) =>
        current?.map((entry) =>
          entry.id === item.id ? { ...entry, isActive: !entry.isActive } : entry,
        ),
      );
      return { previous };
    },
    onSuccess: (_result, item) => {
      toast.success(item.isActive ? "Disabled" : "Enabled");
    },
    onError: (error, _item, context) => {
      if (context?.previous) {
        queryClient.setQueryData([mode, debounced], context.previous);
      }
      toast.error(getErrorMessage(error, "Could not update the status"));
    },
    onSettled: () => {
      setStatusPendingId(null);
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      mode === "categories" ? categoriesApi.remove(id) : brandsApi.remove(id),
    onSuccess: () => {
      toast.success("Deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not delete")),
  });

  const rows = query.data ?? [];
  const label = mode === "categories" ? "category" : "brand";

  const columns: DataColumn<Item>[] = [
    {
      header: mode === "categories" ? "Category" : "Brand",
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
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={`/admin/${mode}/${item.id}/edit`}
              aria-label={`Edit ${item.name}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${item.name}`}
            className="text-muted-foreground hover:text-red-600"
            onClick={() => setDeleting(item)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        <Button asChild>
          <Link href={`/admin/${mode}/new`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New {label}
          </Link>
        </Button>
      </div>

      <PageSection>
        <DataTable
          columns={columns}
          rows={rows}
          getKey={(item) => item.id}
          loading={query.isLoading}
          empty={`No ${mode} yet.`}
        />
      </PageSection>

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
