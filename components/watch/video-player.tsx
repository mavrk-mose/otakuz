"use client";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";

interface VideoPlayerProps {
  videoUrl: string;
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  return (
    <MediaPlayer
      className="aspect-video h-full w-full overflow-hidden rounded-lg bg-black text-white"
      src={videoUrl}
      title="Anime video"
      playsInline
    >
      <MediaProvider />
      <DefaultVideoLayout colorScheme="dark" icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
