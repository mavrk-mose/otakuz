import { fetchJson } from "@/lib/http";
import { recommendationsSchema } from "@/lib/schemas/media";
import { apiQueryPolicy } from "@/lib/api-query-policy";
import {useQuery} from "@tanstack/react-query";
import {API_BASE_URL} from "@/lib/api-config";

const useAnimeRecommendations = (animeId: string) => {
    const {
        data: recommendations,
        isPending: isLoading
    } = useQuery({
        queryKey: ['animeRecommendations', animeId],
        ...apiQueryPolicy,
        queryFn: async ({ signal }) => (await fetchJson(`${API_BASE_URL}/anime/${animeId}/recommendations`, recommendationsSchema, { signal })).data,
    });

    return {
        recommendations,
        isLoading,
    }
}

export default useAnimeRecommendations;