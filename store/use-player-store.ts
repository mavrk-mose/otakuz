"use client";

import type { MediaPlayerInstance } from "@vidstack/react";
import { create } from "zustand";

export interface PlayerVideo {
  id: string;
  src: string;
  title?: string;
  posterUrl?: string;
  playerRoute?: string;
}

interface PlayerStore {
  currentVideoId: string | null;
  videoSrc: string | null;
  title: string;
  posterUrl: string | null;
  playerRoute: string | null;
  isMinimized: boolean;
  currentPlaybackTime: number;
  isOpen: boolean;
  isPlaying: boolean;
  player: MediaPlayerInstance | null;
  openPlayer: (video: PlayerVideo) => void;
  attachPlayer: (player: MediaPlayerInstance | null) => void;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setCurrentPlaybackTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  toggleMinimize: () => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : error;

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentVideoId: null,
  videoSrc: null,
  title: "Anime video",
  posterUrl: null,
  playerRoute: null,
  isMinimized: false,
  currentPlaybackTime: 0,
  isOpen: false,
  isPlaying: false,
  player: null,

  openPlayer: (video) =>
    set((state) => {
      const isSameSource = state.videoSrc === video.src;

      return {
        currentVideoId: video.id,
        videoSrc: video.src,
        title: video.title ?? "Anime video",
        posterUrl: video.posterUrl ?? null,
        playerRoute: video.playerRoute ?? null,
        isOpen: true,
        isMinimized: false,
        currentPlaybackTime: isSameSource ? state.currentPlaybackTime : 0,
        isPlaying: isSameSource ? state.isPlaying : false,
      };
    }),

  attachPlayer: (player) => set({ player }),

  play: () => {
    const player = get().player;
    set({ isPlaying: true });

    if (player) {
      void player.play().catch((error) => {
        if (getErrorMessage(error) !== "provider destroyed") {
          set({ isPlaying: false });
        }
      });
    }
  },

  pause: () => {
    const player = get().player;
    set({ isPlaying: false });

    if (player) {
      void player.pause().catch(() => undefined);
    }
  },

  seek: (time) => {
    const nextTime = Math.max(0, time);
    const player = get().player;

    set({ currentPlaybackTime: nextTime });

    if (player) {
      player.currentTime = nextTime;
    }
  },

  setCurrentPlaybackTime: (time) =>
    set({ currentPlaybackTime: Math.max(0, time) }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  toggleMinimize: () =>
    set((state) => ({ isMinimized: !state.isMinimized })),
  minimize: () => set({ isMinimized: true }),
  maximize: () => set({ isMinimized: false }),

  close: () => {
    const player = get().player;

    if (player && !player.paused) {
      void player.pause().catch(() => undefined);
    }

    set({
      currentVideoId: null,
      videoSrc: null,
      title: "Anime video",
      posterUrl: null,
      playerRoute: null,
      isMinimized: false,
      currentPlaybackTime: 0,
      isOpen: false,
      isPlaying: false,
    });
  },
}));
