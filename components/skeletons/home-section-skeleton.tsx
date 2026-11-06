import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaCardSkeleton } from "./media-card-skeleton";
import { CommunityMemberSkeleton } from "./community-member-skeleton";
import { NewsGridSkeleton } from "./news-skeleton";

export function EventCardSkeleton() {
  return (
    <Card aria-hidden="true" className="overflow-hidden">
      <Skeleton className="h-48 rounded-none" />
      <div className="p-4">
        <Skeleton className="mb-2 h-7 w-3/4" />
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function HomeSectionSkeleton({
  type,
}: {
  type: "anime" | "manga" | "community" | "news" | "events" | "calendar";
}) {
  return (
    <section
      className={
        type === "anime" || type === "news" ? "space-y-6" : "space-y-8"
      }
      aria-busy="true"
      aria-label={`Loading ${type}`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-4 ${type === "anime" || type === "news" ? "border-b pb-4" : ""}`}
      >
        <div className="min-w-0 space-y-2">
          {type === "anime" && <Skeleton className="h-4 w-28" />}
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-5 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      {type === "news" ? (
        <NewsGridSkeleton home />
      ) : type === "community" ? (
        <div className="flex gap-4 overflow-hidden pb-3 pt-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="w-[270px] shrink-0 sm:w-[285px]">
              <CommunityMemberSkeleton />
            </div>
          ))}
        </div>
      ) : type === "events" ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : type === "calendar" ? (
        <>
          <div className="flex gap-1 overflow-hidden px-0 sm:px-10">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton
                key={i}
                className="h-[62px] min-w-[70px] flex-1 sm:h-[70px] sm:min-w-[100px]"
              />
            ))}
          </div>
          <Card className="overflow-hidden">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 border-b p-3 sm:gap-4 sm:p-4"
              >
                <Skeleton className="h-5 w-12 sm:w-16" />
                <Skeleton className="h-14 w-10 shrink-0 sm:h-16 sm:w-12" />
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-16 sm:w-24" />
              </div>
            ))}
          </Card>
        </>
      ) : (
        <div
          className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 ${type === "anime" ? "gap-5" : "gap-6"}`}
        >
          <MediaCardSkeleton
            count={8}
            variant={type === "anime" ? "home-anime" : "home-manga"}
          />
        </div>
      )}
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <div
      className="relative h-[70vh] overflow-hidden bg-muted/30"
      aria-busy="true"
      aria-label="Loading featured anime"
    >
      <div className="container relative mx-auto flex h-full items-center px-4">
        <div className="w-full max-w-2xl space-y-6" aria-hidden="true">
          <div className="space-y-2">
            <Skeleton className="h-10 w-4/5 md:h-[60px]" />
            <div className="flex gap-2">
              <Skeleton className="h-[22px] w-20" />
              <Skeleton className="h-[22px] w-20" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-11 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
