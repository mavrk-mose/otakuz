"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import type { AnimeScheduleResponse, ScheduleAnime } from "@/types/anime";
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { parse, format } from "date-fns";

export type ScheduleDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface UseAnimeSchedulesOptions {
  day: ScheduleDay | null;
  limit?: number;
}

export type GroupedSchedules = Record<string, ScheduleAnime[]>;

type GroupedSchedulePage = {
  schedules: GroupedSchedules;
  pagination: AnimeScheduleResponse["pagination"];
};

function isAnimeScheduleResponse(data: unknown): data is AnimeScheduleResponse {
  if (typeof data !== "object" || data === null) return false;

  const response = data as Record<string, unknown>;
  const pagination = response.pagination;
  if (!Array.isArray(response.data) || typeof pagination !== "object" || pagination === null) {
    return false;
  }

  const page = pagination as Record<string, unknown>;
  const items = page.items;
  if (typeof items !== "object" || items === null) return false;

  return (
    typeof page.last_visible_page === "number" &&
    typeof page.has_next_page === "boolean" &&
    typeof page.current_page === "number" &&
    typeof (items as Record<string, unknown>).count === "number" &&
    typeof (items as Record<string, unknown>).total === "number" &&
    typeof (items as Record<string, unknown>).per_page === "number"
  );
}

export default function useFetchSchedules({
  day,
  limit = 25
}: UseAnimeSchedulesOptions) {
  return useInfiniteQuery({
    queryKey: ["animeSchedules", day, limit],
    queryFn: async ({ pageParam = 1, signal }): Promise<GroupedSchedulePage> => {
      if (!day) {
        throw new Error("A schedule day is required to fetch schedules.");
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        page: pageParam.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/schedules/${day}?${params}`,
        { signal }
      );

      if (response.status === 429) {
        throw new Error("Schedules are temporarily rate limited.");
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch schedules: ${response.status}`);
      }

      const data: unknown = await response.json();
      if (!isAnimeScheduleResponse(data)) {
        throw new Error("The schedule response had an unexpected format.");
      }

      const schedules: GroupedSchedules = {};
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const dateStr = format(new Date(), "yyyy-MM-dd");

      data.data.forEach((anime: ScheduleAnime) => {
        const broadcastTime = anime.broadcast?.time;
        if (!broadcastTime || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(broadcastTime)) {
          schedules.Unknown ??= [];
          schedules.Unknown.push(anime);
          return;
        }

        const broadcastDate = parse(
          `${dateStr} ${broadcastTime}`,
          "yyyy-MM-dd HH:mm",
          new Date()
        );
        const broadcastTimezone = anime.broadcast?.timezone || "Asia/Tokyo";
        const localDate = toZonedTime(
          fromZonedTime(broadcastDate, broadcastTimezone),
          userTimezone
        );
        const localTime = format(localDate, "HH:mm");

        schedules[localTime] ??= [];
        schedules[localTime].push(anime);
      });

      return { schedules, pagination: data.pagination };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.has_next_page
        ? lastPage.pagination.current_page + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        /^Failed to fetch schedules: 4\d\d$/.test(error.message)
      ) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: day !== null,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
