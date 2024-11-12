"use client"

import { useTopAnime } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import FeaturedAnime from './featured-anime';
import Link from 'next/link';

export function TopAnimeSection() {
  const { data: topAnime, isLoading, isError } = useTopAnime();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading anime data</div>;
  }

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Trending Anime</h2>
          <p className="text-muted-foreground">Top-rated series right now</p>
        </div>
        <Link href="/anime">
          <Button variant="outline" className="gap-2">
            View All <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
      <FeaturedAnime animeList={topAnime || []} />
    </section>
  );
}