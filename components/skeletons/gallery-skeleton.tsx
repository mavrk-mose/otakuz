import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function GallerySkeleton({
  type = "anime",
}: {
  type?: "anime" | "manga" | "event";
}) {
  const widths =
    type === "manga"
      ? "w-[130px] sm:w-[160px] md:w-[185px] lg:w-[195px]"
      : type === "event"
        ? "w-[135px] sm:w-[175px] md:w-[195px]"
        : "w-[135px] sm:w-[170px] md:w-[195px] lg:w-[210px]";
  return (
    <div
      className={`w-full min-w-0 max-w-full ${type === "event" ? "space-y-4" : "space-y-3"}`}
      aria-busy="true"
      aria-label="Loading gallery"
    >
      {type === "event" ? (
        <Skeleton className="h-7 w-40 md:h-8" />
      ) : (
        <div className="flex items-center justify-between gap-4 px-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-40" />
        </div>
      )}
      <Card className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border-border/70 bg-card/60">
        <ScrollArea className="w-full min-w-0 max-w-full">
          <div
            className="flex w-max items-center px-8 py-9 sm:px-12 sm:py-10"
            aria-hidden="true"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className={`relative shrink-0 ${widths} ${index > 0 ? "-ml-6 sm:-ml-8" : ""}`}
                style={{
                  transformOrigin: "center bottom",
                  rotate: `${-5 + (index % 3) * 5}deg`,
                }}
              >
                <Card className="overflow-hidden border-border/80 shadow-xl">
                  <Skeleton
                    className={`${type === "event" ? "aspect-[3/4]" : "aspect-[2/3]"} rounded-lg`}
                  />
                </Card>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>
    </div>
  );
}
