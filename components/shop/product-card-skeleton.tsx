import { Card } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card
      aria-hidden="true"
      className="flex h-full min-w-0 animate-pulse flex-col overflow-hidden motion-reduce:animate-none"
    >
      <div className="aspect-square bg-muted" />
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">
          <div className="h-4 w-10 rounded bg-muted" />
          <div className="h-6 w-20 rounded-full bg-muted sm:h-7" />
        </div>
        <div className="h-5 w-4/5 rounded bg-muted sm:h-6" />
        <div className="mb-3 mt-1 flex-1 space-y-1 sm:mb-4">
          <div className="h-4 w-full rounded bg-muted sm:h-5" />
          <div className="h-4 w-2/3 rounded bg-muted sm:h-5" />
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <div className="h-6 w-24 rounded bg-muted" />
          <div className="flex gap-1.5">
            <div className="h-11 w-11 rounded-md bg-muted" />
            <div className="h-11 w-11 rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </Card>
  );
}
