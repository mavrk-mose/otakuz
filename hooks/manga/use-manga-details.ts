import { useQuery, queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJson } from "@/lib/http";
import { apiQueryPolicy } from "@/lib/api-query-policy";
import { mediaRecordSchema } from "@/lib/schemas/media";
import type { Manga } from "@/types/manga";

export default function useMangaDetails(id: string) {
  const { data: manga, ...query } = useQuery(mangaDetailsOptions(id));
  return { manga, ...query, isLoading: query.isPending && /^\d+$/.test(id) };
}

const mangaPayload = z.object({
  data: z.custom<Manga>((value) => mediaRecordSchema.safeParse(value).success),
});
export const mangaDetailsOptions = (id: string) =>
  queryOptions({
    queryKey: ["manga", id],
    enabled: /^\d+$/.test(id),
    ...apiQueryPolicy,
    queryFn: async ({ signal }) =>
      (await fetchJson(`/api/jikan/manga/${id}`, mangaPayload, { signal })).data,
  });
