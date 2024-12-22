"use client"

import {AnimeEntry} from "@/types/anime";
import {create} from "zustand";
import {persist} from "zustand/middleware";

interface WatchStore {
    //TODO: add playback state to keep track where the user left off
    selectedAnime: AnimeEntry | null;
    setSelectedAnime: (selectedAnime: AnimeEntry) => void;
}

export const useWatchStore = create<WatchStore>()(
    persist(
        (set) => ({
            selectedAnime: null,
            setSelectedAnime: (anime) => set({ selectedAnime: anime }),
        }),
        {
            name: 'watch-storage'
        }
    )
)