"use client"

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Play } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface RecommendationsProps {
  animeId: string;
}

export function AnimeRecommendations({ animeId }: RecommendationsProps) {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['animeRecommendations', animeId],
    queryFn: async () => {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/recommendations`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">You might also like</h2>
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button className="w-full gap-2" asChild>
                        <Link href={`/watch/${rec.entry.mal_id}`}>
                          <Play className="h-4 w-4" />
                          Watch Now
                        </Link>
                      </Button>
                    </div>
                  </div>
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