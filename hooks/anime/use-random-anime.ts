"use client";

import { fetchJson } from "@/lib/http";
import { animeDetailResponseSchema } from "@/lib/schemas/catalogue-responses";
import { apiQueryPolicy } from "@/lib/api-query-policy";

import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-config";
import { AnimeDetails } from "@/types/anime";

const useRandomAnime = () => {
  const query = useQuery<AnimeDetails>({
    queryKey: ["random"],
    ...apiQueryPolicy,
    queryFn: async ({ signal }) =>
      (await fetchJson(`${API_BASE_URL}/random/anime`, animeDetailResponseSchema, { signal })).data,
  });
  return { ...query, isLoading: query.isPending };
};

export default useRandomAnime;
