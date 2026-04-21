"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  price_usd: number;
  category: string;
  addedAt: number;
};

type WishlistState = {
  items: WishlistItem[];
  add: (item: Omit<WishlistItem, "addedAt">) => void;
  remove: (productId: string) => void;
  toggle: (item: Omit<WishlistItem, "addedAt">) => boolean;
  has: (productId: string) => boolean;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          if (s.items.find((i) => i.productId === item.productId)) return s;
          return { items: [{ ...item, addedAt: Date.now() }, ...s.items] };
        }),
      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      toggle: (item) => {
        const has = !!get().items.find((i) => i.productId === item.productId);
        if (has) {
          set((s) => ({ items: s.items.filter((i) => i.productId !== item.productId) }));
          return false;
        }
        set((s) => ({ items: [{ ...item, addedAt: Date.now() }, ...s.items] }));
        return true;
      },
      has: (productId) => !!get().items.find((i) => i.productId === productId),
      clear: () => set({ items: [] }),
    }),
    { name: "sericia-wishlist" },
  ),
);
