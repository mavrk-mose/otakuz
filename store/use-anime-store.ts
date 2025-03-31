"use client"

import { create } from 'zustand';

interface AnimeStore {
    searchQuery: string;
    selectedGenre: string;
    bookmarkLoading: { [key: string]: boolean };
    setSearchQuery: (query: string) => void;
    setSelectedGenre: (genre: string) => void;
    setBookmarkLoading: (id: string, loading: boolean) => void;
}

export const useAnimeStore = create<AnimeStore>((set) => ({
    searchQuery: '',
    selectedGenre: '',
    bookmarkLoading: {},
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedGenre: (genre) => set({ selectedGenre: genre }),
    setBookmarkLoading: (id, loading) => 
        set((state) => ({
          bookmarkLoading: {
            ...state.bookmarkLoading,
            [id]: loading
          }
        })),
}));