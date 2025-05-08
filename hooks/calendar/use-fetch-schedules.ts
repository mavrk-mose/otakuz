"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { AnimeDetails, PaginatedAnime } from "@/types/anime";
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { parse, format } from "date-fns";

interface UseAnimeSchedulesOptions {
  day: string;
  kids?: boolean;
  sfw?: boolean;
  limit?: number;
}

export type GroupedSchedules = Record<string, AnimeDetails[]>;

// Global request queue to manage API calls
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

export default function useFetchSchedules({
  day,
  kids = false,
  sfw = true,
  limit = 25
}: UseAnimeSchedulesOptions) {
  return useInfiniteQuery({
    queryKey: ["animeSchedules", day, kids, sfw, limit],
    queryFn: async ({ pageParam = 1 }) => {
      if (!day) {
        return {};
      }

      const params = new URLSearchParams({
        filter: day,
        kids: kids.toString(),
        sfw: sfw.toString(),
        limit: limit.toString(),
        page: pageParam.toString(),
      });

      try {
        const now = Date.now();
        const timeToWait = Math.max(
          0,
          MIN_REQUEST_INTERVAL - (now - lastRequestTime)
        );

        if (timeToWait > 0) {
          await new Promise((resolve) => setTimeout(resolve, timeToWait));
        }

        lastRequestTime = Date.now();

        const response = await fetch(
          `${API_BASE_URL}/schedules?${params}`,
          {
            headers: {
              // Add cache control headers
              "Cache-Control": "max-age=3600", // Cache for 1 hour
            },
          }
        );

        // Handle rate limiting response
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After") || "5";
          const waitTime = Number.parseInt(retryAfter, 10) * 1000;
          console.warn(
            `Rate limited. Waiting for ${waitTime}ms before retrying.`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          throw new Error("Rate limited. Retrying after cooldown.");
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(
            errorData.messages
              ? `API Error: ${JSON.stringify(errorData.messages)}`
              : `Failed to fetch schedules: ${response.status}`
          );
        }

        const data: PaginatedAnime = await response.json();

        const animeByTime: GroupedSchedules = {};
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const japanTimezone = 'Asia/Tokyo';

        if (data && Array.isArray(data.data)) {
          data.data.forEach((anime) => {
            const broadcastTime = anime.broadcast?.time;
        
            if (!broadcastTime) {
              if (!animeByTime['Unknown']) animeByTime['Unknown'] = [];
              animeByTime['Unknown'].push(anime);
              return;
            }
        
            const now = new Date();
            const dateStr = format(now, 'yyyy-MM-dd');
            const jstDateTimeStr = `${dateStr} ${broadcastTime}`;
            const parsedJstDate = parse(jstDateTimeStr, 'yyyy-MM-dd HH:mm', new Date());
        
            const jstDateInZone = fromZonedTime(parsedJstDate, japanTimezone);
            const userDateTime = toZonedTime(jstDateInZone, userTimezone);
        
            const localTime = format(userDateTime, 'HH:mm');
        
            if (!animeByTime[localTime]) animeByTime[localTime] = [];
            animeByTime[localTime].push({
              ...anime,
              broadcast: {
                ...anime.broadcast,
                time: localTime,
              },
            });
          });
        } else {
          console.error("Unexpected API response format:", data);
          return {};
        }

        return animeByTime;
      } catch (error) {
        console.error("Error fetching schedules:", error);
        throw error;
      }
    },
    getNextPageParam: (_, pages) => {
      return pages.length < 3 ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 60 * 1000, 
    gcTime: 60 * 60 * 1000, // Keep unused data in cache for 1 hour
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors except rate limiting (429)
      if (
        error instanceof Error &&
        error.message.includes("Failed to fetch schedules: 4") &&
        !error.message.includes("429")
      ) {
        return false;
      }
      return failureCount < 3; // Retry up to 3 times for other errors
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 2s, 4s, 8s, etc.
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
    enabled: !!day, // Only run the query if day is provided
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
