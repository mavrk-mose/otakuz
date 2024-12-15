"use client"

import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import {AnimeData, AnimeSearchResults, Manga} from "@/types/anime";
import {useAnimeStore} from "@/store/use-anime-store";

const API_BASE_URL = 'https://api.jikan.moe/v4';

export function useAnimeNews() {
  return useQuery({
    queryKey: ['animeNews'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/anime/2/news`);
      if (!response.ok) throw new Error('Failed to fetch anime news');
      const data = await response.json();
      return data.data;
    },
  });
}

export function useAnimeSearch() {
  const searchQuery = useAnimeStore((state) => state.searchQuery);

  return useQuery({
    queryKey: ['animeSearch', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const response = await fetch(`${API_BASE_URL}/anime?q=${searchQuery}`);
      if (!response.ok) throw new Error('Failed to fetch search results');
      const data = await response.json();
      return data.data;
    },
    enabled: !!searchQuery,
  });
}

export function useAnimePictures(id: string) {
  return useQuery<AnimeData["images"][]>({
    queryKey: ['animePictures', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/anime/${id}/pictures`);
      if (!response.ok) throw new Error('Failed to fetch anime details');
      const data = await response.json();
      return data.data;
    },
  });
}

export function useMangaPictures(id: string) {
  return useQuery<Manga["images"][]>({
    queryKey: ['mangaPictures', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/manga/${id}/pictures`);
      if (!response.ok) throw new Error('Failed to fetch anime details');
      const data = await response.json();
      return data.data;
    },
  });
}

export function useAnimeRecommendations() {
  const {data, isLoading, fetchNextPage, hasNextPage} = useInfiniteQuery({
    queryKey: ['animeRecommendations'],
    queryFn: async ({ pageParam = 1 }) => {
        const response = await fetch(`${API_BASE_URL}/recommendations/anime`);
        if (!response.ok) throw new Error('Failed to fetch anime');
        return response.json();
    },
    getNextPageParam: (lastPage) => {
        if (lastPage.pagination.has_next_page) {
            return lastPage.pagination.current_page + 1;
        }
        return undefined;
    },
    initialPageParam: 1
  })

  return {data, isLoading, fetchNextPage, hasNextPage};
}

export function useAnimeEpisodes(id: string) {
  const {data, isLoading, fetchNextPage, hasNextPage} = useInfiniteQuery({
    queryKey: ['animeEpisodes', id],
    queryFn: async ({ pageParam = 1 }) => {
        const response = await fetch(`${API_BASE_URL}/anime/${id}/episodes`);
        if (!response.ok) throw new Error('Failed to fetch anime');
        return response.json();
    },
    getNextPageParam: (lastPage) => {
        if (lastPage.pagination.has_next_page) {
            return lastPage.pagination.current_page + 1;
        }
        return undefined;
    },
    initialPageParam: 1
  })

  return {data, isLoading, fetchNextPage, hasNextPage};
}
