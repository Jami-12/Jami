"use client";

import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { cartApi } from "@/lib/api/services";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Cart, Product } from "@/types";

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
}

interface CartState {
  items: CartLine[];
  syncing: boolean;
  hydrated: boolean;
  addItem: (product: Product | CartLineInput, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  syncFromServer: () => Promise<void>;
  reset: () => void;
  setHydrated: (value: boolean) => void;
}

const MAX_QUANTITY = 99;

function isCustomer(): boolean {
  return useAuthStore.getState().user?.role === "CUSTOMER";
}

function mapProduct(product: Product): CartLine {
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

      addItem: async (product, quantity = 1) => {
        const line = "id" in product ? mapProduct(product) : toLine(product);
        const requested = clampQuantity(quantity, line.stock);
        const existing = get().items.find((item) => item.productId === line.productId);

        if (isCustomer()) {
          set({ syncing: true });
          try {
            const cart = await cartApi.add({
              productId: line.productId,
              quantity: requested,
            });
            set({ items: mapServerCart(cart), syncing: false });
            toast.success(`${line.name} added to your bag`);
            return;
          } catch (error) {
            set({ syncing: false });
            toast.error(getErrorMessage(error, "Could not add this item to your bag"));
            return;
          }
        }

        set({
          items: existing
            ? get().items.map((item) =>
                item.productId === line.productId
                  ? {
                      ...item,
                      quantity: clampQuantity(item.quantity + requested, item.stock),
                    }
                  : item,
              )
            : [...get().items, { ...line, quantity: requested }],
        });
        toast.success(`${line.name} added to your bag`);
      },

      updateQuantity: async (productId, quantity) => {
        const line = get().items.find((item) => item.productId === productId);
        if (!line) return;
        const next = clampQuantity(quantity, line.stock);

        if (isCustomer()) {
          set({ syncing: true });
          try {
            const cart = await cartApi.update(line.cartItemId ?? productId, next);
            set({ items: mapServerCart(cart), syncing: false });
          } catch (error) {
            set({ syncing: false });
            toast.error(getErrorMessage(error, "Could not update your bag"));
          }
          return;
        }

        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity: next } : item,
          ),
        });
      },

      removeItem: async (productId) => {
        const line = get().items.find((item) => item.productId === productId);

        if (isCustomer()) {
          set({ syncing: true });
          try {
            const cart = await cartApi.remove(line?.cartItemId ?? productId);
            set({ items: mapServerCart(cart), syncing: false });
          } catch (error) {
            set({ syncing: false });
            toast.error(getErrorMessage(error, "Could not remove this item"));
          }
          return;
        }

        set({ items: get().items.filter((item) => item.productId !== productId) });
        if (line) toast.success(`${line.name} removed from your bag`);
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
