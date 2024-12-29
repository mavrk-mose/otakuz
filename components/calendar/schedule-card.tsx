"use client"

import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {format} from "date-fns";
import {ScheduleList} from "./schedule-list";
import {AnimeDetails} from '@/types/anime';
import {ScheduleSkeleton} from "@/components/skeletons/schedule-skeleton";

interface ScheduleCardProps {
    date: Date | undefined;
    schedules: AnimeDetails[];
    isLoading: boolean;
    hasNextPage?: boolean;
    onLoadMore?: () => void;
}

export function ScheduleCard({
                                 date,
                                 schedules,
                                 isLoading,
                                 hasNextPage,
                                 onLoadMore
                             }: ScheduleCardProps) {
    return (
        <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
                {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
            </h2>

            {isLoading ? (
                <ScheduleSkeleton/>
            ) : schedules.length > 0 ? (
                <>
                    <ScheduleList schedules={schedules}/>
                    {hasNextPage && onLoadMore && (
                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={onLoadMore}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : 'Load More'}
                        </Button>
                    )}
                </>
            ) : (
                <p className="text-muted-foreground">
                    No anime releases scheduled for this date.
                </p>
            )}
        </Card>
    );
}