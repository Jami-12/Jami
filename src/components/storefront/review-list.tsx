"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FieldError, Label, Textarea } from "@/components/ui/input";
import { RatingStars } from "@/components/ui/rating-stars";
import { Skeleton } from "@/components/ui/skeleton";
import { clampPage, invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { reviewsApi } from "@/lib/api/services";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { formatDate, getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Review } from "@/types";

export function ReviewList({
  productId,
  averageRating,
  reviewCount,
}: {
  productId: string;
  averageRating: number;
  reviewCount: number;
}) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = React.useState(1);
  const [editing, setEditing] = React.useState<Review | null>(null);
  const [editRating, setEditRating] = React.useState(0);
  const [editComment, setEditComment] = React.useState("");
  const [editError, setEditError] = React.useState<string | undefined>();
  const [deleting, setDeleting] = React.useState<Review | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.reviews(productId, page),
    queryFn: () => reviewsApi.forProduct(productId, { page, limit: 5 }),
  });

  const invalidate = () => invalidateKeys(queryClient, relatedKeys("reviews"));

  const update = useMutation({
    mutationFn: () =>
      reviewsApi.update(editing!.id, {
        rating: editRating,
        comment: editComment.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Review updated");
      setEditing(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update the review")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => {
      toast.success("Review deleted");
      setDeleting(null);
      const meta = data?.meta;
      if (meta) {
        const safe = clampPage(page, Math.max(0, meta.total - 1), 5);
        if (safe !== page) setPage(safe);
      }
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not delete the review")),
  });

  const openEdit = (review: Review) => {
    setEditing(review);
    setEditRating(review.rating);
    setEditComment(review.comment ?? "");
    setEditError(undefined);
  };

  const submitEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (editRating < 1 || editRating > 5) {
      setEditError("Choose a rating from 1 to 5");
      return;
    }
    if (editComment.length > 3000) {
      setEditError("Review must be 3000 characters or fewer");
      return;
    }
    setEditError(undefined);
    update.mutate();
  };

  const items = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1].map((index) => (
          <Skeleton key={index} className="h-24 w-full rounded-none" />
        ))}
      </div>
    );
  }

  if (reviewCount === 0) {
    return (
      <div className="rounded-none border border-border bg-secondary px-4 py-8 text-center">
        <Star className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <p className="mt-2 text-sm font-semibold">No reviews yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          If you own this piece, share how it fits and wears.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 rounded-none border border-border bg-secondary px-4 py-3">
        <div className="text-center">
          <p className="text-3xl font-extrabold tabular-nums">{averageRating.toFixed(1)}</p>
          <RatingStars rating={averageRating} size={12} className="mt-1" />
        </div>
        <div className="h-10 w-px bg-border" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">
          Based on {reviewCount} verified review{reviewCount === 1 ? "" : "s"} from
          confirmed purchases.
        </p>
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((review) => {
          const isOwner = user?.id === review.userId;
          return (
            <li key={review.id} className="rounded-none border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <Avatar name={review.user.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold">
                        {review.user.name}
                        {isOwner ? (
                          <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            You
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RatingStars rating={review.rating} size={12} />
                      {isOwner ? (
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none border border-border hover:border-foreground hover:bg-foreground hover:text-background"
                            aria-label="Edit your review"
                            onClick={() => openEdit(review)}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none border border-border text-muted-foreground hover:border-foreground hover:bg-foreground hover:text-background"
                            aria-label="Delete your review"
                            onClick={() => setDeleting(review)}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {review.comment ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {review.comment}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {(data?.meta.totalPages ?? 0) > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-none border-border hover:border-foreground hover:bg-foreground hover:text-background"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {data?.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none border-border hover:border-foreground hover:bg-foreground hover:text-background"
            onClick={() => setPage((current) => current + 1)}
            disabled={!data?.meta.hasNextPage}
          >
            Next
          </Button>
        </div>
      ) : null}

      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit your review"
        description="Your updated review will appear immediately if it was already approved."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditing(null)} disabled={update.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="edit-review-form" size="sm" loading={update.isPending}>
              Save review
            </Button>
          </>
        }
      >
        <form id="edit-review-form" onSubmit={submitEdit} className="space-y-4" noValidate>
          <div>
            <Label>Rating</Label>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Updated rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={editRating === value}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  onClick={() => setEditRating(value)}
                  className={`rounded-none border p-1 transition-colors ${
                    editRating >= value
                      ? "border-foreground text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  <Star
                    className="h-6 w-6"
                    fill={editRating >= value ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                </button>
              ))}
              <span className="ml-2 text-xs text-muted-foreground">
                {editRating ? `${editRating} of 5` : "Tap to rate"}
              </span>
            </div>
          </div>
          <div>
            <Label htmlFor="edit-review-comment">Your review</Label>
            <Textarea
              id="edit-review-comment"
              value={editComment}
              onChange={(event) => setEditComment(event.target.value)}
              maxLength={3000}
              rows={4}
            />
          </div>
          <FieldError>{editError}</FieldError>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Delete your review?"
        description="Your review will be permanently removed from this product."
        confirmLabel="Delete review"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}
