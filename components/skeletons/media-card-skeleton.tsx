import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MediaCardSkeleton({
  count = 4,
  variant = "grid",
}: {
  count?: number;
  variant?: "grid" | "recommendation" | "home-anime" | "home-manga";
}) {
  const grid = variant === "grid";
  const recommendation = variant === "recommendation";
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <Card
          key={index}
          aria-hidden="true"
          className={`media-card-surface min-w-0 overflow-hidden ${grid ? "rounded-lg" : ""}`}
        >
          <Skeleton className="aspect-[2/3] w-full rounded-none" />
          <div
            className={
              grid
                ? "p-3.5"
                : variant === "home-anime"
                  ? "space-y-3 p-4"
                  : "p-4"
            }
          >
            <div
              className={`flex items-center gap-2 ${variant === "home-anime" ? "" : grid ? "mb-1.5" : "mb-2"}`}
            >
              <Skeleton
                className={grid ? "h-6 w-16 rounded-full" : "h-5 w-12"}
              />
              <Skeleton className="ml-auto h-6 w-14 rounded-full" />
            </div>
            <Skeleton className={grid ? "h-5 w-4/5" : "h-6 w-4/5"} />
            {!recommendation && (
              <div
                className={
                  variant === "home-anime" ? "space-y-1" : "mt-1 space-y-1"
                }
              >
                <Skeleton className={grid ? "h-4 w-full" : "h-[18px] w-full"} />
                <Skeleton className={grid ? "h-4 w-2/3" : "h-[18px] w-2/3"} />
              </div>
            )}
          </div>
        </Card>
      ))}
    </>
  );
}
