"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const ALL_SEARCH_CATEGORIES = [
  "anime",
  "manga",
  "users",
  "merch",
  "events",
  "channels",
  "chatrooms",
] as const;

export type GlobalSearchCategory = (typeof ALL_SEARCH_CATEGORIES)[number];
export type SearchScopeTab = "all" | GlobalSearchCategory;

interface GlobalSearchState {
  isOpen: boolean;
  query: string;
  focusedCategory: SearchScopeTab;
  enabledCategories: GlobalSearchCategory[];
  recentSearches: string[];
  openSearch: (initialScope?: SearchScopeTab) => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  setQuery: (query: string) => void;
  setFocusedCategory: (scope: SearchScopeTab) => void;
  toggleEnabledCategory: (category: GlobalSearchCategory) => void;
  enableAllCategories: () => void;
  addRecentSearch: (term: string) => void;
  removeRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

export const useGlobalSearchStore = create<GlobalSearchState>()(
  persist(
    (set) => ({
      isOpen: false,
      query: "",
      focusedCategory: "all",
      enabledCategories: [...ALL_SEARCH_CATEGORIES],
      recentSearches: [],
      openSearch: (initialScope) =>
        set((state) => ({
          isOpen: true,
          focusedCategory: initialScope ?? state.focusedCategory,
        })),
      closeSearch: () => set({ isOpen: false }),
      toggleSearch: () => set((state) => ({ isOpen: !state.isOpen })),
      setQuery: (query) => set({ query }),
      setFocusedCategory: (focusedCategory) => set({ focusedCategory }),
      toggleEnabledCategory: (category) =>
        set((state) => {
          const exists = state.enabledCategories.includes(category);
          if (exists && state.enabledCategories.length === 1) {
            // Keep at least one scope enabled
            return state;
          }
          const next = exists
            ? state.enabledCategories.filter((c) => c !== category)
            : [...state.enabledCategories, category];
          return {
            enabledCategories: next,
            focusedCategory:
              state.focusedCategory === category && exists ? "all" : state.focusedCategory,
          };
        }),
      enableAllCategories: () =>
        set({
          enabledCategories: [...ALL_SEARCH_CATEGORIES],
          focusedCategory: "all",
        }),
      addRecentSearch: (term) =>
        set((state) => {
          const clean = term.trim();
          if (!clean) return state;
          return {
            recentSearches: [
              clean,
              ...state.recentSearches.filter(
                (item) => item.toLowerCase() !== clean.toLowerCase()
              ),
            ].slice(0, 6),
          };
        }),
      removeRecentSearch: (term) =>
        set((state) => ({
          recentSearches: state.recentSearches.filter((item) => item !== term),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "otakuz-global-search-prefs",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        enabledCategories: state.enabledCategories,
        recentSearches: state.recentSearches,
      }),
    }
  )
);
