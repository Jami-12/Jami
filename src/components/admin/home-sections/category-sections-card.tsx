"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { settingsApi } from "@/lib/api/services";
import { relatedKeys } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/utils";
import type {
  Category,
  HomeCategorySection,
  HomeCategorySectionInput,
  SiteSettings,
} from "@/types";

type CategoryUpdate =
  | { kind: "master"; value: boolean }
  | { kind: "all"; value: boolean }
  | { kind: "category"; categoryId: string; value: boolean };

function isVisible(existing: HomeCategorySection | undefined, update: CategoryUpdate): boolean {
  if (update.kind === "all") return update.value;
  if (update.kind === "category" && existing?.categoryId === update.categoryId) {
    return update.value;
  }
  return existing?.isVisible ?? true;
}

/** Rebuild every category section, preserving each category's saved sort order. */
function applyUpdate(
  settings: SiteSettings,
  categories: Category[],
  update: CategoryUpdate,
): SiteSettings {
  if (update.kind === "master") {
    return { ...settings, showCategorySections: update.value };
  }

  const sections: HomeCategorySection[] = categories.map((category) => {
    const existing = settings.categorySections?.find(
      (section) => section.categoryId === category.id,
    );
    const nextVisibility = isVisible(existing, update);
    if (existing) return { ...existing, isVisible: nextVisibility };
    return {
      id: category.id,
      categoryId: category.id,
      categoryName: category.name,
      categorySlug: category.slug,
      categoryImage: category.image,
      isVisible: nextVisibility,
      sortOrder: 0,
    };
  });

  return { ...settings, categorySections: sections };
}

function toInput(sections: HomeCategorySection[]): HomeCategorySectionInput[] {
  return sections.map(({ categoryId, isVisible: visible, sortOrder }) => ({
    categoryId,
    isVisible: visible,
    sortOrder,
  }));
}

export function CategorySectionsCard({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: Category[];
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setSettings } = useSiteSettings();
  const [pendingKey, setPendingKey] = React.useState<string | null>(null);

  const mutation = useMutation<
    SiteSettings,
    Error,
    CategoryUpdate,
    { previous?: SiteSettings }
  >({
    mutationFn: async (update) => {
      if (update.kind === "master") {
        return settingsApi.update({ showCategorySections: update.value });
      }
      const current = queryClient.getQueryData<SiteSettings>(["settings"]) ?? settings;
      return settingsApi.update({
        categorySections: toInput(applyUpdate(current, categories, update).categorySections),
      });
    },
    onMutate: async (update) => {
      setPendingKey(update.kind === "category" ? update.categoryId : update.kind);
      await queryClient.cancelQueries({ queryKey: ["settings"] });
      const previous = queryClient.getQueryData<SiteSettings>(["settings"]);
      if (previous) {
        queryClient.setQueryData<SiteSettings>(["settings"], applyUpdate(previous, categories, update));
      }
      return { previous };
    },
    onSuccess: (updated, update) => {
      setSettings(updated);
      invalidateKeys(queryClient, relatedKeys("settings"));
      router.refresh();

      if (update.kind === "master") {
        toast.success(update.value ? "Category sections enabled" : "Category sections disabled");
      } else if (update.kind === "all") {
        toast.success(update.value ? "All category sections shown" : "All category sections hidden");
      } else {
        const name = categories.find((category) => category.id === update.categoryId)?.name ?? "Category";
        toast.success(`${name} section ${update.value ? "shown" : "hidden"}`);
      }
    },
    onError: (error, _update, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["settings"], context.previous);
      }
      toast.error(getErrorMessage(error, "Could not update category sections"));
    },
    onSettled: () => setPendingKey(null),
  });

  const visibleCount = categories.filter(
    (category) =>
      settings.categorySections?.find((section) => section.categoryId === category.id)?.isVisible ??
      true,
  ).length;

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Category product sections</CardTitle>
          <CardDescription>
            Each visible category gets its own product row on the home page.
          </CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge tone={settings.showCategorySections ? "success" : "neutral"} dot>
            {settings.showCategorySections ? "Master on" : "Master off"}
          </Badge>
          <Switch
            checked={settings.showCategorySections}
            loading={pendingKey === "master"}
            disabled={mutation.isPending}
            onCheckedChange={(value) => mutation.mutate({ kind: "master", value })}
            aria-label="Toggle all category product sections"
          />
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {visibleCount} of {categories.length} categories shown
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={mutation.isPending || categories.length === 0}
              onClick={() => mutation.mutate({ kind: "all", value: true })}
            >
              Show all
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={mutation.isPending || categories.length === 0}
              onClick={() => mutation.mutate({ kind: "all", value: false })}
            >
              Hide all
            </Button>
          </div>
        </div>

        {categories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No categories yet. Add a category to create a home page section.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => {
              const checked =
                settings.categorySections?.find(
                  (section) => section.categoryId === category.id,
                )?.isVisible ?? true;
              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{category.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">/{category.slug}</p>
                  </div>
                  <Switch
                    checked={checked}
                    loading={pendingKey === category.id}
                    disabled={mutation.isPending}
                    onCheckedChange={(value) =>
                      mutation.mutate({ kind: "category", categoryId: category.id, value })
                    }
                    aria-label={`${checked ? "Hide" : "Show"} ${category.name} section`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
