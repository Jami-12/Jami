"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2, UserCog, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { ListPagination } from "@/components/dashboard/list-pagination";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Input, Select } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { clampPage, invalidateKeys } from "@/hooks/use-optimistic-mutation";
import { usersApi } from "@/lib/api/services";
import { queryKeys, relatedKeys } from "@/lib/query-keys";
import { formResolver } from "@/lib/form-resolver";
import { formatDate, getErrorMessage, getInitials, humanizeEnum } from "@/lib/utils";
import {
  createAdminSchema,
  updateUserSchema,
  type CreateAdminValues,
  type UpdateUserValues,
} from "@/lib/validations";
import { useAuthStore } from "@/stores/auth-store";
import type { Role, UserResponse, UserStatus } from "@/types";

const ROLES: Role[] = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"];
const ASSIGNABLE_ROLES: Role[] = ["CUSTOMER", "ADMIN"];
const STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "BLOCKED"];

const STATUS_TONE: Record<UserStatus, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  BLOCKED: "danger",
};

const ROLE_TONE: Record<Role, "neutral" | "info" | "accent"> = {
  CUSTOMER: "neutral",
  ADMIN: "info",
  SUPER_ADMIN: "accent",
};

const EMPTY_PROFILE: UpdateUserValues = {
  name: "",
  email: "",
  phone: "",
  image: "",
};

const EMPTY_ADMIN: CreateAdminValues = {
  name: "",
  email: "",
  password: "",
  phone: "",
};

function userLabel(user: UserResponse): string {
  return user.name || user.email;
}

