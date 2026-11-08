import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchJson, retryApiRequest, apiRetryDelay } from "@/lib/http";
import { avatarResponseSchema } from "@/lib/schemas/media";

export const characterAvatarOptions = queryOptions({
  queryKey: ["characterAvatars"], staleTime: 60 * 60 * 1000,
  retry: retryApiRequest, retryDelay: apiRetryDelay,
  queryFn: async ({ signal }) => {
    const { data } = await fetchJson("/api/jikan/top/characters?limit=6", avatarResponseSchema, { signal });
    return data.map(character => ({ name: character.name, url: character.images.webp?.image_url || character.images.jpg?.image_url || "" })).filter(character => character.url);
  },
});
export function useCharacterAvatars(enabled: boolean) { return useQuery({ ...characterAvatarOptions, enabled }); }
