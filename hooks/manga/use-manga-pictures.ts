import {useQuery} from "@tanstack/react-query";
import {API_BASE_URL} from "@/lib/api";
import { Manga } from "@/types/manga";

export function useMangaPictures(id: string) {
    return useQuery<Manga["images"][]>({
        queryKey: ['mangaPictures', id],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/manga/${id}/pictures`);
            if (!response.ok) throw new Error('Failed to fetch anime details');
            const data = await response.json();
            return data.data;
        },
        staleTime: Infinity
    });
}