"use client"

import {useInfiniteQuery} from "@tanstack/react-query";
import {API_BASE_URL} from "@/lib/api";
import {AnimeSearchResults} from "@/types/anime";

const useFetchSchedules = () => {
    const {
        data: schedule,
        isLoading,
        fetchNextPage,
        hasNextPage
    } = useInfiniteQuery<AnimeSearchResults>({
        queryKey: ['animeSchedule'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await fetch(`${API_BASE_URL}/schedules?page=${pageParam}`);
            if (!response.ok) throw new Error('Failed to fetch anime schedule');

            const data = await response.json();
            return data.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination?.has_next_page) {
                return lastPage.pagination.current_page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: Infinity
    });

    return {
        schedule,
        isLoading,
        fetchNextPage,
        hasNextPage
    }
}

export default useFetchSchedules;