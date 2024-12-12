"use client";

import React from 'react';
import { AnimeEpisode } from "@/types/anime";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { PlayCircle, Star } from 'lucide-react';
import { Button } from '../ui/button';

interface AnimeEpisodeCardProps {
  episode: AnimeEpisode;
}

const AnimeEpisodeCard: React.FC<AnimeEpisodeCardProps> = ({ episode }) => {
  return (
    <Card className="w-[350px] relative">
      <div className="absolute top-2 right-2 text-4xl font-bold text-gray-300">
        {episode.mal_id}
      </div>
      <div className="ml-4 flex flex-col justify-between">
        <CardHeader>
          <CardTitle>{episode.title}</CardTitle>
          <CardTitle className="text-sm italic text-muted-foreground">{episode.title_japanese}</CardTitle>
          <CardDescription>{format(episode.aired, 'MMMM d, yyyy')}</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-lg font-bold">{episode.score ?? 'N/A'}</span>
          </div>
          <div>
            <span className="text-lg font-bold">Filler: {episode.filler ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="text-lg font-bold">Recap: {episode.recap ? 'Yes' : 'No'}</span>
          </div>
        </div>
        <CardFooter className="mt-4">
          <Button className="w-full">
            <a
              href={episode.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" /> Watch Episode
            </a>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default AnimeEpisodeCard;