"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { IptvChannel } from "@/types/channel";

export interface RecentlyViewedChannel extends IptvChannel {
  viewedAt: number;
}

interface ChannelHistoryStore {
  recentlyViewed: RecentlyViewedChannel[];
  addRecentlyViewed: (channel: IptvChannel) => void;
  clearRecentlyViewed: () => void;
}

const MAX_RECENT_CHANNELS = 18;

export const useChannelHistoryStore = create<ChannelHistoryStore>()(
  persist(
    (set) => ({
      recentlyViewed: [],
      addRecentlyViewed: (channel) =>
        set((state) => ({
          recentlyViewed: [
            { ...channel, viewedAt: Date.now() },
            ...state.recentlyViewed.filter(
              (recentChannel) => recentChannel.channelId !== channel.channelId
            ),
          ].slice(0, MAX_RECENT_CHANNELS),
        })),
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    {
      name: "otakuz-channel-history",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ recentlyViewed: state.recentlyViewed }),
    }
  )
);
