import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function WatchSkeleton() {
  return (
    <div className="flex h-screen bg-[#0E0E10] text-white overflow-hidden">
      {/* Left Sidebar Skeleton */}
      <aside className="w-64 flex-shrink-0 bg-[#1F1F23] overflow-hidden flex flex-col">
        <Skeleton className="h-5 w-40 m-4" />
        <ScrollArea className="flex-grow">
          <div className="space-y-2 p-4">
            {Array(20).fill(0).map((_, i) => (
              <Card key={i} className="flex items-center space-x-2 p-2 bg-[#26262C]">
                <Skeleton className="w-16 h-24 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {/* Anime Player Skeleton */}
          <Skeleton className="w-full aspect-video" />

          {/* Anime Info Skeleton */}
          <div className="p-4 bg-[#18181B]">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <div className="flex items-center space-x-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Recommended Anime List Skeleton */}
          <div className="grid grid-cols-3 gap-4 p-4">
            {Array(12).fill(0).map((_, i) => (
              <Card key={i} className="bg-[#26262C] overflow-hidden">
                <Skeleton className="w-full aspect-video" />
                <div className="p-2">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}

