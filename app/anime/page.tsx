"use client"

import { useTopAnime } from '@/lib/queries';
import FeaturedAnime from '@/components/featured-anime';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AnimePage() {
  const { data: animeList, isLoading } = useTopAnime();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Anime Collection</h1>
          <p className="text-muted-foreground">
            Discover and explore your next favorite anime series
          </p>
        </div>
        <div className="flex gap-4">
          <Select defaultValue="popularity">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              <SelectItem value="action">Action</SelectItem>
              <SelectItem value="comedy">Comedy</SelectItem>
              <SelectItem value="drama">Drama</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <>
          <FeaturedAnime animeList={animeList || []} />
          <div className="flex justify-center mt-8">
            <Button variant="outline" size="lg">
              Load More
            </Button>
          </div>
        </>
      )}
    </div>
  );
}