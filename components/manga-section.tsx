"use client"

import { useQuery } from '@tanstack/react-query';
import { getTopManga } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function MangaSection() {
  const { data: mangaList, isLoading } = useQuery({
    queryKey: ['topManga'],
    queryFn: getTopManga
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mangaList?.map((manga: any) => (
          <Card key={manga.mal_id} className="overflow-hidden group">
            <div className="relative aspect-[2/3]">
              <Image
                src={manga.images.jpg.large_image_url}
                alt={manga.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-4 left-4 right-4">
                  <Button className="w-full gap-2" asChild>
                    <Link href={`/manga/${manga.mal_id}`}>
                      <BookOpen className="h-4 w-4" />
                      Read More
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{manga.score}</span>
                <Badge variant="secondary" className="ml-auto">
                  {manga.chapters || 'Ongoing'} CH
                </Badge>
              </div>
              <Link 
                href={`/manga/${manga.mal_id}`}
                className="font-semibold hover:text-primary transition-colors line-clamp-1"
              >
                {manga.title}
              </Link>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {manga.synopsis}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}