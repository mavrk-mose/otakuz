"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types/shop";

export function getCartLineId(productId: string, selectedSize?: string): string {
  return selectedSize ? `${productId}::${selectedSize}` : productId;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  addToCart: (product: Product, selectedSize?: string, quantity?: number) => void;
  removeFromCart: (lineOrProductId: string) => void;
  updateQuantity: (lineOrProductId: string, quantity: number) => void;
  clearCart: () => void;
  removeItemsByIds: (productIds: string[]) => void;
}

function sumQuantities(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + Math.max(1, item.quantity || 1), 0);
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,

      addToCart: (product, selectedSize, quantity = 1) =>
        set((state) => {
          const targetKey = getCartLineId(product._id, selectedSize);
          const existingIndex = state.items.findIndex(
            (item) => getCartLineId(item._id, item.selectedSize) === targetKey
          );

          let nextItems: CartItem[];
          if (existingIndex >= 0) {
            nextItems = state.items.map((item, idx) =>
              idx === existingIndex
                ? {
                    ...item,
                    quantity: Math.min(
                      Math.max(1, product.stock || 99),
                      (item.quantity || 1) + quantity
                    ),
                  }
                : item
            );
          } else {
            nextItems = [
              ...state.items,
              {
                ...product,
                selectedSize,
                quantity: Math.max(1, quantity),
              },
            ];
          }

          return {
            items: nextItems,
            totalItems: sumQuantities(nextItems),
          };
        }),

      removeFromCart: (lineOrProductId) =>
        set((state) => {
          const nextItems = state.items.filter(
            (item) =>
              getCartLineId(item._id, item.selectedSize) !== lineOrProductId &&
              item._id !== lineOrProductId
          );
          return {
            items: nextItems,
            totalItems: sumQuantities(nextItems),
          };
        }),

      updateQuantity: (lineOrProductId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const filtered = state.items.filter(
              (item) =>
                getCartLineId(item._id, item.selectedSize) !== lineOrProductId &&
                item._id !== lineOrProductId
            );
            return {
              items: filtered,
              totalItems: sumQuantities(filtered),
            };
          }

          const nextItems = state.items.map((item) => {
            const matches =
              getCartLineId(item._id, item.selectedSize) === lineOrProductId ||
              item._id === lineOrProductId;
            if (!matches) return item;
            return {
              ...item,
              quantity: Math.min(Math.max(1, item.stock || 99), quantity),
            };
          });

          return {
            items: nextItems,
            totalItems: sumQuantities(nextItems),
          };
        }),

      removeItemsByIds: (productIds) =>
        set((state) => {
          const idSet = new Set(productIds);
          const nextItems = state.items.filter(
            (item) =>
              !idSet.has(item._id) &&
              !idSet.has(getCartLineId(item._id, item.selectedSize))
          );
          return {
            items: nextItems,
            totalItems: sumQuantities(nextItems),
          };
        }),

      clearCart: () => set({ items: [], totalItems: 0 }),
    }),
    {
      name: "cart-storage",
    }
  )
);
