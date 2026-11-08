import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaCardSkeleton } from "./media-card-skeleton";

export function RecommendationsSkeleton({ title }: { title?: string }) {
  return (
    <div
      className="w-full min-w-0 max-w-full space-y-4"
      aria-busy="true"
      aria-label="Loading recommendations"
    >
      {title ? (
        <h2 className="text-2xl font-bold">{title}</h2>
      ) : (
        <Skeleton className="h-8 w-64 max-w-full" />
      )}
      <ScrollArea className="w-full min-w-0 max-w-full">
        <div className="flex w-max gap-4 py-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="w-[210px] shrink-0 sm:w-[240px] md:w-[260px]">
              <MediaCardSkeleton count={1} variant="recommendation" />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
