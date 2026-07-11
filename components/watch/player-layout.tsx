"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
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

interface PlayerSlotContextValue {
  registerSlot: (element: HTMLDivElement | null) => void;
}

const PlayerSlotContext = createContext<PlayerSlotContextValue | null>(null);

interface PersistentPlayerSlotProps {
  children?: ReactNode;
  className?: string;
  enabled?: boolean;
}

export function PersistentPlayerSlot({
  children,
  className,
  enabled = true,
}: PersistentPlayerSlotProps) {
  const context = useContext(PlayerSlotContext);
  const slotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!context || !enabled) {
      return;
    }

    context.registerSlot(slotRef.current);

    return () => context.registerSlot(null);
  }, [context, enabled]);

  return (
    <div ref={slotRef} className={className}>
      {children}
    </div>
  );
}

export function PlayerLayout({ children }: PlayerLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const playerRef = useRef<MediaPlayerInstance | null>(null);
  const restoredSourceRef = useRef<string | null>(null);
  const lastProgressUpdateRef = useRef(0);
  const previousPathnameRef = useRef(pathname);
  const [slotElement, setSlotElement] = useState<HTMLDivElement | null>(null);
  const [slotRect, setSlotRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const videoSrc = usePlayerStore((state) => state.videoSrc);
  const currentVideoId = usePlayerStore((state) => state.currentVideoId);
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

  const registerSlot = useCallback((element: HTMLDivElement | null) => {
    setSlotElement(element);
  }, []);

  const slotContextValue = useMemo(
    () => ({ registerSlot }),
    [registerSlot]
  );

  useEffect(() => {
    if (!slotElement) {
      setSlotRect(null);
      return;
    }

    let animationFrame = 0;
    const updateSlotRect = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const rect = slotElement.getBoundingClientRect();
        setSlotRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      });
    };

    updateSlotRect();
    const resizeObserver = new ResizeObserver(updateSlotRect);
    resizeObserver.observe(slotElement);
    window.addEventListener("resize", updateSlotRect);
    window.addEventListener("scroll", updateSlotRect, true);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSlotRect);
      window.removeEventListener("scroll", updateSlotRect, true);
    };
  }, [slotElement]);

  const playerPath = playerRoute?.split("?")[0];
  const isAwayFromPlayerRoute = Boolean(playerPath && pathname !== playerPath);
  const shouldDisplayMinimized = isMinimized || isAwayFromPlayerRoute;
  const isDocked = Boolean(!shouldDisplayMinimized && slotElement && slotRect);
  const isChannelPlayerOnChannelRoute = Boolean(
    pathname === "/channels" && currentVideoId?.startsWith("channel:")
  );
  const isWaitingForChannelSlot = Boolean(
    isChannelPlayerOnChannelRoute && !shouldDisplayMinimized && !isDocked
  );
  const dockedStyle: CSSProperties | undefined = isDocked && slotRect
    ? {
        position: "absolute",
        top: slotRect.top,
        left: slotRect.left,
        width: slotRect.width,
        margin: 0,
      }
    : undefined;

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
    const nextPlayerPath = state.playerRoute?.split("?")[0];

    if (state.isOpen && pathname !== nextPlayerPath) {
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
    <PlayerSlotContext.Provider value={slotContextValue}>
      {isOpen && videoSrc && (
        <section
          className={cn(
            "overflow-hidden border bg-card shadow-2xl transition-[width,transform,border-radius] duration-300",
            shouldDisplayMinimized
              ? "fixed bottom-4 left-4 right-4 z-[80] rounded-xl sm:left-auto sm:w-96"
              : isDocked
                ? "z-30 rounded-xl"
                : isWaitingForChannelSlot
                  ? "pointer-events-none fixed left-0 top-0 z-[-1] h-px w-px opacity-0"
                : "relative z-20 mx-auto my-4 w-[calc(100%-2rem)] max-w-5xl rounded-xl"
          )}
          style={dockedStyle}
          aria-label={shouldDisplayMinimized ? "Mini video player" : "Video player"}
        >
          {!shouldDisplayMinimized && (
            <div
              className={cn(
                "flex items-center gap-3 bg-card",
                isDocked
                  ? "absolute right-3 top-3 z-30 rounded-lg border border-white/10 bg-black/75 p-1 text-white shadow-xl backdrop-blur"
                  : "h-12 border-b px-4"
              )}
            >
              <p className={cn(
                "min-w-0 flex-1 truncate text-sm font-medium",
                isDocked && "sr-only"
              )}>
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
              {!shouldDisplayMinimized && (
                <DefaultVideoLayout
                  icons={defaultLayoutIcons}
                  colorScheme="dark"
                />
              )}
            </MediaPlayer>

            {shouldDisplayMinimized && (
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
    </PlayerSlotContext.Provider>
  );
}
