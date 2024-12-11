"use client";

import React from 'react';
import { AnimeEpisode } from './types'; // Assuming you have this type defined elsewhere

interface AnimeEpisodeCardProps {
  episode: AnimeEpisode;
}

const AnimeEpisodeCard: React.FC<AnimeEpisodeCardProps> = ({ episode }) => {
  return (
    <div className="grid border border-gray-300 rounded-lg p-4 w-full max-w-sm">
      {/* Left side: Image (Optional, add if you want an image thumbnail for the episode) */}
      <div className="flex-shrink-0">
        {/* Optional image, replace with actual image URL if available */}
        <img src="https://via.placeholder.com/100" alt={episode.title} className="rounded-md" />
      </div>

      {/* Right side: Episode Info */}
      <div className="ml-4 flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{episode.title}</h3>
        <p className="text-sm text-gray-600">{episode.title_romanji}</p>
        <p className="text-xs text-gray-400">{episode.aired}</p>
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
    </div>
  );
};

export default AnimeEpisodeCard;
