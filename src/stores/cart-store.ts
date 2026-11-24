"use client";

import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { apiRequest } from "@/lib/api/client";
import { cartApi } from "@/lib/api/services";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Cart, Paginated, Product } from "@/types";

export interface CartLine {
  productId: string;
  cartItemId?: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  originalPrice: number;
  quantity: number;
  stock: number;
  selectedSize: string | null;
  selectedColor: string | null;
}

export interface CartLineInput {
  productId: string;
  slug: string;
  name: string;
  image?: string | null;
  price: number;
  originalPrice?: number;
  quantity?: number;
  stock?: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
}

export interface CartVariantSelection {
  size?: string | null;
  color?: string | null;
}

interface CartState {
  items: CartLine[];
  syncing: boolean;
  hydrated: boolean;
  addItem: (
    product: Product | CartLineInput,
    quantity?: number,
    variants?: CartVariantSelection,
  ) => Promise<boolean>;
  updateQuantity: (itemKey: string, quantity: number) => Promise<void>;
  removeItem: (itemKey: string) => Promise<void>;
  clear: () => Promise<void>;
  syncFromServer: () => Promise<void>;
  refreshLocalPrices: () => Promise<void>;
  reset: () => void;
  setHydrated: (value: boolean) => void;
}

const MAX_QUANTITY = 99;
const PRICE_REFRESH_TTL_MS = 60_000;
const MAX_BATCH_IDS = 100;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let lastPriceRefresh = 0;

/**
 * One request for a set of product ids instead of one GET per id. The API
 * accepts a comma-separated `ids` query and caps the list at 100.
 */
export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  const unique = Array.from(
    new Set(ids.filter((id) => UUID_PATTERN.test(id))),
  ).slice(0, MAX_BATCH_IDS);

  if (!unique.length) return [];

  const result = await apiRequest<Paginated<Product>>({
    method: "GET",
    url: "/products",
    params: { ids: unique.join(","), limit: unique.length },
  });

  return result.items;
}

function isCustomer(): boolean {
  return useAuthStore.getState().user?.role === "CUSTOMER";
}

