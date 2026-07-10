import { useInfiniteQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '@/lib/api'
import type { AnimeEpisodeResponse } from '@/types/anime'

export function useAnimeEpisodes(id: string) {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery<AnimeEpisodeResponse>({
        queryKey: ['animeEpisodes', id],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await fetch(
                `${API_BASE_URL}/anime/${id}/episodes?page=${pageParam}`
            )
            if (!response.ok) throw new Error('Failed to fetch anime episodes')
            return response.json()
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.has_next_page) {
                return lastPage.pagination.current_page + 1
            }
            return undefined
        },
        initialPageParam: 1,
        staleTime: Infinity,
    })

    return {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    }
}
