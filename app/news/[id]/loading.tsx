import { Skeleton } from "@/components/ui/skeleton";

export default function NewsArticleLoading() {
  return (
    <div
      className="-m-4 min-h-screen bg-background text-foreground"
      aria-busy="true"
      aria-label="Loading article"
    >
      <div className="border-b border-border bg-card/80 px-6 py-3">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <section className="mx-auto w-full max-w-[1400px] px-6 pb-8 pt-8" aria-hidden="true">
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="mb-8 max-w-5xl space-y-2">
          <Skeleton className="h-8 w-full sm:h-11 md:h-[51px] lg:h-16" />
          <Skeleton className="h-8 w-3/4 sm:h-11 md:h-[51px] lg:h-16" />
        </div>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-2 lg:col-span-7">
            <Skeleton className="aspect-[16/10] w-full rounded-2xl border border-border" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex h-full flex-col justify-between pt-1 lg:col-span-5 lg:pl-4">
            <div>
              <div className="mb-6 space-y-2">
                <Skeleton className="h-7 w-full sm:h-8" />
                <Skeleton className="h-7 w-full sm:h-8" />
                <Skeleton className="h-7 w-3/4 sm:h-8" />
              </div>
              <div className="mb-6 flex items-center gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="border-y px-6 py-2.5">
        <Skeleton className="mx-auto h-5 w-full max-w-[1400px]" />
      </div>
      <div className="mx-auto max-w-3xl space-y-3 px-6 py-10" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    </div>
  );
}
