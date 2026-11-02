"use client";

import { create } from "zustand";

interface SidebarStore {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isExpanded: false,
  setIsExpanded: (isExpanded) => set({ isExpanded }),
  toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
}));
