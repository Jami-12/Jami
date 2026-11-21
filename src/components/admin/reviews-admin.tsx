"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { AdminListCard } from "@/components/admin/shared/admin-list-card";
import { AdminListHeader } from "@/components/admin/shared/admin-list-header";
import { ListPagination } from "@/components/dashboard/list-pagination";
import type { DataColumn } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RatingStars } from "@/components/ui/rating-stars";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { invalidateKeys, clampPage } from "@/hooks/use-optimistic-mutation";
import { reviewsApi } from "@/lib/api/services";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { formatDate, getErrorMessage } from "@/lib/utils";
import type { Review } from "@/types";

export function ReviewsAdmin() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = React.useState("PENDING");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [deleting, setDeleting] = React.useState<Review | null>(null);
  const debounced = useDebouncedValue(search, 300);

  React.useEffect(() => setPage(1), [filter, limit]);

  const listKey = queryKeys.reviews.admin.list({ filter, page, limit });

  const query = useQuery({
    queryKey: listKey,
    queryFn: () =>
      reviewsApi.list({
        page,
        limit,
        isApproved: filter === "PENDING" ? false : filter === "APPROVED" ? true : undefined,
      }),
  });

  const invalidate = () => invalidateKeys(queryClient, relatedKeys("reviews"));

  const moderate = useMutation({
    mutationFn: ({ review, isApproved }: { review: Review; isApproved: boolean }) =>
      reviewsApi.update(review.id, { isApproved }),
    onSuccess: (_review, variables) => {
      toast.success(variables.isApproved ? "Review approved" : "Review unpublished");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update the review")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => {
      toast.success("Review deleted");
      setDeleting(null);
      const meta = query.data?.meta;
      if (meta) {
        const safe = clampPage(page, Math.max(0, meta.total - 1), limit);
        if (safe !== page) setPage(safe);
      }
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not delete the review")),
  });

  const reviews = (query.data?.items ?? []).filter((review) => {
    if (!debounced.trim()) return true;
    const term = debounced.toLowerCase();
    return (
      review.user.name.toLowerCase().includes(term) ||
      (review.comment ?? "").toLowerCase().includes(term)
    );
  });

  const columns: DataColumn<Review>[] = [
    {
      header: "Reviewer",
      cell: (review) => (
        <div>
          <p className="text-xs font-bold">{review.user.name}</p>
          <p className="text-[11px] text-muted-foreground">{formatDate(review.createdAt)}</p>
        </div>
      ),
    },
    {
      header: "Rating",
      cell: (review) => <RatingStars rating={review.rating} size={14} showValue />,
    },
    {
      header: "Comment",
      cell: (review) => (
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
          {review.comment || "—"}
        </p>
      ),
    },
    {
      header: "State",
      cell: (review) => (
        <Badge tone={review.isApproved ? "success" : "warning"} dot>
          {review.isApproved ? "Published" : "Pending"}
        </Badge>
      ),
    },
    {
      header: "",
      cell: (review) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={review.isApproved ? "text-muted-foreground" : "text-muted-foreground"}
            onClick={() => moderate.mutate({ review, isApproved: !review.isApproved })}
            loading={moderate.isPending && moderate.variables?.review.id === review.id}
          >
            {review.isApproved ? (
              <>
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Unpublish
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Approve
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete review"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setDeleting(review)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  const meta = query.data?.meta;

  return (
    <div className="space-y-5">
      <AdminListHeader
        eyebrow="Moderation"
        title="Reviews"
        description="Approve, hide or remove customer feedback. Search filters the current page."
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            items={[
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Published" },
              { value: "ALL", label: "All" },
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
              placeholder="Search reviewer or comment…"
              aria-label="Search reviews"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <AdminListCard
        title="Customer reviews"
        description="Moderation changes update the storefront rating immediately."
        count={meta?.total}
        countLabel="reviews"
        columns={columns}
        rows={reviews}
        getKey={(review) => review.id}
        loading={query.isLoading}
        empty={
          filter === "PENDING"
            ? "No reviews are waiting for moderation."
            : "No reviews match these filters."
        }
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

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Delete this review?"
        description="The review is removed permanently and the product rating is recalculated."
        confirmLabel="Delete review"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}
