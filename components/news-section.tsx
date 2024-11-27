"use client"

import { useQuery } from '@tanstack/react-query';
import { getAnimeNews } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function NewsSection() {
  const { data: newsList, isLoading } = useQuery({
    queryKey: ['animeNews'],
    queryFn: getAnimeNews
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {newsList?.map((news: any) => (
          <Card key={news.mal_id} className="overflow-hidden">
            <Link href={news.url} target="_blank" className="flex gap-4">
              <div className="relative w-48 aspect-video">
                <Image
                  src={news.images.jpg.image_url}
                  alt={news.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 p-4">
                <Badge className="mb-2">{news.author_username}</Badge>
                <h3 className="font-semibold line-clamp-2 mb-2">
                  {news.title}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {new Date(news.date).toLocaleDateString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {news.excerpt}
                </p>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}