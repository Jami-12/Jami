"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { PageSection } from "@/components/dashboard/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { SmartImage } from "@/components/ui/smart-image";
import { Switch } from "@/components/ui/switch";
import { bannersApi } from "@/lib/api/services";
import { getErrorMessage } from "@/lib/utils";
import type { Banner } from "@/types";

export function BannersAdmin() {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = React.useState<Banner | null>(null);
  const [statusPendingId, setStatusPendingId] = React.useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: () => bannersApi.listAdmin(),
    staleTime: 30_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
    void queryClient.invalidateQueries({ queryKey: ["public", "banners"] });
  };

  const toggle = useMutation<Banner, Error, Banner, { previous?: Banner[] }>({
    mutationFn: (banner: Banner) => bannersApi.updateStatus(banner.id, !banner.isActive),
    onMutate: async (banner) => {
      setStatusPendingId(banner.id);
      const key = ["admin", "banners"] as const;
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Banner[]>(key);
      queryClient.setQueryData<Banner[]>(key, (current) =>
        current?.map((entry) =>
          entry.id === banner.id ? { ...entry, isActive: !entry.isActive } : entry,
        ),
      );
      return { previous };
    },
    onSuccess: (_result, banner) => {
      toast.success(banner.isActive ? "Banner disabled" : "Banner enabled");
    },
    onError: (error, _banner, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin", "banners"], context.previous);
      }
      toast.error(getErrorMessage(error, "Could not update the banner"));
    },
    onSettled: () => {
      setStatusPendingId(null);
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => bannersApi.remove(id),
    onSuccess: () => {
      toast.success("Banner deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not delete the banner")),
  });

  const rows = query.data ?? [];

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
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/banners/${banner.id}/edit`} aria-label={`Edit ${banner.title}`}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${banner.title}`}
            className="text-muted-foreground hover:text-red-600"
            onClick={() => setDeleting(banner)}
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
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Storefront banners</h2>
          <p className="text-xs text-muted-foreground">
            Hero slides and promo cards streamed from the media library.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/banners/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New banner
          </Link>
        </Button>
      </div>

      <PageSection>
        <DataTable
          columns={columns}
          rows={rows}
          getKey={(banner) => banner.id}
          loading={query.isLoading}
          empty="No banners yet. Create your first hero or promo banner."
        />
      </PageSection>

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
