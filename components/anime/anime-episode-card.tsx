"use client";

import React from 'react';
import {AnimeEpisode} from "@/types/anime";
import Image from "next/image";
import {Card} from "@/components/ui/card";
import {format} from "date-fns";

interface AnimeEpisodeCardProps {
  episode: AnimeEpisode;
}

const AnimeEpisodeCard: React.FC<AnimeEpisodeCardProps> = ({ episode }) => {
  return (
    <Card className="overflow-hidden">
      <div className="ml-4 flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{episode.title}</h3>
        <p className="text-sm text-gray-600">{episode.title_romanji}</p>
        <p className="text-xs text-gray-400">{format(episode.aired, 'MMMM d, yyyy')}</p>
        <div className="mt-2">
          <p className="text-sm">
            <strong>Score:</strong> {episode.score ?? 'N/A'}
          </p>
          <p className="text-sm">
            <strong>Filler:</strong> {episode.filler ? 'Yes' : 'No'}
          </p>
          <p className="text-sm">
            <strong>Recap:</strong> {episode.recap ? 'Yes' : 'No'}
          </p>
        </div>
        <div className="mt-4">
          <a
            href={episode.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 text-sm hover:underline"
          >
            Watch Episode
          </a>
        </div>
      </div>
    </Card>
  );
};

export default AnimeEpisodeCard;
