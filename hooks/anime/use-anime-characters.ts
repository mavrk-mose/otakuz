import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import type { AnimeCharactersResponse } from "@/types/anime";

export function useAnimeCharacters(animeId: string) {
    const id = animeId.trim();
    const isValidAnimeId = /^\d+$/.test(id) && Number(id) > 0;

    return useQuery<AnimeCharactersResponse["data"]>({
        queryKey: ["animeCharacters", id],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/anime/${id}/characters`);
            if (!response.ok) throw new Error("Failed to fetch anime characters");
            const data: AnimeCharactersResponse = await response.json();
            return data.data;
        },
        enabled: isValidAnimeId,
        staleTime: Infinity,
    });
}
