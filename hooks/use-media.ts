import { z } from "zod";
import { fetchJson } from "@/lib/http";
import { mediaRecordSchema, paginationSchema, imagesSchema, withCurrentPage } from "@/lib/schemas/media";
import { apiQueryPolicy } from "@/lib/media-query-options";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { API_BASE_URL, fetchGenres, MediaType } from "@/lib/api";

export function useMediaGenres(mediaType: MediaType) {
    const {
        data: genres,
        isPending: isLoadingGenres
    } = useQuery({
        queryKey: [`${mediaType}Genres`],
        ...apiQueryPolicy,
        queryFn: () => fetchGenres(mediaType),
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
        ...apiQueryPolicy,
        queryFn: async ({ pageParam = 1, signal }) => {
            const separator = endpoint.includes('?') ? '&' : '?';
            return withCurrentPage(await fetchJson(`${endpoint}${separator}page=${pageParam}`, z.object({
                data: z.array(z.custom<TData>(value => mediaRecordSchema.safeParse(value).success)), pagination: paginationSchema,
            }), { signal }), Number(pageParam));
        },
        getNextPageParam: (lastPage) => {
            if (lastPage?.pagination?.has_next_page) {
                return lastPage.pagination.current_page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        enabled: genreId !== undefined ? !!genreId : true,
    });

    return { ...query, isLoading: query.isPending && (genreId === undefined || !!genreId) };
}

export function useMediaPictures<T = any>(mediaType: MediaType, id: string) {
    const query = useQuery<T[]>({
        queryKey: [`${mediaType}Pictures`, id],
        ...apiQueryPolicy,
        queryFn: async ({ signal }) => (await fetchJson(`${API_BASE_URL}/${mediaType}/${id}/pictures`, z.object({ data: z.array(z.custom<T>(value => imagesSchema.safeParse(value).success)) }), { signal })).data,
        enabled: Boolean(id),
    });
    return { ...query, isLoading: query.isPending && !!id };
}
