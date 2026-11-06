import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendationsSkeleton } from "./recommendations-skeleton";

export default function DetailsSkeleton({
  type = "anime",
}: {
  type?: "anime" | "manga";
}) {
  const anime = type === "anime";
  return (
    <div
      className="container mx-auto max-w-full px-4 py-8"
      aria-busy="true"
      aria-label={`Loading ${type} details`}
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)]">
        <div
          className="min-w-0 space-y-4 self-start lg:sticky lg:top-4"
          aria-hidden="true"
        >
          <Card className="overflow-hidden">
            <Skeleton className="aspect-[2/3] w-full rounded-none" />
          </Card>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className={anime ? "h-10 w-10" : "h-10 w-full"} />
          </div>
          {anime ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          <Card className="space-y-4 p-4">
            <div className="space-y-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-7 w-3/4" />
            </div>
            {anime && <Skeleton className="h-2 w-full" />}
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="min-w-0 max-w-full space-y-6">
          <div aria-hidden="true">
            <Skeleton className="mb-2 h-9 w-4/5 sm:h-10" />
            <Skeleton className="mb-4 h-7 w-1/2" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-[22px] w-20 rounded-full" />
              ))}
            </div>
          </div>
          <div className="w-full min-w-0" aria-hidden="true">
            <div className="inline-flex max-w-full flex-wrap gap-1 rounded-md bg-muted p-1">
              {Array.from({ length: anime ? 4 : 2 }, (_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
            <div className="mt-2 space-y-4">
              <Card className="p-6">
                <Skeleton className="mb-4 h-7 w-28" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Skeleton
                      key={i}
                      className={`h-[18px] ${i === 4 ? "w-2/3" : "w-full"}`}
                    />
                  ))}
                </div>
              </Card>
              <div className={anime ? "grid gap-4 md:grid-cols-2" : ""}>
                {Array.from({ length: anime ? 2 : 1 }, (_, i) => (
                  <Card key={i} className={anime ? "p-4" : "p-6"}>
                    <Skeleton className="mb-2 h-6 w-32" />
                    <div
                      className={
                        anime ? "space-y-2" : "grid gap-4 md:grid-cols-2"
                      }
                    >
                      {Array.from({ length: anime ? 5 : 2 }, (_, row) => (
                        <div key={row} className="flex gap-3">
                          <Skeleton className="h-5 w-24 shrink-0" />
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 min-w-0 w-full max-w-full">
            <RecommendationsSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
