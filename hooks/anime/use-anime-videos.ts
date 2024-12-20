import { API_BASE_URL } from "@/lib/api";
import { AnimeVideos } from "@/types/anime";
import { useQuery } from "@tanstack/react-query";

export function useAnimeVideos(id: string) {
    return useQuery<AnimeVideos>({
        queryKey: ['animePictures', id],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/anime/${id}/videos`);
            if (!response.ok) throw new Error('Failed to fetch anime details');
            const data = await response.json();
            return data.data;
        },
        staleTime: Infinity
    });
}
