"use client";

import type { MediaPlayerInstance } from "@vidstack/react";
import { create } from "zustand";

export interface PlayerVideo {
  id: string;
  src: string;
  title?: string;
  posterUrl?: string;
  playerRoute?: string;
  autoPlay?: boolean;
}

interface PlayerStore {
  autoPlay: boolean;
  queue: PlayerVideo[];
  queueIndex: number;
  openQueue: (videos: PlayerVideo[], startIndex?: number) => void;
  advanceQueue: () => PlayerVideo | null;
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
  autoPlay: false,
  queue: [],
  queueIndex: -1,
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
        autoPlay: video.autoPlay ?? false,
        queue: [],
        queueIndex: -1,
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

  openQueue: (videos, startIndex = 0) => {
    const video = videos[startIndex];
    if (!video) return;
    const stayMinimized = get().isMinimized && get().videoSrc === video.src;
    get().openPlayer({ ...video, autoPlay: true });
    set({ queue: videos, queueIndex: startIndex, isMinimized: stayMinimized });
  },

  advanceQueue: () => {
    const state = get();
    const nextIndex = state.queueIndex + 1;
    const next = state.queue[nextIndex];
    if (!next) { set({ isPlaying: false, autoPlay: false }); return null; }
    set({
      currentVideoId: next.id, videoSrc: next.src,
      title: next.title ?? "Anime video", posterUrl: next.posterUrl ?? null,
      playerRoute: next.playerRoute ?? null, currentPlaybackTime: 0,
      autoPlay: true, isPlaying: false, queueIndex: nextIndex,
    });
    return next;
  },

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
    set({
      autoPlay: false, queue: [], queueIndex: -1,
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
    });
  },
}));
