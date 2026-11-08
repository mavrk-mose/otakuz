"use client"

import { fetchJson } from "@/lib/http";
import { searchMediaResponseSchema } from "@/lib/schemas/media";
import { apiQueryPolicy } from "@/lib/media-query-options";
import { useAnimeStore } from "@/store/use-anime-store";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";

interface SearchResult {
  id: string;
  title: string;
  type: 'anime' | 'manga';
  image: string;
  score: number;
  episodes?: number;
  chapters?: number;
}

const useSearch = () => {
  const searchQuery = useAnimeStore((state) => state.searchQuery);

  const query = useQuery({
    queryKey: ['combinedSearch', searchQuery],
    ...apiQueryPolicy,
    queryFn: async ({ signal }) => {
      if (!searchQuery) return [];

      const [animeData, mangaData] = await Promise.all([
        fetchJson(`${API_BASE_URL}/anime?q=${encodeURIComponent(searchQuery)}&limit=5`, searchMediaResponseSchema, { signal }),
        fetchJson(`${API_BASE_URL}/manga?q=${encodeURIComponent(searchQuery)}&limit=5`, searchMediaResponseSchema, { signal }),
      ]);
      const animeResults: SearchResult[] = animeData.data.map((anime) => ({
        id: anime.mal_id.toString(),
        title: anime.title,
        type: 'anime',
        image: anime.images.webp?.small_image_url || "",
        score: anime.score ?? 0,
        episodes: anime.episodes ?? undefined
      }));

      const mangaResults: SearchResult[] = mangaData.data.map((manga) => ({
        id: manga.mal_id.toString(),
        title: manga.title,
        type: 'manga',
        image: manga.images.jpg?.small_image_url || "",
        score: manga.score ?? 0,
        chapters: manga.chapters ?? undefined
      }));

      return [...animeResults, ...mangaResults]
        .sort((a, b) => (b.score || 0) - (a.score || 0));
    },
    enabled: !!searchQuery,
  });
  return { ...query, isLoading: query.isPending && !!searchQuery };
};

export default useSearch;