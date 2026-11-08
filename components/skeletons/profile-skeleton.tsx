import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BoardSkeleton } from "./board-skeleton";

export function ProfileSkeleton() {
  return (
    <div
      className="container mx-auto space-y-8 px-4 py-6"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[380px_1fr]" aria-hidden="true">
        <div className="space-y-6">
          <Card className="rounded-2xl p-6">
            <div className="flex gap-4">
              <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
            <Skeleton className="mt-6 h-2 w-full" />
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </Card>
          <Card className="rounded-2xl p-6">
            <Skeleton className="mb-4 h-4 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex justify-between border-b py-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </Card>
        </div>
        <div>
          <div className="mb-6 flex w-fit max-w-full gap-1 rounded-xl border bg-muted/60 p-1">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>
          <div className="mb-6 flex flex-wrap justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <BoardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
