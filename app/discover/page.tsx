"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SwipableAnimeCard } from "@/components/anime/swipable-anime-card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import useFetchAnime from "@/hooks/anime/use-fetch-anime";
import { DiscoverSkeleton } from "@/components/skeletons/discover-skeleton";
import { useI18n } from "@/components/i18n-provider";

const VISIBLE_CARDS = 3;
const FETCH_THRESHOLD = 20;

type SwipeDirection = "left" | "right";

interface SwipeRequest {
  id: number;
  animeId: number;
  direction: SwipeDirection;
}

export default function DiscoverPage() {
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeRequest, setSwipeRequest] = useState<SwipeRequest | null>(null);
  const lastFetchTriggerIndex = useRef<number | null>(null);
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchAnime();

  // Rankings can move between requests. De-duplicating here keeps React keys and
  // the position of the active card stable while another page is appended.
  const animeList = useMemo(() => {
    const animeById = new Map(
      (data?.pages.flatMap((page) => page.data) ?? []).map((anime) => [
        anime.mal_id,
        anime,
      ])
    );

    return Array.from(animeById.values());
  }, [data]);

  const handleSwipe = useCallback((_direction: SwipeDirection) => {
    setSwipeRequest(null);
    setCurrentIndex((previousIndex) => previousIndex + 1);
    setIsSwiping(false);
  }, []);

  const handleButtonClick = (direction: SwipeDirection) => {
    const currentAnime = animeList[currentIndex];

    if (!currentAnime || isSwiping) return;

    setIsSwiping(true);
    setSwipeRequest((previousRequest) => ({
      id: (previousRequest?.id ?? 0) + 1,
      animeId: currentAnime.mal_id,
      direction,
    }));
  };

  // Start the next request while there are still plenty of cards to swipe.
  // isFetchingNextPage prevents effects/re-renders from queueing duplicate calls.
  useEffect(() => {
    const remainingCards = animeList.length - currentIndex;

    if (
      remainingCards <= FETCH_THRESHOLD &&
      hasNextPage &&
      !isFetchingNextPage &&
      lastFetchTriggerIndex.current !== currentIndex
    ) {
      lastFetchTriggerIndex.current = currentIndex;
      void fetchNextPage();
    }
  }, [
    animeList.length,
    currentIndex,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  if (isLoading) {
    return <DiscoverSkeleton />;
  }

  const visibleAnime = animeList.slice(
    currentIndex,
    currentIndex + VISIBLE_CARDS
  );
  const hasCurrentCard = visibleAnime.length > 0;

  if (!hasCurrentCard && isFetchingNextPage) {
    return <DiscoverSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
      <h1 className="mb-8 text-4xl font-bold text-foreground md:mb-12 md:text-5xl lg:text-6xl">
        {t("anime.discover")}
      </h1>

      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl aspect-[3/4] relative perspective-1000">
        {visibleAnime.map((anime, index) => (
          <SwipableAnimeCard
            key={anime.mal_id}
            anime={anime}
            onSwipe={handleSwipe}
            onSwipeStart={() => setIsSwiping(true)}
            swipeRequest={
              swipeRequest?.animeId === anime.mal_id
                ? swipeRequest
                : null
            }
            index={index}
            total={visibleAnime.length}
          />
        ))}
      </div>

      <div className="flex justify-center mt-8 md:mt-12 gap-4 md:gap-6">
        <Button
          size="lg"
          variant="destructive"
          onClick={() => handleButtonClick("left")}
          disabled={!hasCurrentCard || isSwiping}
          className="text-lg md:text-xl px-6 md:px-8 py-3 md:py-4"
        >
          <ThumbsDown className="mr-2 h-5 w-5 md:h-6 md:w-6" />
          Nope
        </Button>
        <Button
          size="lg"
          variant="default"
          onClick={() => handleButtonClick("right")}
          disabled={!hasCurrentCard || isSwiping}
          className="text-lg md:text-xl px-6 md:px-8 py-3 md:py-4"
        >
          <ThumbsUp className="mr-2 h-5 w-5 md:h-6 md:w-6" />
          Like
        </Button>
      </div>
    </div>
  );
}
