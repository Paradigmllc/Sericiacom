"use client";
import { create } from "zustand";

type UiState = {
  cartOpen: boolean;
  searchOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setCartOpen: (v: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchOpen: (v: boolean) => void;
};

export const useUi = create<UiState>()((set) => ({
  cartOpen: false,
  searchOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  setCartOpen: (v) => set({ cartOpen: v }),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  setSearchOpen: (v) => set({ searchOpen: v }),
}));
