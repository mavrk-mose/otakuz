import {useInfiniteQuery} from "@tanstack/react-query";
import {API_BASE_URL} from "@/lib/api";
import {AnimeResponse} from "@/types/anime";

const useFetchAnime = () => {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery<AnimeResponse>({
        queryKey: ['animeList'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await fetch(`${API_BASE_URL}/top/anime?page=${pageParam}`);
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
        staleTime: Infinity
    });

    //filter with genre & sort


    return {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    }
}

export default useFetchAnime;
