"use client"

import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import {useAnimeStore} from './store';
import {AnimeData, AnimeSearchResults, MangaResponse} from "@/types/anime";

const API_BASE_URL = 'https://api.jikan.moe/v4';

export function useTopAnime() {
  return useInfiniteQuery<AnimeSearchResults>({
    queryKey: ['topAnime'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`${API_BASE_URL}/top/anime?page=${pageParam}`);
      if (!response.ok) throw new Error('Failed to fetch top anime');
      const data = await response.json();
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_next_page) {
        return lastPage.pagination.last_visible_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useTopManga() {
  return useInfiniteQuery<MangaResponse>({
    queryKey: ['topManga'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`${API_BASE_URL}/top/manga?page=${pageParam}`);
      if (!response.ok) throw new Error('Failed to fetch top manga');
      return await response.json();
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_next_page) {
        return lastPage.pagination.last_visible_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useAnimeNews() {
  return useQuery({
    queryKey: ['animeNews'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/anime/1/news`);
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

export function useAnimeDetail(id: string) {
  return useQuery<AnimeData>({
    queryKey: ['animeDetail', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/anime/${id}`);
      if (!response.ok) throw new Error('Failed to fetch anime details');
      const data = await response.json();
      return data.data;
    },
  });
}