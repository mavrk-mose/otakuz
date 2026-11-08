import { fetchJson } from "@/lib/http";
import { newsResponseSchema } from "@/lib/schemas/media";
import { apiQueryPolicy } from "@/lib/media-query-options";
import {useQuery} from "@tanstack/react-query";
import {API_BASE_URL} from "@/lib/api";

export function useAnimeNews(id: string) {
    return useQuery({
        queryKey: ['animeNews', id],
        ...apiQueryPolicy,
        queryFn: async ({ signal }) => (await fetchJson(`${API_BASE_URL}/anime/${id}/news`, newsResponseSchema, { signal })).data,
    });
}