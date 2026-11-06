import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BoardSkeleton() {
  return (
    <Card
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border-border bg-card p-4"
    >
      <div className="mb-3.5 flex h-8 items-center justify-between gap-2">
        <Skeleton className="h-6 w-1/2" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="mb-3.5 grid grid-cols-3 gap-1.5 overflow-hidden rounded-xl border border-border/60 bg-muted/40 p-1">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-9 w-full rounded-xl" />
    </Card>
  );
}