function normaliseVariant(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Stable local identity that matches the server's composite cart-item key. */
export function cartLineKey(line: Pick<CartLine, "productId" | "selectedSize" | "selectedColor">): string {
  return [
    line.productId,
    normaliseVariant(line.selectedSize) ?? "",
    normaliseVariant(line.selectedColor) ?? "",
  ].join("::");
}

function findLine(items: CartLine[], key: string): CartLine | undefined {
  return items.find(
    (item) => item.cartItemId === key || cartLineKey(item) === key,
  );
}

function mapProduct(product: Product, variants: CartVariantSelection = {}): CartLine {
  const image =
    product.images.find((item) => item.isPrimary)?.url ??
    product.images[0]?.url ??
    product.thumbnail ??
    null;

  return {
    productId: product.id,
    slug: product.slug,
    name: product.title || product.name,
    image,
    price: product.finalPrice,
    originalPrice: product.originalPrice,
    quantity: 1,
    stock: product.stock,
    selectedSize: normaliseVariant(variants.size),
    selectedColor: normaliseVariant(variants.color),
  };
}

function toLine(input: CartLineInput): CartLine {
  return {
    productId: input.productId,
    slug: input.slug,
    name: input.name,
    image: input.image ?? null,
    price: input.price,
    originalPrice: input.originalPrice ?? input.price,
    quantity: input.quantity ?? 1,
    stock: input.stock ?? MAX_QUANTITY,
    selectedSize: normaliseVariant(input.selectedSize),
    selectedColor: normaliseVariant(input.selectedColor),
  };
}

function mapServerCart(cart: Cart): CartLine[] {
  return cart.items.map((item) => ({
    productId: item.productId,
    cartItemId: item.id,
    slug: item.product.slug,
    name: item.product.title,
    image: item.product.image,
    price: item.finalUnitPrice,
    originalPrice: item.originalPrice,
    quantity: item.quantity,
    stock: item.product.stock,
    selectedSize: normaliseVariant(item.selectedSize),
    selectedColor: normaliseVariant(item.selectedColor),
  }));
}

function clampQuantity(quantity: number, stock: number): number {
  return Math.max(1, Math.min(quantity, Math.max(1, Math.min(stock, MAX_QUANTITY))));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      syncing: false,
      hydrated: false,

      addItem: async (product, quantity = 1, variants = {}) => {
        const line = "id" in product
          ? mapProduct(product, variants)
          : toLine({ ...product,
              selectedSize: product.selectedSize ?? variants.size,
              selectedColor: product.selectedColor ?? variants.color,
            });
        const requested = clampQuantity(quantity, line.stock);
        const key = cartLineKey(line);
        const existing = findLine(get().items, key);

        if (isCustomer()) {
          set({ syncing: true });
          try {
            const cart = await cartApi.add({
              productId: line.productId,
              quantity: requested,
              selectedSize: line.selectedSize ?? "",
              selectedColor: line.selectedColor ?? "",
            });
            set({ items: mapServerCart(cart), syncing: false });
            toast.success(`${line.name} added to your bag`);
            return true;
          } catch (error) {
            set({ syncing: false });
            toast.error(getErrorMessage(error, "Could not add this item to your bag"));
            return false;
          }
        }

        set({
          items: existing
            ? get().items.map((item) =>
                cartLineKey(item) === key
                  ? {
                      ...item,
                      quantity: clampQuantity(item.quantity + requested, item.stock),
                    }
                  : item,
              )
            : [...get().items, { ...line, quantity: requested }],
        });
        toast.success(`${line.name} added to your bag`);
        return true;
      },

      updateQuantity: async (itemKey, quantity) => {
        const line = findLine(get().items, itemKey);
        if (!line) return;
        const next = clampQuantity(quantity, line.stock);

        if (isCustomer()) {
          set({ syncing: true });
          try {
            const cart = await cartApi.update(line.cartItemId ?? cartLineKey(line), next);
            set({ items: mapServerCart(cart), syncing: false });
          } catch (error) {
            set({ syncing: false });
            toast.error(getErrorMessage(error, "Could not update your bag"));
          }
          return;
        }

        set({
          items: get().items.map((item) =>
            cartLineKey(item) === cartLineKey(line) ? { ...item, quantity: next } : item,
          ),
        });
      },

      removeItem: async (itemKey) => {
        const line = findLine(get().items, itemKey);
        if (!line) return;

        if (isCustomer()) {
          set({ syncing: true });
          try {
            const cart = await cartApi.remove(line.cartItemId ?? cartLineKey(line));
            set({ items: mapServerCart(cart), syncing: false });
          } catch (error) {
            set({ syncing: false });
            toast.error(getErrorMessage(error, "Could not remove this item"));
          }
          return;
        }

        set({
          items: get().items.filter(
            (item) => cartLineKey(item) !== cartLineKey(line),
          ),
        });
        toast.success(`${line.name} removed from your bag`);
      },

      clear: async () => {
        const previous = get().items;

        if (!isCustomer()) {
          set({ items: [] });
          return;
        }

        // Clear immediately for responsive UI, then reconcile with the API.
        // A failed write restores the previous bag instead of silently dropping it.
        set({ items: [], syncing: true });
        try {
          await cartApi.clear();
          set({ syncing: false });
        } catch (error) {
          set({ items: previous, syncing: false });
          toast.error(getErrorMessage(error, "Could not clear your bag"));
        }
      },

      syncFromServer: async () => {
        if (!isCustomer()) return;
        set({ syncing: true });
        try {
          const cart = await cartApi.get();
          set({ items: mapServerCart(cart), syncing: false });
        } catch {
          set({ syncing: false });
        }
      },

      refreshLocalPrices: async () => {
        // Logged-in customers use the server cart, which is already priced.
        if (isCustomer() || !get().items.length) return;

        const now = Date.now();
        if (now - lastPriceRefresh < PRICE_REFRESH_TTL_MS) return;
        lastPriceRefresh = now;

        const ids = Array.from(new Set(get().items.map((item) => item.productId)));

        try {
          const products = await fetchProductsByIds(ids);
          if (!products.length) return;

          const byId = new Map(products.map((product) => [product.id, product]));

          set({
            items: get().items.map((item) => {
              const product = byId.get(item.productId);
              if (!product) return item;

              return {
                ...item,
                price: product.finalPrice,
                originalPrice: product.originalPrice,
                stock: product.stock,
              };
            }),
          });
        } catch {
          // A failed price refresh leaves the persisted prices untouched.
        }
      },

      reset: () => set({ items: [] }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "store-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function cartItemCount(items: CartLine[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotal(items: CartLine[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
