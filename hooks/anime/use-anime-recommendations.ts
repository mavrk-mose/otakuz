import {useQuery} from "@tanstack/react-query";
import {ANIME_BASE_URL} from "@/lib/api";

const useAnimeRecommendations = (animeId: string) => {
    const {
        data: recommendations,
        isLoading
    } = useQuery({
        queryKey: ['animeRecommendations', animeId],
        queryFn: async () => {
            const response = await fetch(`${ANIME_BASE_URL}/anime/${animeId}/recommendations`);
            if (!response.ok) throw new Error('Failed to fetch recommendations');
            const data = await response.json();
            return data.data;
        },
    });

    return {
        recommendations,
        isLoading,
    }
}

export default useAnimeRecommendations;