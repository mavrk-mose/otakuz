import {useQuery} from "@tanstack/react-query";
import {API_BASE_URL} from "@/lib/api";
import {Manga} from "@/types/manga";

type MangaRequestError = Error & { status?: number };

const useMangaDetails = (mangaId: string) => {
    const {
        data: manga,
        ...query
    } = useQuery<Manga, MangaRequestError>({
        queryKey: ['manga', mangaId],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/manga/${mangaId}`);
            if (!response.ok) {
                const error = new Error('Failed to fetch manga details') as MangaRequestError;
                error.status = response.status;
                throw error;
            }

            const data = await response.json();

            if (!data?.data || typeof data.data !== 'object') {
                throw new Error('Manga details response was empty');
            }

            return data.data;
        },
        enabled: /^\d+$/.test(mangaId),
        staleTime: Infinity,
        retry: (failureCount, error) => {
            const isTransient = error.status === 429 || (error.status ?? 0) >= 500;
            return isTransient && failureCount < 2;
        },
        retryDelay: (failureCount) => Math.min(1000 * 2 ** failureCount, 5000)
    });

    return {
        manga,
        ...query
    };
}

export default useMangaDetails;
