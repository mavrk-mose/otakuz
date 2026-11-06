import { Skeleton } from "@/components/ui/skeleton";

function ChannelCardSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="aspect-video rounded-xl border border-border" />
      <Skeleton className="mt-3 h-5 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}

export function ChannelsSkeleton() {
  return (
    <div
      className="-m-4 min-h-screen overflow-hidden bg-background text-foreground"
      aria-busy="true"
      aria-label="Loading channels"
    >
      <section className="relative min-h-[520px] border-b border-border lg:min-h-[620px]">
        <div
          className="relative mx-auto grid min-h-[520px] max-w-[1600px] items-center gap-10 px-5 py-10 sm:px-8 lg:min-h-[620px] lg:grid-cols-[minmax(300px,0.8fr)_minmax(520px,1.35fr)] lg:px-12"
          aria-hidden="true"
        >
          <div className="order-2 pb-6 lg:order-1 lg:pb-0">
            <Skeleton className="mb-5 h-7 w-44" />
            <Skeleton className="h-12 w-4/5 sm:h-[60px] lg:h-[72px]" />
            <Skeleton className="mt-5 h-5 w-3/4" />
            <div className="mt-5 space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
            <Skeleton className="mt-7 h-12 w-36 rounded-xl" />
          </div>
          <Skeleton className="order-1 aspect-video w-full rounded-2xl border border-border lg:order-2" />
        </div>
      </section>
      <div className="relative z-10 mx-auto -mt-4 max-w-[1600px] px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mb-5 space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-32 sm:h-9" />
        </div>
        <div className="grid auto-cols-[78%] grid-flow-col gap-4 overflow-hidden px-1 pb-7 pt-1 sm:auto-cols-[42%] md:auto-cols-[31%] lg:auto-cols-[24%] xl:auto-cols-[19%]">
          {Array.from({ length: 6 }, (_, i) => (
            <ChannelCardSkeleton key={i} />
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-5 border-t border-border pt-9 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-64 max-w-full" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-11 w-full sm:w-64" />
            <Skeleton className="h-11 w-full sm:w-52" />
          </div>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 12 }, (_, i) => (
            <ChannelCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
