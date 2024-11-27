"use client"
import { useQuery } from '@tanstack/react-query';
import {useAnimeStore} from "@/lib/store";
import {AnimeData, AnimeSearchResults, TopAnime} from "@/types/anime";

export const API_BASE_URL = 'https://api.jikan.moe/v4';

export function useTopAnime() {
  return useQuery({
    queryKey: ['topAnime'],
    queryFn: async () : Promise<TopAnime[]>  => {
      const response = await fetch(`${API_BASE_URL}/top/anime`);
      if (!response.ok) throw new Error('Failed to fetch top anime');
      const data = await response.json();
      return data.data;
    },
  });
}

export function useAnimeSearch() {
  const searchQuery = useAnimeStore((state: { searchQuery: any; }) => state.searchQuery);

  return useQuery({
    queryKey: ['animeSearch', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const response = await fetch(`${API_BASE_URL}/anime?q=${searchQuery}`);
      if (!response.ok) throw new Error('Failed to fetch search results');
      const data : AnimeSearchResults = await response.json();
      return data.data;
    },
    enabled: !!searchQuery,
  });
}

export function useAnimeDetail(id: string) {
  return useQuery({
    queryKey: ['animeDetail', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/anime/${id}`);
      if (!response.ok) throw new Error('Failed to fetch anime details');
      const data: AnimeData = await response.json();
      return data.data;
    },
  });
}