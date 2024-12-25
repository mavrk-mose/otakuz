"use client"

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useClickOutside } from '@/hooks/search/use-click-outside';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import {useAnimeStore} from "@/store/use-anime-store";
import Lottie from "lottie-react";
import Pochita from "@/public/lottie/Animation - 1734030996440.json"
import useSearch from "@/hooks/search/use-search";

interface SearchDropdownProps {
  onSelect?: () => void;
}

export function SearchDropdown({ onSelect }: SearchDropdownProps) {
  const { data: searchResults, isLoading } = useSearch();
  const searchQuery = useAnimeStore((state) => state.searchQuery);
  const setSearchQuery = useAnimeStore((state) => state.setSearchQuery);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setSearchQuery('');
    }
  });

  if (!searchQuery) return null;

  return (
    <Card ref={dropdownRef} className="absolute top-full mt-2 w-full z-50 shadow-lg">
      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="p-4 text-center">
            <Lottie animationData={Pochita}/>
          </div>
        ) : searchResults?.length ? (
          <div className="p-2">
            {searchResults.map((anime: any) => (
              <Link
                href={`/anime/${anime.mal_id}`}
                key={anime.mal_id}
                className="flex items-start gap-3 p-2 hover:bg-accent rounded-lg"
                onClick={onSelect}
              >
                <Image
                  src={anime.images.jpg.small_image_url}
                  alt={anime.title}
                  width={50}
                  height={70}
                  className="rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{anime.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {anime.episodes} episodes • Score: {anime.score}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No results found
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}