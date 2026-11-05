"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { PageSection } from "@/components/dashboard/page-section";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Input, Textarea } from "@/components/ui/input";
import { SmartImage } from "@/components/ui/smart-image";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { brandsApi, categoriesApi } from "@/lib/api/services";
import { formResolver } from "@/lib/form-resolver";
import { getErrorMessage } from "@/lib/utils";
import { brandSchema, categorySchema } from "@/lib/validations";
import type { Brand, Category } from "@/types";

type Mode = "categories" | "brands";
type Item = Category | Brand;

type TaxonomyFormValues = {
  name: string;
  slug: string;
  description: string;
  image: string;
  logo: string;
};

const EMPTY: TaxonomyFormValues = { name: "", slug: "", description: "", image: "", logo: "" };

function isCategory(item: Item): item is Category {
  return "productCount" in item && "image" in item;
}

export function TaxonomyAdmin({ mode }: { mode: Mode }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const debounced = useDebouncedValue(search, 300);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [deleting, setDeleting] = React.useState<Item | null>(null);

  const queryKey = [mode] as const;
  const query = useQuery<Item[]>({
    queryKey: [...queryKey, debounced],
    queryFn: async (): Promise<Item[]> =>
      mode === "categories"
        ? categoriesApi.list(debounced.trim() || undefined)
        : brandsApi.list(debounced.trim() || undefined),
    staleTime: 60_000,
  });

  const form = useForm<TaxonomyFormValues>({
    resolver: formResolver<TaxonomyFormValues>(
      mode === "categories" ? categorySchema : brandSchema,
    ),
    defaultValues: EMPTY,
  });

  const { register, handleSubmit, reset, formState: { errors } } = form;

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY);
    setOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    reset({
      name: item.name,
      slug: item.slug,
      description: item.description ?? "",
      image: isCategory(item) ? (item.image ?? "") : "",
      logo: isCategory(item) ? "" : ((item as Brand).logo ?? ""),
    });
    setOpen(true);
  };

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [mode] });
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
    void queryClient.invalidateQueries({ queryKey: ["brands"] });
  };

  const save = useMutation<Category | Brand, Error, TaxonomyFormValues>({
    mutationFn: (values) => {
      if (mode === "categories") {
        const payload = {
          name: values.name,
          slug: values.slug || undefined,
          description: values.description || null,
          image: values.image || null,
        };
        return editing
          ? categoriesApi.update(editing.id, payload)
          : categoriesApi.create(payload);
      }
      const payload = {
        name: values.name,
        slug: values.slug || undefined,
        description: values.description || null,
        logo: values.logo || null,
      };
      return editing ? brandsApi.update(editing.id, payload) : brandsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Saved" : "Created");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not save")),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      mode === "categories" ? categoriesApi.remove(id) : brandsApi.remove(id),
    onSuccess: () => {
      toast.success("Deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not delete")),
  });

  const rows = query.data ?? [];
  const label = mode === "categories" ? "category" : "brand";

  const columns: DataColumn<Item>[] = [
    {
      header: mode === "categories" ? "Category" : "Brand",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
            <SmartImage
              src={
                isCategory(item)
                  ? (item.image ?? null)
                  : ((item as Brand).logo ?? null)
              }
              alt={item.name}
              fill
              sizes="36px"
              className="object-cover"
            />
          </span>
          <div>
            <p className="text-xs font-bold">{item.name}</p>
            <p className="text-[11px] text-muted-foreground">/{item.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Products",
      cell: (item) => <span className="font-semibold">{item.productCount}</span>,
    },
    {
      header: "Description",
      cell: (item) => (
        <span className="line-clamp-1 max-w-72 text-xs text-muted-foreground">
          {item.description || "—"}
        </span>
      ),
    },
    {
      header: "",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label={`Edit ${item.name}`} onClick={() => openEdit(item)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${item.name}`}
            className="text-muted-foreground hover:text-red-600"
            onClick={() => setDeleting(item)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${mode}…`}
            aria-label={`Search ${mode}`}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New {label}
        </Button>
      </div>

      <PageSection>
        <DataTable
          columns={columns}
          rows={rows}
          getKey={(item) => item.id}
          loading={query.isLoading}
          empty={`No ${mode} yet.`}
        />
      </PageSection>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${label}` : `New ${label}`}
        description={
          mode === "categories"
            ? "Categories organise the storefront navigation."
            : "Brands power the maker and vendor filters."
        }
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="taxonomy-form" size="sm" loading={save.isPending}>
              {editing ? "Save changes" : `Create ${label}`}
            </Button>
          </>
        }
      >
        <form
          id="taxonomy-form"
          onSubmit={handleSubmit((values) => save.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <FormField label="Name" htmlFor="taxonomy-name" required error={errors.name?.message}>
            <Input id="taxonomy-name" invalid={Boolean(errors.name)} {...register("name")} />
          </FormField>
          <FormField label="Slug" htmlFor="taxonomy-slug" hint="Generated automatically when blank." error={errors.slug?.message}>
            <Input id="taxonomy-slug" {...register("slug")} />
          </FormField>
          {mode === "categories" ? (
            <FormField label="Image URL" htmlFor="taxonomy-image">
              <Input id="taxonomy-image" type="url" placeholder="https://…" {...register("image")} />
            </FormField>
          ) : (
            <FormField label="Logo URL" htmlFor="taxonomy-logo">
              <Input id="taxonomy-logo" type="url" placeholder="https://…" {...register("logo")} />
            </FormField>
          )}
          <FormField label="Description" htmlFor="taxonomy-description" error={errors.description?.message}>
            <Textarea id="taxonomy-description" rows={3} {...register("description")} />
          </FormField>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title={`Delete this ${label}?`}
        description={
          mode === "categories"
            ? "Categories with products cannot be deleted until those products are reassigned."
            : "Brands with products cannot be deleted until those products are reassigned."
        }
        confirmLabel="Delete"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}
