"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, MailOpen, Trash2 } from "lucide-react";

import { ListPagination } from "@/components/dashboard/list-pagination";
import { PageSection } from "@/components/dashboard/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { useOptimisticMutation, clampPage } from "@/hooks/use-optimistic-mutation";
import { notificationsApi } from "@/lib/api/services";
import { NOTIFICATION_META } from "@/lib/constants";
import { notificationHref } from "@/lib/notification-links";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { cn, formatRelative } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Notification, PaginatedNotifications } from "@/types";

const FILTERS = [
  { value: "ALL", label: "All" },
  { value: "UNREAD", label: "Unread" },
] as const;

const PAGE_SIZES = [10, 20, 50];

/** Apply a change to every cached notification list variant at once. */
function patchNotificationList(
  current: unknown,
  update: (list: PaginatedNotifications) => PaginatedNotifications,
): unknown {
  if (!current || typeof current !== "object" || !("items" in current)) return current;
  return update(current as PaginatedNotifications);
}

export function NotificationsView() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [deleting, setDeleting] = React.useState<Notification | null>(null);

  const listKey = queryKeys.notifications.list({ page, pageSize, filter });
  const cacheKeys = React.useMemo(
    () => [listKey, queryKeys.notifications.unreadCount(), queryKeys.notifications.popover()],
    [listKey],
  );
  const invalidateKeys = React.useMemo(() => relatedKeys("notifications"), []);

  const query = useQuery({
    queryKey: listKey,
    queryFn: () =>
      notificationsApi.list({
        page,
        limit: pageSize,
        isRead: filter === "UNREAD" ? false : undefined,
      }),
  });

  React.useEffect(() => setPage(1), [filter, pageSize]);

  const markRead = useOptimisticMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    optimisticKeys: cacheKeys,
    applyOptimistic: (current, id) =>
      patchNotificationList(current, (list) => ({
        ...list,
        items: list.items.map((item) =>
          item.id === id ? { ...item, isRead: true } : item,
        ),
        unreadCount: Math.max(0, list.unreadCount - 1),
      })),
    invalidateKeys,
    errorMessage: "Could not mark the notification as read",
    toastOnSuccess: false,
  });

  const markAll = useOptimisticMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    optimisticKeys: cacheKeys,
    applyOptimistic: (current) =>
      patchNotificationList(current, (list) => ({
        ...list,
        items: list.items.map((item) => ({ ...item, isRead: true })),
        unreadCount: 0,
      })),
    invalidateKeys,
    successMessage: (count) =>
      count > 0
        ? `${count} notification${count === 1 ? "" : "s"} marked as read`
        : "You are all caught up",
    errorMessage: "Could not update notifications",
  });

  const remove = useOptimisticMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    optimisticKeys: cacheKeys,
    applyOptimistic: (current, id) =>
      patchNotificationList(current, (list) => ({
        ...list,
        items: list.items.filter((item) => item.id !== id),
        unreadCount: Math.max(
          0,
          list.unreadCount - (list.items.find((item) => item.id === id)?.isRead === false ? 1 : 0),
        ),
      })),
    invalidateKeys,
    successMessage: "Notification removed",
    errorMessage: "Could not remove the notification",
    onSuccess: () => {
      setDeleting(null);
      const cached = queryClient.getQueryData<PaginatedNotifications>(listKey);
      if (cached) {
        const total = Math.max(0, cached.meta.total - 1);
        const safe = clampPage(page, total, pageSize);
        if (safe !== page) setPage(safe);
      }
    },
  });

  const notifications = query.data?.items ?? [];
  const meta = query.data?.meta;
  const unread = query.data?.unreadCount ?? 0;

  const openNotification = (notification: Notification) => {
    if (!notification.isRead) markRead.mutate(notification.id);
    const href = notificationHref(notification, user?.role);
    if (href) router.push(href);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          items={FILTERS.map((item) => ({ ...item }))}
          value={filter}
          onChange={setFilter}
        />
        <div className="flex items-center gap-2">
          {unread > 0 ? (
            <Badge tone="accent" dot>
              {unread} unread
            </Badge>
          ) : (
            <Badge tone="success" dot>
              All caught up
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll.mutate()}
            loading={markAll.isPending}
            disabled={unread === 0}
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Mark all read
          </Button>
        </div>
      </div>

      <PageSection
        title="Inbox"
        description={query.data ? "Order, payment and account updates." : "Loading…"}
        footer={
          <ListPagination
            page={meta?.page ?? page}
            pageCount={meta?.totalPages ?? 1}
            totalItems={meta?.total}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZES}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        }
      >
        {query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-none" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === "UNREAD" ? "Nothing unread" : "No notifications yet"}
            description={
              filter === "UNREAD"
                ? "You have read every notification. New order and payment updates will appear here."
                : "Order, payment and account updates will appear here."
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((notification) => {
              const notificationMeta =
                NOTIFICATION_META[notification.type] ?? NOTIFICATION_META.SYSTEM;
              return (
                <li
                  key={notification.id}
                  className={cn(
                    "flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:gap-4",
                    !notification.isRead && "relative",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openNotification(notification)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none ring-1 ring-inset",
                        notification.isRead
                          ? "bg-muted text-muted-foreground ring-border"
                          : "bg-accent-100 text-accent-800 ring-accent-200 dark:bg-accent-300/10 dark:text-accent-200 dark:ring-accent-300/20",
                      )}
                    >
                      <Bell className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={cn(
                            "text-sm",
                            notification.isRead ? "font-semibold" : "font-extrabold",
                          )}
                        >
                          {notification.title}
                        </p>
                        <Badge tone={notificationMeta.tone}>{notificationMeta.label}</Badge>
                        {!notification.isRead ? (
                          <span
                            className="h-2 w-2 rounded-none bg-accent-500"
                            aria-label="Unread"
                          />
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatRelative(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-1 self-end sm:self-start">
                    {!notification.isRead ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markRead.mutate(notification.id)}
                        loading={markRead.isPending && markRead.variables === notification.id}
                      >
                        <MailOpen className="h-3.5 w-3.5" aria-hidden="true" />
                        Mark read
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete notification"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setDeleting(notification)}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PageSection>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Delete this notification?"
        description="This notification will be removed from your inbox permanently."
        confirmLabel="Delete"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}
