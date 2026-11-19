"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { settingsApi } from "@/lib/api/services";
import { relatedKeys } from "@/lib/query-keys";
import { HOME_SECTION_META, type HomeSectionKey } from "@/lib/site-settings";
import { getErrorMessage } from "@/lib/utils";
import type { SiteSettings, UpdateSettingsInput } from "@/types";

interface ToggleVariables {
  key: HomeSectionKey;
  value: boolean;
}

export function SectionToggleCard({
  sectionKey,
  checked,
}: {
  sectionKey: HomeSectionKey;
  checked: boolean;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setSettings } = useSiteSettings();
  const meta = HOME_SECTION_META[sectionKey];

  const mutation = useMutation<
    SiteSettings,
    Error,
    ToggleVariables,
    { previous?: SiteSettings }
  >({
    mutationFn: ({ key, value }) =>
      settingsApi.update({ [key]: value } as UpdateSettingsInput),
    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: ["settings"] });
      const previous = queryClient.getQueryData<SiteSettings>(["settings"]);
      queryClient.setQueryData<SiteSettings>(["settings"], (current) =>
        current ? ({ ...current, [key]: value } as SiteSettings) : current,
      );
      return { previous };
    },
    onSuccess: (updated, { key, value }) => {
      setSettings(updated);
      invalidateKeys(queryClient, relatedKeys("settings"));
      router.refresh();
      toast.success(`${HOME_SECTION_META[key].label} ${value ? "enabled" : "disabled"}`);
    },
    onError: (error, { key }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["settings"], context.previous);
      }
      toast.error(
        getErrorMessage(error, `Could not update ${HOME_SECTION_META[key].label.toLowerCase()}`),
      );
    },
  });

  return (
    <Card className="flex items-center justify-between gap-4 p-4 sm:p-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{meta.label}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{meta.description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge tone={checked ? "success" : "neutral"} dot>
          {checked ? "Visible" : "Hidden"}
        </Badge>
        <Switch
          checked={checked}
          loading={mutation.isPending}
          onCheckedChange={(value) => mutation.mutate({ key: sectionKey, value })}
          aria-label={`${checked ? "Hide" : "Show"} ${meta.label}`}
        />
      </div>
    </Card>
  );
}
