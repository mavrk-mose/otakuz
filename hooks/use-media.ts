import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { API_BASE_URL, fetchGenres, MediaType } from "@/lib/api";

export function useMediaGenres(mediaType: MediaType) {
    const {
        data: genres,
        isLoading: isLoadingGenres
    } = useQuery({
        queryKey: [`${mediaType}Genres`],
        queryFn: () => fetchGenres(mediaType),
        staleTime: Infinity
    });

    return {
        genres,
        isLoadingGenres
    };
}

export interface UseInfiniteMediaOptions {
    mediaType: MediaType;
    genreId?: string;
    queryKeyExtra?: string;
}

export function useInfiniteMediaList<TData = any>({ mediaType, genreId, queryKeyExtra }: UseInfiniteMediaOptions) {
    const endpoint = genreId
        ? `${API_BASE_URL}/${mediaType}?genres=${genreId}`
        : `${API_BASE_URL}/top/${mediaType}`;

    const queryKey = genreId
        ? [`${mediaType}ByGenre`, genreId]
        : [`${mediaType}List`, queryKeyExtra].filter(Boolean);

    const query = useInfiniteQuery<{ data: TData[]; pagination: { current_page: number; has_next_page: boolean } }>({
        queryKey,
        queryFn: async ({ pageParam = 1 }) => {
            const separator = endpoint.includes('?') ? '&' : '?';
            const response = await fetch(`${endpoint}${separator}page=${pageParam}`);
            if (!response.ok) throw new Error(`Failed to fetch ${mediaType}`);
            return response.json();
        },
        getNextPageParam: (lastPage) => {
            if (lastPage?.pagination?.has_next_page) {
                return lastPage.pagination.current_page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: Infinity,
        enabled: genreId !== undefined ? !!genreId : true,
    });

    return query;
}

export function useMediaPictures<T = any>(mediaType: MediaType, id: string) {
    return useQuery<T[]>({
        queryKey: [`${mediaType}Pictures`, id],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/${mediaType}/${id}/pictures`);
            if (!response.ok) throw new Error(`Failed to fetch ${mediaType} pictures`);
            const data = await response.json();
            return data.data;
        },
        enabled: Boolean(id),
        staleTime: Infinity
    });
}
