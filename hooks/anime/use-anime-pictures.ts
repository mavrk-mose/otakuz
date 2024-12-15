import {useQuery} from "@tanstack/react-query";
import {AnimeData} from "@/types/anime";
import {API_BASE_URL} from "@/lib/api";

export function useAnimePictures(id: string) {
    return useQuery<AnimeData["images"][]>({
        queryKey: ['animePictures', id],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/anime/${id}/pictures`);
            if (!response.ok) throw new Error('Failed to fetch anime details');
            const data = await response.json();
            return data.data;
        },
        staleTime: Infinity
    });
}