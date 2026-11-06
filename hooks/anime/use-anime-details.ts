import {useQuery} from "@tanstack/react-query";
import {AnimeDetails} from "@/types/anime";
import {API_BASE_URL} from "@/lib/api";

type AnimeRequestError = Error & { status?: number };

const useAnimeDetails = (animeId: string) => {
    const validId = /^\d+$/.test(animeId);
    const query = useQuery<AnimeDetails, AnimeRequestError>({
        enabled: validId,
        retry: (count, error) => count < 2 && (!error.status || error.status === 429 || error.status >= 500),
        queryKey: ['animeDetail', animeId],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/anime/${animeId}`);
            if (!response.ok) throw Object.assign(new Error('Failed to fetch anime details'), { status: response.status });
            const data = await response.json();
            return data.data;
        },
    });
  return { ...query, isLoading: query.isPending && validId };
}

export default useAnimeDetails;