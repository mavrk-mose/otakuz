import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function WatchSkeleton() {
  return (
    <div className="min-h-screen bg-[#0E0E10] text-white">
      <div className="flex">
        {/* Left Sidebar Skeleton */}
        <aside className="w-60 flex-shrink-0 fixed left-0 top-0 bottom-0 bg-[#1F1F23] p-4 overflow-y-auto">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="space-y-4">
            {Array(7).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
          <Skeleton className="h-8 w-full mt-2" />
          
          <Skeleton className="h-5 w-40 mt-6 mb-4" />
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
          <Skeleton className="h-8 w-full mt-2" />
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 ml-60">
          {/* Hero Section Skeleton */}
          <section className="relative">
            <Skeleton className="w-full h-[400px]" />
            <div className="absolute bottom-8 left-8 z-20">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-96 mb-4" />
              <Skeleton className="h-10 w-32" />
            </div>
          </section>

          {/* Recommended Section Skeleton */}
          <section className="p-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <Card key={i} className="bg-[#18181B] overflow-hidden">
                  <Skeleton className="h-[200px] w-full" />
                  <div className="p-4">
                    <div className="flex items-start">
                      <Skeleton className="w-10 h-10 rounded-full mr-3" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </main>

        {/* Right Sidebar Skeleton */}
        <aside className="w-60 flex-shrink-0 fixed right-0 top-0 bottom-0 bg-[#1F1F23] p-4 overflow-y-auto">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="space-y-4">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

