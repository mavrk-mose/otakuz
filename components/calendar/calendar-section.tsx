"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfToday, startOfWeek } from "date-fns";
import { AlertCircle, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useFetchSchedules, {
  type GroupedSchedules,
  type ScheduleDay,
} from "@/hooks/calendar/use-fetch-schedules";
import { RealtimeClock } from "./clock";
import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";

const SCHEDULE_DAYS: ScheduleDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function CalendarSection() {
  const { t } = useI18n();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [activeDay, setActiveDay] = useState<ScheduleDay | null>(null);
  const [direction, setDirection] = useState(0);
  const [visibleEntries, setVisibleEntries] = useState(6);

  useEffect(() => {
    const today = startOfToday();
    setCurrentDate(startOfWeek(today, { weekStartsOn: 1 }));
    setActiveDay(SCHEDULE_DAYS[(today.getDay() + 6) % 7]);
  }, []);

  const days = currentDate
    ? SCHEDULE_DAYS.map((dayOfWeek, index) => {
        const date = addDays(currentDate, index);
        return {
          dayName: format(date, "EEE"),
          dayNumber: format(date, "d"),
          month: format(date, "MMM"),
          dayOfWeek,
        };
      })
    : [];

  useEffect(() => {
    setVisibleEntries(6);
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
    refetch,
  } = useFetchSchedules({
    day: activeDay,
    limit: 25,
  });

  const isRateLimited =
    error instanceof Error && /rate.?limit/i.test(error.message);

  const schedules =
    data?.pages.reduce((acc, page) => {
      Object.entries(page.schedules).forEach(([time, animeEntries]) => {
        acc[time] ??= [];
        acc[time].push(...animeEntries);
      });
      return acc;
    }, {} as GroupedSchedules) ?? {};

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
  const selectedDayCount = data?.pages[0]?.pagination.items.total;

  const handleShowMoreClick = () => {
    setVisibleEntries((prev) => prev + 6);
  };

  const handleLoadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      void fetchNextPage();
    }
  };

  const navigatePreviousWeek = () => {
    if (!currentDate) return;
    setDirection(-1);
    setCurrentDate(addDays(currentDate, -7));
  };

  const navigateNextWeek = () => {
    if (!currentDate) return;
    setDirection(1);
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleDayChange = (value: string) => {
    const selectedDay = SCHEDULE_DAYS.find((day) => day === value);
    if (!selectedDay) return;

    const currentIndex = days.findIndex((day) => day.dayOfWeek === activeDay);
    const newIndex = days.findIndex((day) => day.dayOfWeek === selectedDay);

    if (currentIndex !== -1 && newIndex !== -1) {
      setDirection(newIndex > currentIndex ? 1 : -1);
    }

    setActiveDay(selectedDay);
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
        <h1 className="text-2xl md:text-3xl font-bold text-primary">{t("home.schedule")}</h1>
        <RealtimeClock />
      </div>

      <div className="relative mb-8">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full"
          onClick={navigatePreviousWeek}
          disabled={!currentDate}
          aria-label={t("calendar.previousWeek")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="overflow-hidden px-0 sm:px-10">
          <motion.div
            key={currentDate?.toISOString() ?? "week-loading"}
            initial={{ x: direction * 500 }}
            animate={{ x: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <Tabs
              value={activeDay ?? ""}
              onValueChange={handleDayChange}
              className="w-full"
            >
              <TabsList
                aria-label={t("calendar.weekDays")}
                className="w-full h-auto bg-card/50 p-1 overflow-x-auto flex space-x-1 no-scrollbar"
              >
                {days.length > 0
                  ? days.map((day) => (
                      <TabsTrigger
                        key={day.dayOfWeek}
                        value={day.dayOfWeek}
                        className="flex-1 min-w-[70px] sm:min-w-[100px] py-3 sm:py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-xs sm:text-sm">
                            {day.dayName}
                          </span>
                          <span className="text-sm opacity-80">
                            {day.month} {day.dayNumber}
                          </span>
                        </div>
                      </TabsTrigger>
                    ))
                  : SCHEDULE_DAYS.map((day) => (
                      <Skeleton
                        key={day}
                        aria-hidden="true"
                        className="flex-1 min-w-[70px] sm:min-w-[100px] h-[62px] sm:h-[70px]"
                      />
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
          disabled={!currentDate}
          aria-label={t("calendar.nextWeek")}
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
          aria-busy={isLoading || isFetchingNextPage}
        >
          {selectedDayCount !== undefined && !isError && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {t("calendar.animeCount", { count: selectedDayCount })}
            </p>
          )}

          {isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {isRateLimited
                  ? t("calendar.rateLimited")
                  : t("calendar.loadFailed")}
              </AlertTitle>
              <AlertDescription>
                {isRateLimited
                  ? t("calendar.rateLimitedDescription")
                  : error instanceof Error
                    ? error.message
                    : t("calendar.loadFailedDescription")}
              </AlertDescription>
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                {t("common.tryAgain")}
              </Button>
            </Alert>
          ) : isLoading || !activeDay ? (
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
          ) : sortedTimes.length === 0 && hasNextPage ? (
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleLoadMore}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage
                ? t("calendar.loadingMore")
                : t("common.loadMore")}
            </Button>
          ) : sortedTimes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("calendar.noAnimeScheduled")}
            </div>
          ) : (
            <>
              {visibleAnimeEntries.map(({ time, anime }) => {
                const title =
                  anime.title_english || anime.title || t("calendar.untitledAnime");
                const imageUrl =
                  anime.images?.webp?.small_image_url ||
                  anime.images?.jpg?.small_image_url ||
                  anime.images?.webp?.image_url ||
                  anime.images?.jpg?.image_url ||
                  "/assets/logo.png";

                return (
                  <Link
                    key={anime.mal_id}
                    href={`/anime/${anime.mal_id}`}
                    className="block"
                  >
                    <motion.div
                      variants={itemVariants}
                      className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border-b border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-12 sm:w-16 font-mono text-xs sm:text-sm text-muted-foreground">
                        {time === "Unknown" ? "--:--" : time}
                      </div>
                      <div className="relative w-10 h-14 sm:w-12 sm:h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                        <Image
                          src={imageUrl}
                          alt={title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 40px, 48px"
                          onError={(event) => {
                            event.currentTarget.src = "/assets/logo.png";
                            event.currentTarget.srcset = "";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">
                          {title}
                        </h3>
                        {anime.title_japanese && (
                          <p className="text-xs text-muted-foreground truncate">
                            {anime.title_japanese}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                        <Play className="h-3 w-3 mr-1" />
                        {t("calendar.episodeNumber", {
                          episode: anime.episodes ?? "?",
                        })}
                      </div>
                    </motion.div>
                  </Link>
                );
              })}

              {hasMoreEntries && (
                <div className="pt-4">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleShowMoreClick}
                    disabled={isFetching}
                  >
                    {isFetching
                      ? t("calendar.loadingMore")
                      : t("calendar.showMore")}
                  </Button>
                </div>
              )}

              {!hasMoreEntries && hasNextPage && (
                <div className="pt-4">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleLoadMore}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage
                      ? t("calendar.loadingMore")
                      : t("common.loadMore")}
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
