"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Boxes, History, PackageSearch, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type DataColumn } from "@/components/dashboard/data-table";
import { PageSection } from "@/components/dashboard/page-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField, Input, Select, Textarea } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Price } from "@/components/ui/price";
import { ProductStatusBadge } from "@/components/ui/status-badge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { inventoryApi } from "@/lib/api/services";
import { INVENTORY_MOVEMENTS, INVENTORY_MOVEMENT_LABEL } from "@/lib/constants";
import { formatDate, formatNumber, getErrorMessage, humanizeEnum } from "@/lib/utils";
import type { InventoryItem, InventoryLog } from "@/types";

export function InventoryAdmin() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [lowStockOnly, setLowStockOnly] = React.useState(false);
  const debounced = useDebouncedValue(search, 300);
  const [adjusting, setAdjusting] = React.useState<InventoryItem | null>(null);
  const [logsFor, setLogsFor] = React.useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = React.useState("STOCK_IN");
  const [quantity, setQuantity] = React.useState("1");
  const [reason, setReason] = React.useState("");

  React.useEffect(() => setPage(1), [debounced, lowStockOnly]);

  const overview = useQuery({
    queryKey: ["inventory", "overview"],
    queryFn: inventoryApi.overview,
    staleTime: 60_000,
  });

  const query = useQuery({
    queryKey: ["inventory", { page, search: debounced, lowStockOnly }],
    queryFn: () =>
      inventoryApi.list({
        page,
        limit: 15,
        search: debounced.trim() || undefined,
        lowStockOnly: lowStockOnly || undefined,
        sortBy: "stock",
        sortOrder: "asc",
      }),
  });

  const logs = useQuery({
    queryKey: ["inventory", "logs", logsFor?.id],
    queryFn: () => inventoryApi.logs({ productId: logsFor?.id, limit: 20 }),
    enabled: Boolean(logsFor),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["inventory"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  };

  const adjust = useMutation({
    mutationFn: () => {
      if (!adjusting) throw new Error("No product selected");
      return inventoryApi.adjust(adjusting.id, {
        movementType,
        quantity: Number(quantity),
        reason: reason.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Stock adjusted");
      setAdjusting(null);
      setQuantity("1");
      setReason("");
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not adjust stock")),
  });

  const rows = query.data?.items ?? [];

  const columns: DataColumn<InventoryItem>[] = [
    {
      header: "Product",
      cell: (item) => (
        <div>
          <p className="text-xs font-bold">{item.title}</p>
          <p className="text-[11px] text-muted-foreground">
            {item.sku} · {item.category.name}
          </p>
        </div>
      ),
    },
    {
      header: "Stock",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span
            className={
              item.isOutOfStock
                ? "font-extrabold text-red-600 dark:text-red-400"
                : item.isLowStock
                  ? "font-extrabold text-amber-600 dark:text-amber-400"
                  : "font-bold"
            }
          >
            {item.stock}
          </span>
          {item.isLowStock || item.isOutOfStock ? (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" aria-label="Needs restocking" />
          ) : null}
        </div>
      ),
    },
    { header: "Min", cell: (item) => <span className="text-xs">{item.minimumStockLevel}</span> },
    {
      header: "Cost value",
      cell: (item) => <Price amount={item.stockValue} size="sm" />,
    },
    {
      header: "Resale value",
      cell: (item) => <Price amount={item.potentialSellingValue} size="sm" />,
    },
    { header: "Status", cell: (item) => <ProductStatusBadge status={item.status} /> },
    {
      header: "",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setLogsFor(item)}>
            <History className="h-3.5 w-3.5" aria-hidden="true" />
            Logs
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAdjusting(item)}>
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Adjust
          </Button>
        </div>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total units"
          value={overview.data ? formatNumber(overview.data.totalUnits) : "—"}
          hint={`${overview.data?.totalProducts ?? 0} products`}
          icon={Boxes}
        />
        <StatCard
          label="Cost value"
          value={<Price amount={overview.data?.inventoryCostValue ?? 0} size="lg" />}
          hint="At purchase price"
          tone="accent"
        />
        <StatCard
          label="Resale value"
          value={<Price amount={overview.data?.potentialSellingValue ?? 0} size="lg" />}
          hint="At selling price"
          tone="success"
        />
        <StatCard
          label="Low stock"
          value={overview.data?.lowStockCount ?? "—"}
          hint={`${overview.data?.outOfStockCount ?? 0} out of stock`}
          icon={AlertTriangle}
          tone={overview.data && overview.data.lowStockCount > 0 ? "warning" : "success"}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product or SKU…"
              aria-label="Search inventory"
              className="pl-9"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={lowStockOnly}
              onChange={(event) => setLowStockOnly(event.target.checked)}
            />
            Low stock only
          </label>
        </div>
      </div>

      <PageSection>
        <DataTable
          columns={columns}
          rows={rows}
          getKey={(item) => item.id}
          loading={query.isLoading}
          empty="No inventory rows match these filters."
        />
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {query.data ? `${query.data.meta.total} product${query.data.meta.total === 1 ? "" : "s"}` : "—"}
          </p>
          <Pagination
            page={query.data?.meta.page ?? 1}
            totalPages={query.data?.meta.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      </PageSection>

      <Dialog
        open={Boolean(adjusting)}
        onClose={() => setAdjusting(null)}
        title="Adjust stock"
        description={adjusting ? `${adjusting.title} · currently ${adjusting.stock} units` : undefined}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAdjusting(null)} disabled={adjust.isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={adjust.isPending}
              onClick={() => adjust.mutate()}
              disabled={movementType !== "ADJUSTMENT" && Number(quantity) <= 0}
            >
              Apply adjustment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Movement type" htmlFor="inventory-movement">
            <Select
              id="inventory-movement"
              value={movementType}
              onChange={(event) => setMovementType(event.target.value)}
            >
              {INVENTORY_MOVEMENTS.filter((movement) =>
                ["STOCK_IN", "STOCK_OUT", "ADJUSTMENT"].includes(movement),
              ).map((movement) => (
                <option key={movement} value={movement}>
                  {INVENTORY_MOVEMENT_LABEL[movement]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            label={movementType === "ADJUSTMENT" ? "New stock level" : "Quantity"}
            htmlFor="inventory-quantity"
            hint={
              movementType === "ADJUSTMENT"
                ? "Sets the stock to this absolute value."
                : "Added to or removed from the current stock."
            }
          >
            <Input
              id="inventory-quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </FormField>
          <FormField label="Reason" htmlFor="inventory-reason" hint="Stored on the inventory audit log.">
            <Textarea
              id="inventory-reason"
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Supplier delivery, damage, stock count correction…"
            />
          </FormField>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(logsFor)}
        onClose={() => setLogsFor(null)}
        title="Inventory history"
        description={logsFor?.title}
        size="lg"
        footer={
          <Button variant="outline" size="sm" onClick={() => setLogsFor(null)}>
            Close
          </Button>
        }
      >
        {logs.isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading history…</p>
        ) : (logs.data?.items.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <PackageSearch className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-semibold">No stock movements recorded yet</p>
            <p className="text-xs text-muted-foreground">
              Adjustments, sales and returns will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {logs.data?.items.map((log: InventoryLog) => (
              <li key={log.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-xs font-bold">{humanizeEnum(log.movementType)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {log.reason || "No reason recorded"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(log.createdAt, "long")}</p>
                </div>
                <span className="whitespace-nowrap text-xs font-semibold tabular-nums">
                  {log.previousStock} → {log.newStock}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Dialog>
    </div>
  );
}
