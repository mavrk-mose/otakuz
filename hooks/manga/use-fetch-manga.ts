import {useInfiniteQuery} from "@tanstack/react-query";
import {API_BASE_URL} from "@/lib/api";

const useFetchManga = () => {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage
    } = useInfiniteQuery({
        queryKey: ['mangaList'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await fetch(`${API_BASE_URL}/top/manga?page=${pageParam}`);
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
        staleTime: Infinity
    });

    // filter and sort

    return {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage
    }
}

export default useFetchManga;