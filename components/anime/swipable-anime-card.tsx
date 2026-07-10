"use client";

import React, { useCallback, useEffect, useRef } from "react";
import {
  animate,
  motion,
  PanInfo,
  useMotionValue,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { BaseAnime } from "@/types/anime";

type SwipeDirection = "left" | "right";

interface SwipeRequest {
  id: number;
  animeId: number;
  direction: SwipeDirection;
}

interface SwipableAnimeCardProps {
  anime: BaseAnime;
  onSwipe: (direction: SwipeDirection) => void;
  onSwipeStart: () => void;
  swipeRequest: SwipeRequest | null;
  index: number;
  total: number;
}

const SWIPE_DISTANCE = 100;
const SWIPE_VELOCITY = 500;

export function SwipableAnimeCard({
  anime,
  onSwipe,
  onSwipeStart,
  swipeRequest,
  index,
  total,
}: SwipableAnimeCardProps) {
  const x = useMotionValue(0);
  const topCardRotation = useTransform(x, [-500, 0, 500], [-14, 0, 14]);
  const topCardOpacity = useTransform(
    x,
    [-700, -150, 0, 150, 700],
    [0, 0.85, 1, 0.85, 0]
  );
  const isLeaving = useRef(false);
  const lastHandledRequest = useRef<number | null>(null);

  const completeSwipe = useCallback(
    async (direction: SwipeDirection) => {
      if (index !== 0 || isLeaving.current) return;

      isLeaving.current = true;
      onSwipeStart();

      const viewportWidth =
        typeof window === "undefined" ? 1000 : window.innerWidth;
      const destination =
        direction === "right" ? viewportWidth * 1.25 : viewportWidth * -1.25;

      await animate(x, destination, {
        duration: 0.22,
        ease: "easeOut",
      });
      onSwipe(direction);
    },
    [index, onSwipe, onSwipeStart, x]
  );

  useEffect(() => {
    if (
      !swipeRequest ||
      swipeRequest.animeId !== anime.mal_id ||
      lastHandledRequest.current === swipeRequest.id
    ) {
      return;
    }

    lastHandledRequest.current = swipeRequest.id;
    void completeSwipe(swipeRequest.direction);
  }, [anime.mal_id, completeSwipe, swipeRequest]);

  const handleDragEnd = (_event: PointerEvent, info: PanInfo) => {
    const isFastEnough = Math.abs(info.velocity.x) >= SWIPE_VELOCITY;
    const isFarEnough = Math.abs(info.offset.x) >= SWIPE_DISTANCE;

    if (isFastEnough || isFarEnough) {
      const direction =
        info.offset.x !== 0
          ? info.offset.x > 0
            ? "right"
            : "left"
          : info.velocity.x > 0
            ? "right"
            : "left";

      void completeSwipe(direction);
      return;
    }

    animate(x, 0, {
      type: "spring",
      stiffness: 420,
      damping: 32,
    });
  };

  const stackRotation = index === 1 ? -4 : index === 2 ? 4 : 0;
  const stackOpacity = Math.max(0.7, 1 - index * 0.12);

  return (
    <motion.div
      drag={index === 0 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={false}
      animate={{
        scale: 1 - index * 0.05,
        y: index * 15,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 28,
        mass: 0.8,
      }}
      whileDrag={{ scale: 1.02, cursor: "grabbing" }}
      className="absolute h-full w-full"
      style={{
        x,
        rotate: index === 0 ? topCardRotation : stackRotation,
        opacity: index === 0 ? topCardOpacity : stackOpacity,
        zIndex: total - index,
        transformOrigin: "bottom center",
        cursor: index === 0 ? "grab" : "default",
        filter: `brightness(${1 - index * 0.08})`,
        touchAction: "pan-y",
        pointerEvents: index === 0 ? "auto" : "none",
      }}
    >
      <Card className="w-full h-full overflow-hidden bg-card shadow-xl select-none">
        <div className="relative w-full h-full">
          <Image
            src={anime.images.jpg.large_image_url}
            alt={anime.title}
            fill
            sizes="(max-width: 768px) 100vw, 576px"
            className="object-cover pointer-events-none"
            priority={index === 0}
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-4">
              {anime.title}
            </h2>
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 mr-1" />
                <span className="text-white font-semibold text-lg md:text-xl">
                  {anime.score?.toFixed(1) || "N/A"}
                </span>
              </div>
              <span className="text-white text-lg md:text-xl">
                {anime.episodes || "Unknown"} episodes
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <Badge
                  key={genre.mal_id}
                  variant="secondary"
                  className="text-sm md:text-base bg-black/50 hover:bg-black/60"
                >
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
