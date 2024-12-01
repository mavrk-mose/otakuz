"use client"

import { create } from 'zustand';

interface AnimeStore {
  searchQuery: string;
  selectedGenre: string;
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: string) => void;
}

export const useAnimeStore = create<AnimeStore>((set) => ({
  searchQuery: '',
  selectedGenre: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedGenre: (genre) => set({ selectedGenre: genre }),
}));