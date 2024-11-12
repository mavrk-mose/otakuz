"use client"

import { TopAnime } from '@/types/anime';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface FeaturedAnimeProps {
  animeList: TopAnime[];
}

export default function FeaturedAnime({ animeList }: FeaturedAnimeProps) {
  if (!animeList.length) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No anime data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {animeList.map((anime) => (
        <Card key={anime.mal_id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-[200px]">
            <Image
              src={anime.images.webp.large_image_url}
              alt={anime.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-1">{anime.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm">{anime.score}</span>
              <Badge variant="secondary" className="ml-auto">
                {anime.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {anime.synopsis}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}