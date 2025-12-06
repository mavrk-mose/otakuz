import { API_BASE_URL } from "@/lib/api";
import { AnimeVideos } from "@/types/anime";
import { useQuery } from "@tanstack/react-query";

export function useAnimeVideos(id: string) {
    return useQuery<AnimeVideos>({
        queryKey: ['animeVideos', id],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/anime/${id}/videos`);
            if (!response.ok) {
                const error = new Error('Failed to fetch anime details') as any;
                error.status = response.status;
                throw error;
            }
            const data = await response.json();
            return data.data;
        },
        enabled: !!id,
        staleTime: Infinity,
        retry: (failureCount, error: any) => {
            // Retry only if the error is a 429 (Too Many Requests)
            if (error?.status === 429 && failureCount < 5) return true;
            return false;
        },
        retryDelay: (failureCount, error: any) => {
            // Wait before retrying: for 429, wait 2 seconds
            if (error?.status === 429) return 2000;
            // Otherwise exponential backoff
            return Math.min(1000 * 2 ** failureCount, 30000);
        }
    });
}
