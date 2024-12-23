"use client"

import {useInfiniteQuery} from "@tanstack/react-query";
import {API_BASE_URL} from "@/lib/api";

const useFetchAnimeByGenre = (selectedGenre?: string) => {

    const {
        data: anime,
        isLoading: isLoadingAnime,
        fetchNextPage,
        hasNextPage
    } = useInfiniteQuery({
        queryKey: ['animeByGenre', selectedGenre],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await fetch(`${API_BASE_URL}/anime?genres=${selectedGenre}&page=${pageParam}`);
            if (!response.ok) throw new Error('Failed to fetch anime');
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
        anime,
        isLoadingAnime,
        fetchNextPage,
        hasNextPage
    };
}

export default useFetchAnimeByGenre;