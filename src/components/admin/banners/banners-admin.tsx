"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { AdminListCard } from "@/components/admin/shared/admin-list-card";
import { AdminListHeader } from "@/components/admin/shared/admin-list-header";
import { ListPagination } from "@/components/dashboard/list-pagination";
import type { DataColumn } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SmartImage } from "@/components/ui/smart-image";
import { Switch } from "@/components/ui/switch";
import {
  clampPage,
  useOptimisticMutation,
} from "@/hooks/use-optimistic-mutation";
import { bannersApi } from "@/lib/api/services";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import type { Banner } from "@/types";

export function BannersAdmin() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [deleting, setDeleting] = React.useState<Banner | null>(null);
  const [statusPendingId, setStatusPendingId] = React.useState<string | null>(null);

  const listKey = queryKeys.banners.all();
  const invalidateKeys = React.useMemo(() => relatedKeys("banners"), []);

  const query = useQuery({
    queryKey: listKey,
    queryFn: () => bannersApi.listAdmin(),
    staleTime: 30_000,
  });

  const toggle = useOptimisticMutation({
    mutationFn: (banner: Banner) => bannersApi.updateStatus(banner.id, !banner.isActive),
    optimisticKeys: [listKey],
    applyOptimistic: (current, banner) =>
      Array.isArray(current)
        ? current.map((entry: Banner) =>
            entry.id === banner.id ? { ...entry, isActive: !entry.isActive } : entry,
          )
        : current,
    invalidateKeys,
    successMessage: (_, banner) =>
      banner.isActive ? "Banner disabled" : "Banner enabled",
    errorMessage: "Could not update the banner",
    onMutate: (banner) => setStatusPendingId(banner.id),
    onSettled: () => setStatusPendingId(null),
  });

  const remove = useOptimisticMutation({
    mutationFn: (id: string) => bannersApi.remove(id),
    optimisticKeys: [listKey],
    applyOptimistic: (current, id) =>
      Array.isArray(current) ? current.filter((entry: Banner) => entry.id !== id) : current,
    invalidateKeys,
    successMessage: "Banner deleted",
    errorMessage: "Could not delete the banner",
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

  const columns: DataColumn<Banner>[] = [
    {
      header: "Banner",
      cell: (banner) => (
        <div className="flex items-center gap-3">
          <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            <SmartImage
              src={banner.imageUrl}
              alt={banner.title}
              fill
              sizes="80px"
              className="object-cover"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">{banner.title}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {banner.subtitle || banner.linkUrl || "No destination"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Placement",
      cell: (banner) => (
        <Badge tone={banner.placement === "HERO" ? "accent" : "info"}>
          {banner.placement}
        </Badge>
      ),
    },
    {
      header: "Order",
      cell: (banner) => (
        <span className="font-mono text-xs text-muted-foreground">{banner.sortOrder}</span>
      ),
    },
    {
      header: "Status",
      cell: (banner) => (
        <div className="flex items-center gap-2.5">
          <Switch
            checked={banner.isActive}
            loading={statusPendingId === banner.id}
            onCheckedChange={() => toggle.mutate(banner)}
            aria-label={banner.isActive ? `Disable ${banner.title}` : `Enable ${banner.title}`}
          />
          <Badge tone={banner.isActive ? "success" : "neutral"} dot>
            {banner.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      header: "",
      cell: (banner) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${banner.title}`}>
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/banners/${banner.id}/edit`}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit banner
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 dark:text-red-400"
                onClick={() => setDeleting(banner)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete banner
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
        eyebrow="Storefront"
        title="Banners"
        description="Manage hero slides and promo placements shown across the storefront."
        actions={
          <Button asChild>
            <Link href="/admin/banners/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New banner
            </Link>
          </Button>
        }
      />

      <AdminListCard
        title="All banners"
        description="Use placement and sort order to control where each banner appears."
        count={totalItems}
        countLabel="banners"
        columns={columns}
        rows={pagedRows}
        getKey={(banner) => banner.id}
        loading={query.isLoading}
        empty="No banners yet. Create your first hero or promo banner."
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
        title="Delete this banner?"
        description={`“${deleting?.title ?? "This banner"}” will be removed from the storefront.`}
        confirmLabel="Delete banner"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}
