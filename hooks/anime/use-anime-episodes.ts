
import { withCurrentPage } from "@/lib/schemas/media";
import { fetchJson } from "@/lib/http";
import { episodesResponseSchema } from "@/lib/schemas/catalogue-responses";
import { apiQueryPolicy } from "@/lib/api-query-policy";
import { useInfiniteQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '@/lib/api-config'
import type { AnimeEpisodeResponse } from '@/types/anime'

export function useAnimeEpisodes(id: string) {
    const {
        data,
        isPending: isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery<AnimeEpisodeResponse>({
        queryKey: ['animeEpisodes', id],
        ...apiQueryPolicy,
        queryFn: async ({ pageParam = 1, signal }) => withCurrentPage(await fetchJson(`${API_BASE_URL}/anime/${id}/episodes?page=${pageParam}`, episodesResponseSchema, { signal }), Number(pageParam)),
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.has_next_page) {
                return lastPage.pagination.current_page + 1
            }
            return undefined
        },
        initialPageParam: 1,
    })

    return {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    }
}
