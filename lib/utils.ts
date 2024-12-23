import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {AnimeDetails, AnimeEntry} from "@/types/anime";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleWatchClick(anime: AnimeDetails, setSelectedAnime: (animeEntry: AnimeEntry) => void) {
  const { mal_id, url, images, title } = anime;
  const selectedAnime: AnimeEntry={ mal_id, url, images, title };
  setSelectedAnime(selectedAnime);
}