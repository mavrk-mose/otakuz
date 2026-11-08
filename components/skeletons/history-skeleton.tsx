import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HistorySkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading history">
      <Card className="rounded-2xl border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-xl" />
            ))}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-xl sm:w-56" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>
      </Card>
      <div className="space-y-2.5" aria-hidden="true">
        <div className="flex items-center gap-2 px-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-px flex-1" />
        </div>
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} className="flex items-center gap-4 rounded-2xl border-border p-3 sm:p-4">
            <Skeleton className="h-20 w-24 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
