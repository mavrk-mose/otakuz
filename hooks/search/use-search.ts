"use client"

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

  return useQuery({
    queryKey: ['combinedSearch', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];

      const [animeResponse, mangaResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/anime?q=${searchQuery}&limit=5`),
        fetch(`${API_BASE_URL}/manga?q=${searchQuery}&limit=5`)
      ]);

      if (!animeResponse.ok || !mangaResponse.ok) {
        throw new Error('Failed to fetch search results');
      }

      const [animeData, mangaData] = await Promise.all([
        animeResponse.json(),
        mangaResponse.json()
      ]);

      
      const animeResults: SearchResult[] = animeData.data.map((anime: any) => ({
        id: anime.mal_id.toString(),
        title: anime.title,
        type: 'anime',
        image: anime.images.jpg.small_image_url,
        score: anime.score,
        episodes: anime.episodes
      }));

      const mangaResults: SearchResult[] = mangaData.data.map((manga: any) => ({
        id: manga.mal_id.toString(),
        title: manga.title,
        type: 'manga',
        image: manga.images.jpg.small_image_url,
        score: manga.score,
        chapters: manga.chapters
      }));

      return [...animeResults, ...mangaResults]
        .sort((a, b) => (b.score || 0) - (a.score || 0));
    },
    enabled: !!searchQuery,
  });
};

export default useSearch;