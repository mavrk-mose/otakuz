import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailsSkeleton() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      aria-busy="true"
      aria-label="Loading product details"
    >
      <div className="container mx-auto px-4 py-8" aria-hidden="true">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="lg:w-2/3">
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
          <div className="lg:w-1/3">
            <div className="sticky top-20 space-y-6 lg:top-24">
              <div>
                <Skeleton className="mb-2 h-5 w-24" />
                <Skeleton className="mb-4 h-9 w-4/5" />
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Skeleton key={i} className="h-4 w-4" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-36" />
                  <Skeleton className="h-7 w-24" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-12" />
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <div className="border-t pt-4">
                <Skeleton className="h-7 w-40" />
                <div className="space-y-2 py-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
