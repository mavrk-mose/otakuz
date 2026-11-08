"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DiscoverSkeleton() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 lg:p-12"
      aria-busy="true"
      aria-label="Loading discovery"
    >
      <Skeleton className="w-64 max-w-full h-10 md:h-12 lg:h-[60px] mb-8 md:mb-12" />
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl aspect-[3/4] relative">
        <Card className="w-full h-full overflow-hidden">
          <Skeleton className="w-full h-full" />
          <div className="absolute bottom-0 left-0 right-0 space-y-4 p-4 md:p-6 lg:p-8">
            <Skeleton className="h-8 w-4/5 md:h-9 lg:h-10 bg-muted-foreground/20" />
            <div className="flex justify-between">
              <Skeleton className="h-7 w-16 bg-muted-foreground/20" />
              <Skeleton className="h-7 w-28 bg-muted-foreground/20" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 bg-muted-foreground/20" />
              <Skeleton className="h-6 w-16 bg-muted-foreground/20" />
            </div>
          </div>
        </Card>
      </div>
      <div className="flex justify-center mt-8 md:mt-12 gap-4 md:gap-6">
        <Skeleton className="w-32 md:w-36 h-11" />
        <Skeleton className="w-32 md:w-36 h-11" />
      </div>
    </div>
  );
}
