"use client"

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DiscoverSkeleton() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
            <Skeleton className="w-3/4 h-12 md:h-16 lg:h-20 mb-8 md:mb-12" />
            <div className="w-full max-w-md md:max-w-lg lg:max-w-xl aspect-[3/4] relative">
                <Card className="w-full h-full overflow-hidden">
                    <Skeleton className="w-full h-full" />
                </Card>
            </div>
            <div className="flex justify-center mt-8 md:mt-12 gap-4 md:gap-6">
                <Skeleton className="w-32 md:w-40 h-12 md:h-14" />
                <Skeleton className="w-32 md:w-40 h-12 md:h-14" />
            </div>
        </div>
    )
}

