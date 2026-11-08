import { fetchJson } from "@/lib/http";
import { newsResponseSchema } from "@/lib/schemas/media";
import { apiQueryPolicy } from "@/lib/api-query-policy";
import {useQuery} from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-config";

export function useAnimeNews(id: string) {
    return useQuery({
        queryKey: ['animeNews', id],
        ...apiQueryPolicy,
        queryFn: async ({ signal }) => (await fetchJson(`${API_BASE_URL}/anime/${id}/news`, newsResponseSchema, { signal })).data,
    });
}
export async function getAnimeNews() { return (await fetchJson(`${API_BASE_URL}/anime/1/news`, newsResponseSchema)).data; }
