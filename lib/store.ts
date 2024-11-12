"use client"

import { create } from 'zustand';

interface AnimeStore {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useAnimeStore = create<AnimeStore>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));