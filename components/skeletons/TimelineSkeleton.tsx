import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TimelineSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-48" />
            </div>

            <div className="relative space-y-8">
                <div className="absolute left-8 sm:left-24 top-0 bottom-0 w-px bg-border/50" />

                {[...Array(3)].map((_, index) => (
                    <div key={index} className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-4 sm:gap-8 relative">
                        {/* Date */}
                        <div className="text-sm">
                            <Skeleton className="h-5 w-16 mb-1" />
                            <Skeleton className="h-4 w-20" />
                        </div>

                        {/* Timeline Dot */}
                        <div className="absolute left-8 sm:left-24 top-3 w-2 h-2 rounded-full bg-primary ring-4 ring-background -translate-x-1/2" />

                        {/* Event Card */}
                        <Card className="bg-muted/50 border-0">
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                    {/* Event Image */}
                                    <Skeleton className="w-full sm:w-40 h-40 sm:h-48 rounded-lg" />

                                    <div className="flex-1 space-y-4">
                                        {/* Time and Title */}
                                        <div>
                                            <Skeleton className="h-4 w-20 mb-2" />
                                            <Skeleton className="h-6 w-3/4" />
                                        </div>

                                        {/* Organizers */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {[...Array(3)].map((_, i) => (
                                                    <Skeleton key={i} className="w-8 h-8 rounded-full" />
                                                ))}
                                            </div>
                                            <Skeleton className="h-4 w-40" />
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="w-5 h-5" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>

                                        {/* Attendees */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Skeleton key={i} className="w-8 h-8 rounded-full" />
                                                ))}
                                            </div>
                                            <Skeleton className="h-4 w-8" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}

