"use client"

import { Suspense } from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/page-state";
import { EmptyState } from "@/components/empty-state";
import { useI18n } from "@/components/i18n-provider";
import {Timeline} from '@/components/events/timeline';
import {TimelineSkeleton} from "@/components/skeletons/timeline-skeleton";
import useFetchEvents from "@/hooks/events/use-fetch-events";
import {GoogleAdUnit} from "@/components/ads/google-ad-unit";

function EventsContent() {
    const { t } = useI18n();
    const [period, setPeriod] = useQueryState("period", parseAsStringLiteral(["all", "upcoming", "past"]).withDefault("all").withOptions({ history: "push", scroll: false }));
    const { events = [], isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useFetchEvents({ period });

    return (
        <div className="container mx-auto space-y-10 px-4 py-8">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <GoogleAdUnit
                    context="events"
                    variant="spotlight"
                    adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EVENTS_TOP}
                />
            </div>

            {isLoading ? <TimelineSkeleton/> : isError && !events.length ? <ErrorState onRetry={() => void refetch()} /> : <>
                <Timeline events={events} period={period} onPeriodChange={value => { void setPeriod(value); }} />
                {!events.length && <EmptyState illustration="schedule"
                    title={t(period === "upcoming" ? "events.upcomingEmpty" : period === "past" ? "events.pastEmpty" : "events.empty")}
                    description={period === "all" ? undefined : t("events.filteredEmptyDescription")}
                    action={period === "all" ? undefined : <Button variant="outline" onClick={() => void setPeriod("all")}>{t("events.showAll")}</Button>}
                />}
                {isError && events.length > 0 && <ErrorState compact onRetry={() => void refetch()} />}
                {hasNextPage && <Button className="mx-auto flex" disabled={isFetchingNextPage} onClick={() => void fetchNextPage()}>{t(isFetchingNextPage ? "common.loading" : "common.loadMore")}</Button>}
            </>}

            <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
                <GoogleAdUnit
                    context="events"
                    variant="in-feed-grid"
                    adFormat="fluid"
                    seedOffset={2}
                    adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EVENTS_BOTTOM}
                />
            </div>
        </div>
    );
}
export default function EventsPage() { return <Suspense fallback={<TimelineSkeleton />}><EventsContent /></Suspense>; }
