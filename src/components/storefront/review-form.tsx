"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldError, Label, Textarea } from "@/components/ui/input";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { reviewsApi } from "@/lib/api/services";
import { relatedKeys } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/utils";
import { reviewSchema } from "@/lib/validations";

export function ReviewForm({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();

  const mutation = useMutation({
    mutationFn: () =>
      reviewsApi.create(productId, { rating, comment: comment.trim() || undefined }),
    onSuccess: () => {
      toast.success("Review submitted — it will appear after moderation.");
      setRating(0);
      setComment("");
      invalidateKeys(queryClient, relatedKeys("reviews"));
    },
    onError: (mutationError) =>
      toast.error(getErrorMessage(mutationError, "Could not submit your review")),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = reviewSchema.safeParse({ rating, comment });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your review");
      return;
    }
    setError(undefined);
    mutation.mutate();
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-bold">Write a review</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Reviews are moderated before they appear in the storefront.
      </p>

      <div className="mt-4">
        <Label>Your rating</Label>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(value)}
              className="rounded p-1 text-amber-400 transition hover:scale-110"
            >
              <Star
                className="h-6 w-6"
                fill={(hover || rating) >= value ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>
          ))}
          <span className="ml-2 text-xs text-muted-foreground">
            {rating ? `${rating} of 5` : "Tap to rate"}
          </span>
        </div>
        <FieldError>{error && rating === 0 ? error : undefined}</FieldError>
      </div>

      <div className="mt-4">
        <Label htmlFor="review-comment">Your review</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="How does it feel, sound or fit into your space?"
          maxLength={3000}
          invalid={Boolean(error && comment.length > 3000)}
        />
      </div>

      <Button type="submit" className="mt-4" loading={mutation.isPending} disabled={rating === 0}>
        Submit review
      </Button>
    </form>
  );
}
