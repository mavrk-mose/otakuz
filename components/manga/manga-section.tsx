"use client"

import { useQuery } from '@tanstack/react-query';
import { getTopManga } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function MangaSection() {
  const { data: mangaList, isLoading } = useQuery({
    queryKey: ['topManga'],
    queryFn: getTopManga
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Popular Manga</h2>
            <p className="text-muted-foreground">Must-read manga series</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/manga" className="gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {isLoading ? (
              Array(8).fill(null).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="aspect-[2/3] bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </Card>
              ))
          ) : (
              mangaList?.slice(0, 8).map((manga: any) => (
                  <motion.div key={manga.mal_id} variants={item}>
                    <Card className="overflow-hidden group">
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
                                Read Now
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
                  </motion.div>
              ))
          )}
        </motion.div>
      </section>
  );
}