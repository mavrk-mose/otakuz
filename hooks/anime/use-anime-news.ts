import {useQuery} from "@tanstack/react-query";
import {API_BASE_URL} from "@/lib/api";

export function useAnimeNews(id: string) {
    return useQuery({
        queryKey: ['animeNews'],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/anime/${id}/news`);
            if (!response.ok) throw new Error('Failed to fetch anime news');
            const data = await response.json();
            return data.data;
        },
    });
}