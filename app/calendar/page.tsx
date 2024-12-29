"use client"

import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { isSameDay } from "date-fns"
import useFetchSchedules from "@/hooks/calendar/use-fetch-schedules"
import { ScheduleCard } from "@/components/calendar/schedule-card"
import { UpcomingReleases } from "@/components/calendar/upcoming-releases"
import { AnimeDetails } from '@/types/anime'

export default function AnimeCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { schedule, isLoading, fetchNextPage, hasNextPage } = useFetchSchedules();

    const getScheduleForDate = (date: Date) => {
        if (!schedule || !schedule.pages) return [];

        return schedule.pages.flatMap(page =>
            page.data?.filter((anime: AnimeDetails) => {
                if (!anime.aired?.from) return false;
                const airedDate = new Date(anime.aired.from);
                return isSameDay(airedDate, date);
            })
        );
    };

    const selectedDateSchedule = date ? getScheduleForDate(date) : [];

    // Load more data if we don't have enough schedules for the selected date
    useEffect(() => {
        if (selectedDateSchedule.length === 0 && hasNextPage && !isLoading) {
            fetchNextPage();
        }
    }, [selectedDateSchedule.length, hasNextPage, isLoading, fetchNextPage]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Anime Release Calendar</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                    />
                </Card>

                <ScheduleCard
                    date={date}
                    schedules={selectedDateSchedule}
                    isLoading={isLoading}
                    hasNextPage={hasNextPage}
                    onLoadMore={() => fetchNextPage()}
                />
            </div>

            <UpcomingReleases
                getScheduleForDate={getScheduleForDate}
                hasNextPage={hasNextPage}
                onLoadMore={() => fetchNextPage()}
            />
        </div>
    )
}