import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CommunityMemberSkeleton() {
  return (
    <Card
      aria-hidden="true"
      className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border-border bg-card p-5"
    >
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-5 w-12" />
        </div>
        <div className="space-y-0.5">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="mt-2 space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-16" />
      </div>
    </Card>
  );
}
