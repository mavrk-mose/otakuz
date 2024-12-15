"use client"

import {useInfiniteQuery, useQuery} from '@tanstack/react-query';

const API_BASE_URL = 'https://api.jikan.moe/v4';

export function useAnimeRecommendations() {
  const {data, isLoading, fetchNextPage, hasNextPage} = useInfiniteQuery({
    queryKey: ['animeRecommendations'],
    queryFn: async ({ pageParam = 1 }) => {
        const response = await fetch(`${API_BASE_URL}/recommendations/anime`);
        if (!response.ok) throw new Error('Failed to fetch anime');
        return response.json();
    },
    getNextPageParam: (lastPage) => {
        if (lastPage.pagination.has_next_page) {
            return lastPage.pagination.current_page + 1;
        }
        return undefined;
    },
    initialPageParam: 1
  })

  return {data, isLoading, fetchNextPage, hasNextPage};
}
