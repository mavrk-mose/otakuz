import { Skeleton } from "@/components/ui/skeleton";

export function NewsGridSkeleton({ home = false }: { home?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12" aria-hidden="true">
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 lg:col-span-7">
        <div>
          <Skeleton className="aspect-[16/10] w-full rounded-xl" />
          <div className="mt-4 space-y-2">
            <Skeleton className={home ? "h-7 w-full sm:h-8" : "h-8 w-full sm:h-9"} />
            <Skeleton className={home ? "h-7 w-4/5 sm:h-8" : "h-8 w-4/5 sm:h-9"} />
            <div className="space-y-1">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
        </div>
        <div
          className={`${home ? "mt-5" : "mt-6"} flex items-center justify-between border-t border-border pt-4`}
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-7 w-20" />
        </div>
      </div>
      <div className="flex flex-col justify-between gap-4 lg:col-span-5">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex flex-1 items-start gap-4 rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </div>
              <Skeleton className="mt-3 h-4 w-24" />
            </div>
            <Skeleton className={`${home ? "h-20" : "h-24"} w-24 shrink-0 rounded-xl`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function NewsPageSkeleton() {
  return (
    <div
      className="-m-4 min-h-screen bg-background text-foreground"
      aria-busy="true"
      aria-label="Loading news"
    >
      <div className="sticky top-14 z-30 w-full border-b border-border bg-card/90 lg:top-16">
        <div className="mx-auto flex max-w-7xl gap-4 overflow-hidden px-6 py-3">
          <Skeleton className="h-6 w-28 shrink-0" />
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-6 w-20 shrink-0" />
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-8">
        <section className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-0.5 w-full" />
          </div>
          <NewsGridSkeleton />
        </section>
        <section className="space-y-4 pt-4">
          <Skeleton className="h-8 w-64 max-w-full" />
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex gap-4 border-b py-4">
                  <Skeleton className="h-10 w-10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="aspect-video w-full rounded-2xl lg:col-span-5" />
          </div>
        </section>
      </div>
    </div>
  );
}
