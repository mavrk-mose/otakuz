"use client";

import { fetchJson } from "@/lib/http";
import { recentAnimeSchema, withCurrentPage } from "@/lib/schemas/media";
import { apiQueryPolicy } from "@/lib/api-query-policy";
import { useInfiniteQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-config";

export function useRecentAnime() {
  const {
    data,
    isPending: isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["recentAnime"],
    ...apiQueryPolicy,
    queryFn: async ({ pageParam = 1, signal }) =>
      withCurrentPage(
        await fetchJson(
          `${API_BASE_URL}/recommendations/anime?page=${pageParam}`,
          recentAnimeSchema,
          { signal },
        ),
        Number(pageParam),
      ),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  return {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
  };
}
