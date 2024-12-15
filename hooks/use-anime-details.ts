import {useQuery} from "@tanstack/react-query";
import {AnimeData} from "@/types/anime";
import {ANIME_BASE_URL} from "@/lib/api";

const useAnimeDetails = (animeId: string) => {
    return useQuery<AnimeData>({
        queryKey: ['animeDetail', animeId],
        queryFn: async () => {
            const response = await fetch(`${ANIME_BASE_URL}/anime/${animeId}`);
            if (!response.ok) throw new Error('Failed to fetch anime details');
            const data = await response.json();
            return data.data;
        },
    });
}

export default useAnimeDetails;