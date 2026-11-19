"use client";

import * as React from "react";
import { ShieldCheck, UserRound, Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs } from "@/components/ui/tabs";

import { ProfileSettingsForm } from "./profile-settings-form";
import { StoreLogoForm } from "./store-logo-form";

const TABS = [
  { value: "profile", label: "Profile", icon: UserRound },
  { value: "store", label: "Store & logo", icon: Store },
] as const;

export function SuperAdminSettings() {
  const [tab, setTab] = React.useState<string>(TABS[0].value);
  const active = TABS.find((item) => item.value === tab) ?? TABS[0];
  const ActiveIcon = active.icon;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <Card className="overflow-hidden">
        <CardHeader className="gap-4 border-b border-border bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-700 text-white shadow-sm dark:bg-accent-300 dark:text-primary-950">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                Workspace
              </p>
              <CardTitle className="font-display text-xl sm:text-2xl">Settings</CardTitle>
              <CardDescription className="max-w-xl">
                Keep your super admin profile current and control the identity shown across the
                storefront.
              </CardDescription>
            </div>
          </div>
          <Badge tone="accent" dot className="w-fit">
            Super admin only
          </Badge>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            items={TABS.map((item) => ({ value: item.value, label: item.label }))}
            value={tab}
            onChange={setTab}
            className="w-full max-w-full sm:w-auto"
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ActiveIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{active.label}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Changes apply instantly</span>
          </div>
        </CardContent>
      </Card>

      <Card role="tabpanel" aria-label={active.label}>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <ActiveIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="font-display text-base">{active.label}</CardTitle>
          </div>
          <CardDescription>
            {tab === "store"
              ? "Update the storefront name and logo seen by every visitor and admin."
              : "Update the contact details attached to your super admin account."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          {tab === "store" ? <StoreLogoForm /> : <ProfileSettingsForm />}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="link" size="sm" onClick={() => setTab(tab === "store" ? "profile" : "store")}>
          Switch to {tab === "store" ? "profile" : "store settings"}
        </Button>
      </div>
    </div>
  );
}
