"use client";

import { useEffect, useRef } from "react";
import {
  MediaPlayer,
  MediaProvider,
  Track,
  type MediaPlayerInstance,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";

export interface VideoSubtitle {
  src: string;
  label: string;
  language: string;

  /**
   * Supported values include:
   * - "subtitles"
   * - "captions"
   * - "chapters"
   * - "descriptions"
   */
  kind?: "subtitles" | "captions" | "chapters" | "descriptions";

  /**
   * Needed for non-VTT files such as SRT or ASS.
   */
  type?: "vtt" | "srt" | "ssa" | "ass" | "json";

  default?: boolean;
}

export interface VideoPlayerProps {
  videoUrl: string;

  title?: string;
  posterUrl?: string;

  /**
   * A VTT or JSON thumbnail file used for timeline previews.
   */
  thumbnailUrl?: string;

  subtitles?: VideoSubtitle[];

  /**
   * A unique key for this episode.
   * Useful for saving progress outside the component.
   */
  mediaId?: string;

  autoPlay?: boolean;
  muted?: boolean;
  startTime?: number;

  onReady?: () => void;
  onEnded?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
}

export function VideoPlayer({
  videoUrl,
  title = "Anime video",
  posterUrl,
  thumbnailUrl,
  subtitles = [],
  mediaId,
  autoPlay = false,
  muted = false,
  startTime = 0,
  onReady,
  onEnded,
  onProgress,
}: VideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const lastProgressUpdateRef = useRef(0);

  /*
   * Restore the starting position once the media can play.
   */
  const handleCanPlay = () => {
    const player = playerRef.current;

    if (player && startTime > 0) {
      player.currentTime = startTime;
    }

    onReady?.();
  };

  /*
   * Throttle progress updates so you don't send an API request
   * several times per second.
   */
  const handleTimeUpdate = () => {
    const player = playerRef.current;

    if (!player || !onProgress) {
      return;
    }

    const now = Date.now();

    if (now - lastProgressUpdateRef.current < 5_000) {
      return;
    }

    lastProgressUpdateRef.current = now;

    onProgress(player.currentTime, player.duration);
  };

  /*
   * Save progress when the user leaves or the component unmounts.
   */
  useEffect(() => {
    return () => {
      const player = playerRef.current;

      if (
        player &&
        onProgress &&
        Number.isFinite(player.currentTime) &&
        Number.isFinite(player.duration)
      ) {
        onProgress(player.currentTime, player.duration);
      }
    };
  }, [onProgress]);

  return (
    <MediaPlayer
      ref={playerRef}
      key={mediaId ?? videoUrl}
      className="
        aspect-video
        h-full
        w-full
        overflow-hidden
        rounded-lg
        bg-black
        text-white
        shadow-lg
        ring-1
        ring-white/10
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary
      "
      src={videoUrl}
      title={title}
      poster={posterUrl}
      autoPlay={autoPlay}
      muted={muted}
      playsInline
      crossOrigin
      preload="metadata"
      onCanPlay={handleCanPlay}
      onTimeUpdate={handleTimeUpdate}
      onEnded={onEnded}
    >
      <MediaProvider>
        {subtitles.map((subtitle) => (
          <Track
            key={`${subtitle.language}-${subtitle.kind ?? "subtitles"}`}
            src={subtitle.src}
            label={subtitle.label}
            lang={subtitle.language}
            kind={subtitle.kind ?? "subtitles"}
            type={subtitle.type}
            default={subtitle.default}
          />
        ))}
      </MediaProvider>

      <DefaultVideoLayout
        icons={defaultLayoutIcons}
        colorScheme="dark"
        thumbnails={thumbnailUrl}
      />
    </MediaPlayer>
  );
}