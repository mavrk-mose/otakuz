"use client";

import { withCurrentPage } from "@/lib/schemas/media";
import { fetchJson } from "@/lib/http";
import { schedulesResponseSchema } from "@/lib/schemas/catalogue-responses";
import { apiQueryPolicy } from "@/lib/api-query-policy";
import { useInfiniteQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-config";
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

export default function useFetchSchedules({
  day,
  limit = 25
}: UseAnimeSchedulesOptions) {
  // Grouped broadcast times depend on the viewer's timezone and today's date.
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateStr = format(new Date(), "yyyy-MM-dd");
  return useInfiniteQuery({
    queryKey: ["animeSchedules", day, limit, userTimezone, dateStr],
    queryFn: async ({ pageParam = 1, signal }): Promise<GroupedSchedulePage> => {
      if (!day) {
        throw new Error("A schedule day is required to fetch schedules.");
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        page: pageParam.toString(),
      });

      const data = withCurrentPage(await fetchJson(`${API_BASE_URL}/schedules/${day}?${params}`, schedulesResponseSchema, { signal }), Number(pageParam));

      const schedules: GroupedSchedules = {};

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
    ...apiQueryPolicy,
    enabled: day !== null,
  });
}
