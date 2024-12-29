"use client"

import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {addDays, format} from "date-fns";
import {AnimeDetails} from '@/types/anime';

interface UpcomingReleasesProps {
    getScheduleForDate: (date: Date) => AnimeDetails[];
    hasNextPage?: boolean;
    onLoadMore?: () => void;
}

export function UpcomingReleases({
                                     getScheduleForDate,
                                     hasNextPage,
                                     onLoadMore
                                 }: UpcomingReleasesProps) {
    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Upcoming Releases</h3>
                {hasNextPage && onLoadMore && (
                    <Button
                        variant="outline"
                        onClick={onLoadMore}
                    >
                        Load More
                    </Button>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => {
                    const futureDate = addDays(new Date(), i + 1);
                    const futureSchedule = getScheduleForDate(futureDate);

                    return (
                        <Card key={i} className="p-4">
                            <p className="font-medium mb-2">
                                {format(futureDate, 'MMMM d, yyyy')}
                            </p>
                            {futureSchedule.length > 0 ? (
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {futureSchedule.slice(0, 3).map((anime) => (
                                        <li key={anime.mal_id}>{anime.title}</li>
                                    ))}
                                    {futureSchedule.length > 3 && (
                                        <li>+{futureSchedule.length - 3} more</li>
                                    )}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No releases scheduled
                                </p>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}