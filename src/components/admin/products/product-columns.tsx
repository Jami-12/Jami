"use client";

import Link from "next/link";
import { ImageIcon, MoreHorizontal, Pencil, Star, StarOff, Trash2 } from "lucide-react";

import type { DataColumn } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Price } from "@/components/ui/price";
import { SmartImage } from "@/components/ui/smart-image";
import { Switch } from "@/components/ui/switch";
import { humanizeEnum } from "@/lib/utils";
import type { Product } from "@/types";
import { productImage, productName } from "@/types";

export interface ProductColumnActions {
  statusPendingId: string | null;
  featuredPendingId: string | null;
  onToggleStatus: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
  onManageImages: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function productColumns({
  statusPendingId,
  featuredPendingId,
  onToggleStatus,
  onToggleFeatured,
  onManageImages,
  onDelete,
}: ProductColumnActions): DataColumn<Product>[] {
  return [
    {
      header: "Product",
      cell: (product) => (
        <div className="flex items-center gap-3">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-none bg-muted">
            <SmartImage
              src={productImage(product)}
              alt={productName(product)}
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">{productName(product)}</p>
            <p className="text-[11px] text-muted-foreground">
              {product.sku} · {product.category.name}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Price",
      cell: (product) => (
        <Price amount={product.finalPrice} compareAt={product.originalPrice} size="sm" />
      ),
    },
    {
      header: "Stock",
      cell: (product) => (
        <span
          className={
            product.stock === 0
              ? "font-bold text-danger"
              : product.stock <= product.minimumStockLevel
                ? "font-bold text-warning"
                : "font-semibold text-success"
          }
        >
          {product.stock}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (product) => {
        const active = product.status === "ACTIVE";
        const draft = product.status === "DRAFT";
        return (
          <div className="flex items-center gap-2.5">
            <Switch
              checked={active}
              disabled={draft}
              loading={statusPendingId === product.id}
              onCheckedChange={() => onToggleStatus(product)}
              aria-label={
                active ? `Disable ${productName(product)}` : `Enable ${productName(product)}`
              }
            />
            <Badge tone={active ? "success" : draft ? "warning" : "neutral"} dot>
              {humanizeEnum(product.status)}
            </Badge>
          </div>
        );
      },
    },
    {
      header: "Featured",
      cell: (product) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={product.isFeatured ? "Remove from featured" : "Mark as featured"}
          onClick={() => onToggleFeatured(product)}
          disabled={featuredPendingId === product.id}
        >
          {product.isFeatured ? (
            <Star className="h-4 w-4 fill-muted-foreground text-muted-foreground" aria-hidden="true" />
          ) : (
            <StarOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
        </Button>
      ),
    },
    {
      header: "Actions",
      cell: (product) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Actions for ${productName(product)}`}
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/products/${product.id}/edit`}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit product
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageImages(product)}>
                <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Manage images
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-muted-foreground focus:text-foreground"
                onClick={() => onDelete(product)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];
}