export function UsersView() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(15);
  const [includeDeleted, setIncludeDeleted] = React.useState(false);
  const debounced = useDebouncedValue(search, 300);

  const [editing, setEditing] = React.useState<UserResponse | null>(null);
  const [editRole, setEditRole] = React.useState<Role>("CUSTOMER");
  const [editStatus, setEditStatus] = React.useState<UserStatus>("ACTIVE");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<UserResponse | null>(null);

  React.useEffect(
    () => setPage(1),
    [roleFilter, statusFilter, debounced, includeDeleted, sortOrder, limit],
  );

  const query = useQuery({
    queryKey: queryKeys.users.list({
      page,
      limit,
      role: roleFilter,
      status: statusFilter,
      search: debounced,
      includeDeleted,
      sortOrder,
    }),
    queryFn: () =>
      usersApi.list({
        page,
        limit,
        role: roleFilter === "ALL" ? undefined : (roleFilter as Role),
        status: statusFilter === "ALL" ? undefined : (statusFilter as UserStatus),
        search: debounced.trim() || undefined,
        includeDeleted,
        sortOrder,
      }),
  });

  const profileForm = useForm<UpdateUserValues>({
    resolver: formResolver<UpdateUserValues>(updateUserSchema),
    defaultValues: EMPTY_PROFILE,
  });

  const adminForm = useForm<CreateAdminValues>({
    resolver: formResolver<CreateAdminValues>(createAdminSchema),
    defaultValues: EMPTY_ADMIN,
  });

  const invalidate = () => invalidateKeys(queryClient, relatedKeys("users"));

  const openEdit = (user: UserResponse) => {
    setEditing(user);
    setEditRole(user.role);
    setEditStatus(user.status);
    profileForm.reset({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      image: user.image ?? "",
    });
  };

  const openCreate = () => {
    adminForm.reset(EMPTY_ADMIN);
    setCreateOpen(true);
  };

  const saveProfile = useMutation({
    mutationFn: async (values: UpdateUserValues) => {
      if (!editing) return null;
      const updated = await usersApi.update(editing.id, {
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        image: values.image || null,
      });

      if (editRole !== editing.role) {
        await usersApi.updateRole(editing.id, editRole);
      }
      if (editStatus !== editing.status) {
        await usersApi.updateStatus(editing.id, { status: editStatus });
      }
      return updated;
    },
    onSuccess: () => {
      toast.success("User updated");
      setEditing(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update the user")),
  });

  const createAdmin = useMutation({
    mutationFn: (values: CreateAdminValues) =>
      usersApi.createAdmin({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      }),
    onSuccess: (user) => {
      toast.success(`${user.name} can now sign in as an admin`);
      setCreateOpen(false);
      adminForm.reset(EMPTY_ADMIN);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not create the admin")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      toast.success("User deleted");
      setDeleting(null);
      const meta = query.data?.meta;
      if (meta) {
        const safe = clampPage(page, Math.max(0, meta.total - 1), limit);
        if (safe !== page) setPage(safe);
      }
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not delete the user")),
  });

  const rows = query.data?.items ?? [];
  const isSelf = (user: UserResponse) => user.id === currentUser?.id;
  const isProtected = (user: UserResponse) => user.role === "SUPER_ADMIN" || isSelf(user);

  const columns: DataColumn<UserResponse>[] = [
    {
      header: "User",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="h-full w-full object-cover" />
            ) : (
              getInitials(userLabel(user))
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">
              {userLabel(user)}
              {isSelf(user) ? <span className="ml-1 text-muted-foreground">(you)</span> : null}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (user) => (
        <Badge tone={ROLE_TONE[user.role]} dot>
          {humanizeEnum(user.role)}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (user) => (
        <div className="flex flex-col items-start gap-1">
          <Badge tone={STATUS_TONE[user.status]} dot>
            {humanizeEnum(user.status)}
          </Badge>
          {user.deletedAt ? (
            <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">Deleted</span>
          ) : null}
        </div>
      ),
    },
    {
      header: "Orders",
      cell: (user) => <span className="text-xs tabular-nums">{user.orderCount}</span>,
    },
    {
      header: "Provider",
      cell: (user) => (
        <span className="text-[11px] text-muted-foreground">{humanizeEnum(user.provider)}</span>
      ),
    },
    {
      header: "Joined",
      cell: (user) => (
        <span className="text-[11px] text-muted-foreground">{formatDate(user.createdAt)}</span>
      ),
    },
    {
      header: "",
      cell: (user) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${userLabel(user)}`}
            onClick={() => openEdit(user)}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${userLabel(user)}`}
            className="text-muted-foreground hover:text-red-600"
            disabled={isProtected(user) || Boolean(user.deletedAt)}
            onClick={() => setDeleting(user)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  const editingProtected = editing ? editing.role === "SUPER_ADMIN" || isSelf(editing) : false;

  return (
    <div className="space-y-4">
      <Card className="bg-muted/30">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Access control
            </p>
            <CardTitle className="font-display text-xl">Users</CardTitle>
            <CardDescription>Manage customers, admins and account access.</CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New admin
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Matching users"
          value={query.data?.meta.total ?? "—"}
          hint={`Page ${query.data?.meta.page ?? page} of ${query.data?.meta.totalPages ?? 1}`}
          icon={Users}
        />
        <StatCard
          label="Admins on this page"
          value={rows.filter((user) => user.role === "ADMIN").length}
          hint="Admin role assignment"
          icon={UserCog}
          tone="accent"
        />
        <StatCard
          label="Blocked on this page"
          value={rows.filter((user) => user.status === "BLOCKED").length}
          hint="Access is suspended"
          icon={Users}
          tone="danger"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Directory</CardTitle>
          <CardDescription>Search, filter, sort and page through user accounts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            items={[
              { value: "ALL", label: "All roles" },
              ...ROLES.map((role) => ({ value: role, label: humanizeEnum(role) })),
            ]}
            value={roleFilter}
            onChange={setRoleFilter}
          />
          <Separator />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="relative sm:col-span-2 xl:col-span-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email…"
                aria-label="Search users"
                className="pl-9"
              />
            </div>
            <FormField label="Status" htmlFor="user-status-filter">
              <Select
                id="user-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {humanizeEnum(status)}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Sort" htmlFor="user-sort">
              <Select
                id="user-sort"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as "asc" | "desc")}
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </Select>
            </FormField>
            <label className="flex items-center gap-2 self-end pb-2.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={includeDeleted}
                onChange={(event) => setIncludeDeleted(event.target.checked)}
              />
              Include deleted
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0 pb-4 pt-4 sm:px-0">
          <DataTable
            columns={columns}
            rows={rows}
            getKey={(user) => user.id}
            loading={query.isLoading}
            empty="No users match these filters."
          />
          <div className="px-4 sm:px-5">
            <ListPagination
              page={query.data?.meta.page ?? page}
              pageCount={query.data?.meta.totalPages ?? 1}
              totalItems={query.data?.meta.total ?? 0}
              pageSize={query.data?.meta.limit ?? limit}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setLimit(size);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit user"
        description={
          editingProtected
            ? "Super admin accounts and your own account are protected. Profile details can still be updated."
            : "Update profile details, role and account access."
        }
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(null)}
              disabled={saveProfile.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" form="user-form" size="sm" loading={saveProfile.isPending}>
              Save changes
            </Button>
          </>
        }
      >
        <form
          id="user-form"
          onSubmit={profileForm.handleSubmit((values) => saveProfile.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <FormField
            label="Name"
            htmlFor="user-name"
            required
            error={profileForm.formState.errors.name?.message}
          >
            <Input
              id="user-name"
              invalid={Boolean(profileForm.formState.errors.name)}
              {...profileForm.register("name")}
            />
          </FormField>
          <FormField
            label="Email"
            htmlFor="user-email"
            required
            error={profileForm.formState.errors.email?.message}
          >
            <Input
              id="user-email"
              type="email"
              invalid={Boolean(profileForm.formState.errors.email)}
              {...profileForm.register("email")}
            />
          </FormField>
          <FormField label="Phone" htmlFor="user-phone" error={profileForm.formState.errors.phone?.message}>
            <Input id="user-phone" {...profileForm.register("phone")} />
          </FormField>
          <FormField label="Image URL" htmlFor="user-image" error={profileForm.formState.errors.image?.message}>
            <Input id="user-image" type="url" placeholder="https://…" {...profileForm.register("image")} />
          </FormField>
          <FormField
            label="Role"
            htmlFor="user-role"
            hint={
              editing?.role === "SUPER_ADMIN"
                ? "Super admin roles cannot be changed here."
                : "Only customer and admin roles can be assigned."
            }
          >
            <Select
              id="user-role"
              value={editRole}
              disabled={editingProtected}
              onChange={(event) => setEditRole(event.target.value as Role)}
            >
              {editing?.role === "SUPER_ADMIN" ? <option value="SUPER_ADMIN">Super admin</option> : null}
              {ASSIGNABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {humanizeEnum(role)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="Account status"
            htmlFor="user-status"
            hint={editing && isSelf(editing) ? "You cannot change your own status." : undefined}
          >
            <Select
              id="user-status"
              value={editStatus}
              disabled={Boolean(editing && isSelf(editing))}
              onChange={(event) => setEditStatus(event.target.value as UserStatus)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {humanizeEnum(status)}
                </option>
              ))}
            </Select>
          </FormField>
        </form>
      </Dialog>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create admin account"
        description="Admins can manage the catalogue, orders, inventory, coupons, reviews and expenses."
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(false)}
              disabled={createAdmin.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" form="create-admin-form" size="sm" loading={createAdmin.isPending}>
              Create admin
            </Button>
          </>
        }
      >
        <form
          id="create-admin-form"
          onSubmit={adminForm.handleSubmit((values) => createAdmin.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <FormField label="Name" htmlFor="admin-name" required error={adminForm.formState.errors.name?.message}>
            <Input
              id="admin-name"
              invalid={Boolean(adminForm.formState.errors.name)}
              {...adminForm.register("name")}
            />
          </FormField>
          <FormField label="Email" htmlFor="admin-email" required error={adminForm.formState.errors.email?.message}>
            <Input
              id="admin-email"
              type="email"
              invalid={Boolean(adminForm.formState.errors.email)}
              {...adminForm.register("email")}
            />
          </FormField>
          <FormField
            label="Temporary password"
            htmlFor="admin-password"
            required
            hint="At least 8 characters with a letter and a number."
            error={adminForm.formState.errors.password?.message}
          >
            <Input
              id="admin-password"
              type="password"
              autoComplete="new-password"
              invalid={Boolean(adminForm.formState.errors.password)}
              {...adminForm.register("password")}
            />
          </FormField>
          <FormField label="Phone" htmlFor="admin-phone" error={adminForm.formState.errors.phone?.message}>
            <Input id="admin-phone" {...adminForm.register("phone")} />
          </FormField>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Delete this user?"
        description="The account is soft-deleted and can no longer sign in. Existing orders remain in the records."
        confirmLabel="Delete user"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}
