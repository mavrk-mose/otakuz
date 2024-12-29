"use client"

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, PlayCircle} from 'lucide-react';
import Link from 'next/link';
import useRandomAnime from "@/hooks/anime/use-random-anime";
import {handleWatchClick} from "@/lib/utils";
import {useWatchStore} from "@/store/use-watch-store";

export function HeroSection() {
  const { data: anime } = useRandomAnime(); // Default to a popular anime
  const [background, setBackground] = useState('');
  const { setSelectedAnime } = useWatchStore();

  useEffect(() => {
    if (anime?.images?.webp?.image_url) {
      setBackground(anime.images.jpg.large_image_url);
    }
  }, [anime]);

  if (!anime) return null;

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${background})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative h-full flex items-center">
        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              {anime.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <Badge key={genre.mal_id} variant="secondary">
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>

          <p className="text-lg text-gray-200 line-clamp-3">
            {anime.synopsis}
          </p>

          <div className="flex gap-4">
            <Button
                className="w-full gap-2"
                asChild
                onClick={() => handleWatchClick(anime, setSelectedAnime)}
            >
              <Link href="/watch">
                <PlayCircle className="w-4 h-4" /> Watch Trailer
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`/anime/${anime.mal_id}`}>
                <Info className="mr-2 h-5 w-5" />
                More Info
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}