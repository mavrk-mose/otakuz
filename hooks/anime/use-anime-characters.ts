
import { fetchJson } from "@/lib/http";
import { charactersResponseSchema } from "@/lib/schemas/catalogue-responses";
import { apiQueryPolicy } from "@/lib/api-query-policy";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-config";
import type { AnimeCharactersResponse } from "@/types/anime";

export function useAnimeCharacters(animeId: string) {
    const id = animeId.trim();
    const isValidAnimeId = /^\d+$/.test(id) && Number(id) > 0;

    const query = useQuery<AnimeCharactersResponse["data"]>({
        queryKey: ["animeCharacters", id],
        ...apiQueryPolicy,
        queryFn: async ({ signal }) => (await fetchJson(`${API_BASE_URL}/anime/${id}/characters`, charactersResponseSchema, { signal })).data,
        enabled: isValidAnimeId,
    });
  return { ...query, isLoading: query.isPending && isValidAnimeId };
}
