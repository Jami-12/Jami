"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageSection } from "@/components/dashboard/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField, Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { addressesApi } from "@/lib/api/services";
import { getErrorMessage } from "@/lib/utils";
import { addressSchema, type AddressValues } from "@/lib/validations";
import type { Address } from "@/types";

const EMPTY: AddressValues = {
  fullName: "",
  phone: "",
  division: "",
  district: "",
  area: "",
  addressLine: "",
  postalCode: "",
  isDefault: false,
};

export function AddressBook() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = React.useState<Address | null>(null);
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Address | null>(null);

  const query = useQuery({
    queryKey: ["addresses"],
    queryFn: addressesApi.list,
    staleTime: 30_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY,
  });

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY);
    setOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    reset({
      fullName: address.fullName,
      phone: address.phone,
      division: address.division ?? "",
      district: address.district,
      area: address.area ?? "",
      addressLine: address.addressLine,
      postalCode: address.postalCode ?? "",
      isDefault: address.isDefault,
    });
    setOpen(true);
  };

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["addresses"] });

  const save = useMutation({
    mutationFn: (values: AddressValues) => {
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        division: values.division || undefined,
        district: values.district,
        area: values.area || undefined,
        addressLine: values.addressLine,
        postalCode: values.postalCode || undefined,
        isDefault: values.isDefault,
      };
      return editing
        ? addressesApi.update(editing.id, payload)
        : addressesApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Address updated" : "Address added");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not save the address")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => addressesApi.remove(id),
    onSuccess: () => {
      toast.success("Address removed");
      setDeleting(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not remove the address")),
  });

  const makeDefault = useMutation({
    mutationFn: (id: string) => addressesApi.update(id, { isDefault: true }),
    onSuccess: () => {
      toast.success("Default address updated");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update the default address")),
  });

  const addresses = query.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add address
        </Button>
      </div>

      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No delivery addresses"
          description="Add an address so checkout can pre-fill your delivery details."
          action={<Button onClick={openCreate}>Add your first address</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {addresses.map((address) => (
            <PageSection key={address.id} className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{address.fullName}</p>
                  <p className="text-xs text-muted-foreground">{address.phone}</p>
                </div>
                {address.isDefault ? (
                  <Badge tone="success" dot>
                    Default
                  </Badge>
                ) : null}
              </div>
              <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                {address.addressLine}
                {address.area ? `, ${address.area}` : ""}
                <br />
                {address.district}
                {address.division ? `, ${address.division}` : ""}
                {address.postalCode ? ` ${address.postalCode}` : ""}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
                <Button variant="ghost" size="sm" onClick={() => openEdit(address)}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </Button>
                {!address.isDefault ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={makeDefault.isPending && makeDefault.variables === address.id}
                    onClick={() => makeDefault.mutate(address.id)}
                  >
                    <Star className="h-3.5 w-3.5" aria-hidden="true" />
                    Make default
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
                  onClick={() => setDeleting(address)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Remove
                </Button>
              </div>
            </PageSection>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit address" : "Add address"}
        description="We use this address for delivery and receipts."
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="address-form"
              size="sm"
              loading={save.isPending}
            >
              {editing ? "Save changes" : "Add address"}
            </Button>
          </>
        }
      >
        <form
          id="address-form"
          onSubmit={handleSubmit((values) => save.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <FormField label="Full name" htmlFor="address-name" required error={errors.fullName?.message}>
            <Input id="address-name" autoComplete="name" invalid={Boolean(errors.fullName)} {...register("fullName")} />
          </FormField>
          <FormField label="Phone" htmlFor="address-phone" required error={errors.phone?.message}>
            <Input id="address-phone" type="tel" autoComplete="tel" invalid={Boolean(errors.phone)} {...register("phone")} />
          </FormField>
          <FormField label="Division" htmlFor="address-division" error={errors.division?.message}>
            <Input id="address-division" autoComplete="address-level1" {...register("division")} />
          </FormField>
          <FormField label="District" htmlFor="address-district" required error={errors.district?.message}>
            <Input id="address-district" autoComplete="address-level2" invalid={Boolean(errors.district)} {...register("district")} />
          </FormField>
          <FormField label="Area" htmlFor="address-area" error={errors.area?.message}>
            <Input id="address-area" autoComplete="address-level3" {...register("area")} />
          </FormField>
          <FormField label="Postal code" htmlFor="address-postal" error={errors.postalCode?.message}>
            <Input id="address-postal" autoComplete="postal-code" {...register("postalCode")} />
          </FormField>
          <FormField
            label="Street address"
            htmlFor="address-line"
            required
            error={errors.addressLine?.message}
            className="sm:col-span-2"
          >
            <Input
              id="address-line"
              autoComplete="street-address"
              placeholder="House, road, apartment…"
              invalid={Boolean(errors.addressLine)}
              {...register("addressLine")}
            />
          </FormField>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" className="h-4 w-4 rounded border-border" {...register("isDefault")} />
            Use as my default delivery address
          </label>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Remove this address?"
        description="You can add it again later, but orders already placed keep their delivery details."
        confirmLabel="Remove address"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}
