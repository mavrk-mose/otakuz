"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  MediaPlayer,
  MediaProvider,
  type MediaPlayerInstance,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import { Maximize2, Minimize2, Pause, Play, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/use-player-store";

interface PlayerLayoutProps {
  children: ReactNode;
}

export function PlayerLayout({ children }: PlayerLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const playerRef = useRef<MediaPlayerInstance | null>(null);
  const restoredSourceRef = useRef<string | null>(null);
  const lastProgressUpdateRef = useRef(0);
  const previousPathnameRef = useRef(pathname);

  const videoSrc = usePlayerStore((state) => state.videoSrc);
  const title = usePlayerStore((state) => state.title);
  const posterUrl = usePlayerStore((state) => state.posterUrl);
  const playerRoute = usePlayerStore((state) => state.playerRoute);
  const isOpen = usePlayerStore((state) => state.isOpen);
  const isMinimized = usePlayerStore((state) => state.isMinimized);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const play = usePlayerStore((state) => state.play);
  const pause = usePlayerStore((state) => state.pause);
  const minimize = usePlayerStore((state) => state.minimize);
  const maximize = usePlayerStore((state) => state.maximize);
  const close = usePlayerStore((state) => state.close);

  const attachPlayer = useCallback((player: MediaPlayerInstance | null) => {
    playerRef.current = player;
    usePlayerStore.getState().attachPlayer(player);
  }, []);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;

    const state = usePlayerStore.getState();
    const playerPath = state.playerRoute?.split("?")[0];

    if (state.isOpen && pathname !== playerPath) {
      state.minimize();
    }
  }, [pathname]);

  const handleCanPlay = () => {
    const player = playerRef.current;

    if (!player || !videoSrc || restoredSourceRef.current === videoSrc) {
      return;
    }

    restoredSourceRef.current = videoSrc;
    const savedTime = usePlayerStore.getState().currentPlaybackTime;

    if (savedTime > 0 && Number.isFinite(savedTime)) {
      player.currentTime = savedTime;
    }
  };

  const handleTimeUpdate = () => {
    const player = playerRef.current;

    if (!player || Date.now() - lastProgressUpdateRef.current < 1_000) {
      return;
    }

    lastProgressUpdateRef.current = Date.now();
    usePlayerStore.getState().setCurrentPlaybackTime(player.currentTime);
  };

  const handleMaximize = () => {
    maximize();

    if (playerRoute) {
      router.push(playerRoute);
    }
  };

  return (
    <>
      {isOpen && videoSrc && (
        <section
          className={cn(
            "overflow-hidden border bg-card shadow-2xl transition-[width,transform,border-radius] duration-300",
            isMinimized
              ? "fixed bottom-4 left-4 right-4 z-[80] rounded-xl sm:left-auto sm:w-96"
              : "relative z-20 mx-auto my-4 w-[calc(100%-2rem)] max-w-5xl rounded-xl"
          )}
          aria-label={isMinimized ? "Mini video player" : "Video player"}
        >
          {!isMinimized && (
            <div className="flex h-12 items-center gap-3 border-b bg-card px-4">
              <p className="min-w-0 flex-1 truncate text-sm font-medium">
                {title}
              </p>
              <button
                type="button"
                onClick={minimize}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Minimize video"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close video"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="relative aspect-video bg-black">
            <MediaPlayer
              ref={attachPlayer}
              className="h-full w-full bg-black text-white focus-visible:outline-none"
              src={videoSrc}
              title={title}
              poster={posterUrl ?? undefined}
              playsInline
              crossOrigin
              preload="metadata"
              onCanPlay={handleCanPlay}
              onPlay={() => usePlayerStore.getState().setIsPlaying(true)}
              onPause={() => {
                const player = playerRef.current;

                if (player) {
                  usePlayerStore
                    .getState()
                    .setCurrentPlaybackTime(player.currentTime);
                }

                usePlayerStore.getState().setIsPlaying(false);
              }}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => usePlayerStore.getState().setIsPlaying(false)}
            >
              <MediaProvider />
              {!isMinimized && (
                <DefaultVideoLayout
                  icons={defaultLayoutIcons}
                  colorScheme="dark"
                />
              )}
            </MediaPlayer>

            {isMinimized && (
              <>
                <button
                  type="button"
                  onClick={handleMaximize}
                  className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                  aria-label="Open full video player"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-10 text-white">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      isPlaying ? pause() : play();
                    }}
                    className="pointer-events-auto rounded-full bg-white/15 p-2 transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleMaximize}
                    className="pointer-events-auto min-w-0 flex-1 truncate text-left text-sm font-medium focus-visible:outline-none focus-visible:underline"
                  >
                    {title}
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleMaximize();
                    }}
                    className="pointer-events-auto rounded-full p-2 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Maximize video"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      close();
                    }}
                    className="pointer-events-auto rounded-full p-2 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Close video"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {children}
    </>
  );
}
