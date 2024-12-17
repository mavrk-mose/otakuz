import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function EventDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 max-w-[100vw] overflow-x-hidden">
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Hero Image Skeleton */}
                        <Card className="overflow-hidden w-full">
                            <Skeleton className="aspect-video w-full" />
                        </Card>

                        {/* Event details Skeleton */}
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-3/4" />
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <Card className="p-4 md:p-6">
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </Card>
                        </div>

                        {/* Event Gallery Skeleton */}
                        <div className="space-y-4 w-full">
                            <Skeleton className="h-8 w-40" />
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {[...Array(5)].map((_, index) => (
                                    <Skeleton key={index} className="w-[180px] md:w-[200px] h-[240px] md:h-[266px] shrink-0" />
                                ))}
                            </div>
                        </div>

                        {/* Gaming Tournaments Skeleton */}
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-56" />
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[...Array(4)].map((_, index) => (
                                    <Card key={index} className="p-4">
                                        <div className="flex items-start gap-4">
                                            <Skeleton className="w-12 h-12 rounded-lg" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-5 w-3/4" />
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Event Details and Ticket Purchase Skeleton */}
                        <Card className="p-4 md:p-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[...Array(2)].map((_, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Skeleton className="w-5 h-5 rounded-full" />
                                            <div>
                                                <Skeleton className="h-4 w-24 mb-1" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4 border-t">
                                    <Skeleton className="h-4 w-24 mb-1" />
                                    <Skeleton className="h-8 w-32" />
                                </div>
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </Card>

                        {/* Host Information Skeleton */}
                        <Card className="p-4 md:p-6">
                            <Skeleton className="h-6 w-32 mb-4" />
                            <div className="space-y-4 mb-4">
                                {[...Array(2)].map((_, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t">
                                <Skeleton className="h-4 w-32 mb-2" />
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex -space-x-2">
                                        {[...Array(5)].map((_, index) => (
                                            <Skeleton key={index} className="w-8 h-8 rounded-full border-2 border-background" />
                                        ))}
                                    </div>
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </Card>

                        {/* Event Schedule Skeleton */}
                        <Card className="p-4 md:p-6">
                            <Skeleton className="h-6 w-40 mb-4" />
                            <div className="space-y-4">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="flex gap-4">
                                        <Skeleton className="w-20 h-4" />
                                        <div className="flex-1">
                                            <Skeleton className="h-4 w-3/4 mb-1" />
                                            <Skeleton className="h-3 w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}