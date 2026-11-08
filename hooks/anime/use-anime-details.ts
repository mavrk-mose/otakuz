import { useQuery, queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJson } from "@/lib/http";
import { apiQueryPolicy } from "@/lib/api-query-policy";
import { mediaRecordSchema } from "@/lib/schemas/media";
import type { AnimeDetails } from "@/types/anime";

export default function useAnimeDetails(id: string) {
  const query = useQuery(animeDetailsOptions(id));
  return { ...query, isLoading: query.isPending && /^\d+$/.test(id) };
}

const animePayload = z.object({
  data: z.custom<AnimeDetails>((value) => mediaRecordSchema.safeParse(value).success),
});
export const animeDetailsOptions = (id: string) =>
  queryOptions({
    queryKey: ["animeDetail", id],
    enabled: /^\d+$/.test(id),
    ...apiQueryPolicy,
    queryFn: async ({ signal }) =>
      (await fetchJson(`/api/jikan/anime/${id}`, animePayload, { signal })).data,
  });
