"use client";

import { useQuery } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";

import { CategorySectionsCard } from "@/components/admin/home-sections/category-sections-card";
import { SectionToggleCard } from "@/components/admin/home-sections/section-toggle-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesApi, settingsApi } from "@/lib/api/services";
import { HOME_SECTION_KEYS } from "@/lib/site-settings";
import { getErrorMessage } from "@/lib/utils";

function ControlSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Card>
        <CardHeader>
          <CardTitle>Global sections</CardTitle>
          <CardDescription>Loading storefront visibility…</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-3 pt-5 md:grid-cols-2">
          {HOME_SECTION_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-52 max-w-full" />
              </div>
              <Skeleton className="h-5 w-9 shrink-0 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Category sections</CardTitle>
          <CardDescription>Loading categories…</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5">
          <Skeleton className="h-52 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function HomeSectionsControl() {
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get,
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });

  const retry = () => {
    if (settingsQuery.isError) void settingsQuery.refetch();
    if (categoriesQuery.isError) void categoriesQuery.refetch();
  };

  if (settingsQuery.isError || categoriesQuery.isError) {
    return (
      <EmptyState
        icon={TriangleAlert}
        title="Could not load home section settings"
        description={getErrorMessage(
          settingsQuery.error ?? categoriesQuery.error,
          "Please try again in a moment.",
        )}
        action={
          <Button
            type="button"
            onClick={retry}
            disabled={settingsQuery.isFetching || categoriesQuery.isFetching}
          >
            {settingsQuery.isFetching || categoriesQuery.isFetching ? "Retrying..." : "Try again"}
          </Button>
        }
      />
    );
  }

  if (!settingsQuery.data || !categoriesQuery.data) {
    return <ControlSkeleton />;
  }

  const settings = settingsQuery.data;
  const categories = categoriesQuery.data;
  const enabledCount = HOME_SECTION_KEYS.filter((key) => settings[key]).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Storefront
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold">Homepage visibility</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Turn sections off to hide them from the home page on the next visit.
          </p>
        </div>
        <Badge tone={enabledCount > 0 ? "success" : "warning"}>
          {enabledCount} of {HOME_SECTION_KEYS.length} sections on
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global sections</CardTitle>
          <CardDescription>
            Major blocks shown on every visit to the storefront home page.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-3 pt-5 md:grid-cols-2">
          {HOME_SECTION_KEYS.map((key) => (
            <SectionToggleCard key={key} sectionKey={key} checked={settings[key]} />
          ))}
        </CardContent>
      </Card>

      <CategorySectionsCard settings={settings} categories={categories} />
    </div>
  );
}
