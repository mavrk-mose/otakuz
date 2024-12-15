"use client"

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useAnimeRecommendations from "@/hooks/anime/use-anime-recommendations";

interface RecommendationsProps {
  animeId: string;
}

export function AnimeRecommendations({ animeId }: RecommendationsProps) {
  const { recommendations, isLoading } = useAnimeRecommendations(animeId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">You might alsolike</h2>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="w-[300px] shrink-0 animate-pulse">
                <div className="aspect-[2/3] bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }

  if (!recommendations?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">You might also like</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4">
          {recommendations.map((rec: any) => (
            <motion.div
              key={rec.entry.mal_id}
              className="w-[300px] shrink-0"
              whileHover={{ scale: 1.02 }}
            >
              <Card className="overflow-hidden">
                <div className="relative aspect-[2/3]">
                  <Image
                    src={rec.entry.images.jpg.large_image_url}
                    alt={rec.entry.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{rec.entry.score}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {rec.entry.type}
                    </Badge>
                  </div>
                  <Link
                    href={`/anime/${rec.entry.mal_id}`}
                    className="font-semibold hover:text-primary transition-colors line-clamp-1"
                  >
                    {rec.entry.title}
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}