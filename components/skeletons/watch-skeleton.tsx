import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RecentAnimeSkeleton() {
  return (
    <Card
      aria-hidden="true"
      className="flex items-center space-x-2 bg-card p-2"
    >
      <Skeleton className="h-24 w-16 shrink-0 rounded" />
      <div className="min-w-0 flex-1 space-y-1">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </Card>
  );
}

export default function WatchSkeleton() {
  return (
    <div
      className="flex h-screen overflow-hidden"
      aria-busy="true"
      aria-label="Loading anime promos"
    >
      <aside className="hidden w-64 flex-shrink-0 flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground md:flex">
        <div className="p-4">
          <Skeleton className="h-5 w-32" />
        </div>
        <ScrollArea className="flex-grow">
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }, (_, i) => (
              <RecentAnimeSkeleton key={i} />
            ))}
          </div>
        </ScrollArea>
      </aside>
      <main className="min-w-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="border-y bg-muted/40 p-4" aria-hidden="true">
            <Skeleton className="mb-2 h-7 w-3/4" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
          <div className="px-4 py-2">
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="border-b bg-muted/40 p-4" aria-hidden="true">
            <div className="mb-4 flex h-10 w-fit gap-1 rounded-md bg-muted p-1">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="bg-card p-2">
                  <Skeleton className="aspect-video w-full rounded" />
                  <Skeleton className="mt-2 h-5 w-4/5" />
                </Card>
              ))}
            </div>
          </div>
          <div className="mb-2 ml-4">
            <Skeleton className="h-7 w-40" />
          </div>
          <div
            className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3"
            aria-hidden="true"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="space-y-1 p-2">
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
