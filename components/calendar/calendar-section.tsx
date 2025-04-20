"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import useFetchSchedules from "@/hooks/calendar/use-fetch-schedules";
import { RealtimeClock } from "./clock";
import Link from "next/link";

export function CalendarSection() {
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [activeDay, setActiveDay] = useState<string>("");
  const [direction, setDirection] = useState(0);
  const [visibleEntries, setVisibleEntries] = useState(6);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    delay: 500,
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentDate, i);
    return {
      date,
      dayName: format(date, "EEE"),
      dayNumber: format(date, "d"),
      month: format(date, "MMM"),
      dayOfWeek: format(date, "EEEE").toLowerCase(),
    };
  });

  useEffect(() => {
    if (days.length > 0 && !activeDay) {
      setActiveDay(days[0].dayOfWeek);
    }
  }, [days, activeDay]);

  useEffect(() => {
    setVisibleEntries(6);
    setIsRateLimited(false);
  }, [activeDay]);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useFetchSchedules({
    day: activeDay,
    sfw: true,
    limit: 25,
  });

  useEffect(() => {
    if (error instanceof Error && error.message.includes("rate-limit")) {
      setIsRateLimited(true);
    }
  }, [error]);

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage && !isRateLimited) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isRateLimited]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (inView) {
      timeoutId = setTimeout(() => {
        handleLoadMore();
      }, 1000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [inView, handleLoadMore]);

  const schedules =
    data?.pages.reduce((acc, page) => {
      // Merge all time slots from all pages
      Object.entries(page).forEach(([time, animes]) => {
        if (!acc[time]) {
          acc[time] = [];
        }
        acc[time] = [...acc[time], ...animes];
      });
      return acc;
    }, {}) || {};

  const sortedTimes = Object.keys(schedules).sort((a, b) => {
    const timeA = a === "Unknown" ? "99:99" : a;
    const timeB = b === "Unknown" ? "99:99" : b;
    return timeA.localeCompare(timeB);
  });

  // Flatten all anime entries for limiting visible items
  const allAnimeEntries = sortedTimes.flatMap((time) =>
    schedules[time].map((anime) => ({ time, anime }))
  );

  const visibleAnimeEntries = allAnimeEntries.slice(0, visibleEntries);
  const hasMoreEntries = allAnimeEntries.length > visibleEntries;

  const handleShowMoreClick = () => {
    setVisibleEntries((prev) => prev + 6);
  };

  const navigatePreviousWeek = () => {
    setDirection(-1);
    setCurrentDate(addDays(currentDate, -7));
  };

  const navigateNextWeek = () => {
    setDirection(1);
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleDayChange = (value: string) => {
    const currentIndex = days.findIndex((day) => day.dayOfWeek === activeDay);
    const newIndex = days.findIndex((day) => day.dayOfWeek === value);

    if (currentIndex !== -1 && newIndex !== -1) {
      setDirection(newIndex > currentIndex ? 1 : -1);
    }

    setActiveDay(value);
  };

  const containerVariants = {
    hidden: (direction: number) => ({
      x: direction * 100,
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        staggerChildren: 0.05,
      },
    },
    exit: (direction: number) => ({
      x: direction * -100,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Schedule</h1>
        <RealtimeClock />
      </div>

      {isRateLimited && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Rate Limited</AlertTitle>
          <AlertDescription>
            We're being rate limited by the API. Please wait a moment before
            trying again.
          </AlertDescription>
        </Alert>
      )}

      <div className="relative mb-8">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full"
          onClick={navigatePreviousWeek}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="overflow-hidden px-0 sm:px-10">
          <motion.div
            key={currentDate.toISOString()}
            initial={{ x: direction * 500 }}
            animate={{ x: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <Tabs
              defaultValue={activeDay}
              value={activeDay}
              onValueChange={handleDayChange}
              className="w-full"
            >
              <TabsList className="w-full h-auto bg-card/50 p-1 overflow-x-auto flex space-x-1 no-scrollbar">
                {days.map((day) => (
                  <TabsTrigger
                    key={day.dayOfWeek}
                    value={day.dayOfWeek}
                    className="flex-1 min-w-[70px] sm:min-w-[100px] py-3 sm:py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-xs sm:text-sm">{day.dayName}</span>
                      <span className="text-sm opacity-80">
                        {day.month} {day.dayNumber}
                      </span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full"
          onClick={navigateNextWeek}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeDay}
          custom={direction}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-4"
        >
          {isError && !isRateLimited ? (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error instanceof Error
                ? error.message
                : "Failed to load schedules. Please try again later."}
            </div>
          ) : isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border-b border-border"
              >
                <Skeleton className="w-12 sm:w-16 h-5 sm:h-6" />
                <Skeleton className="w-10 h-14 sm:w-12 sm:h-16 rounded-md" />
                <Skeleton className="flex-1 h-5 sm:h-6" />
                <Skeleton className="w-16 sm:w-24 h-5 sm:h-6" />
              </div>
            ))
          ) : sortedTimes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No anime scheduled for this day.
            </div>
          ) : (
            <>
              {visibleAnimeEntries.map(({ time, anime }, index) => (
                <Link key={`${anime.mal_id}-${index}`} href={`/anime/${anime.mal_id}`}>
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-12 sm:w-16 font-mono text-xs sm:text-sm text-muted-foreground">
                      {time === "Unknown" ? "--:--" : time}
                    </div>
                    <div className="relative w-10 h-14 sm:w-12 sm:h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                      <Image
                        src={
                          anime.images?.jpg?.image_url ||
                          "/placeholder.svg?height=64&width=48"
                        }
                        alt={anime.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 40px, 48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base truncate">
                        {anime.title_english || anime.title}
                      </h3>
                      {anime.title_japanese && (
                        <p className="text-xs text-muted-foreground truncate">
                          {anime.title_japanese}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                      <Play className="h-3 w-3 mr-1" />
                      Episode {anime.episodes || "?"}
                    </div>
                  </motion.div>
                </Link>
              ))}

              {hasMoreEntries && (
                <div className="pt-4">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleShowMoreClick}
                    disabled={isFetching || isRateLimited}
                  >
                    {isFetching ? "Loading more..." : "Show more"}
                  </Button>
                </div>
              )}

              {hasNextPage && !isRateLimited && (
                <div
                  ref={loadMoreRef}
                  className="h-10 w-full flex items-center justify-center"
                >
                  {isFetchingNextPage && (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
