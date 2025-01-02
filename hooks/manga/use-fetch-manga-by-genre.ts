"use client"

import {useInfiniteQuery} from "@tanstack/react-query";
import {API_BASE_URL} from "@/lib/api";

const useFetchMangaByGenre = (selectedGenre?: string) => {

    const {
        data: manga,
        isLoading: isLoadingManga,
        fetchNextPage,
        hasNextPage
    } = useInfiniteQuery({
        queryKey: ['mangaByGenre', selectedGenre],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await fetch(`${API_BASE_URL}/manga?genres=${selectedGenre}&page=${pageParam}`);
            if (!response.ok) throw new Error('Failed to fetch manga');
            return response.json();
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.has_next_page) {
                return lastPage.pagination.current_page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: Infinity,
        enabled: !!selectedGenre,
    });

    return {
        manga,
        isLoadingManga,
        fetchNextPage,
        hasNextPage
    };
}

export default useFetchMangaByGenre;