"use client"

import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Event } from "@/types/events";
import Link from 'next/link';
import { urlFor } from "@/lib/sanity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Fragment, useRef } from 'react';
import { useI18n } from '@/components/i18n-provider';
import { GoogleAdUnit } from '@/components/ads/google-ad-unit';

interface TimelineProps {
    events: Event[];
    period: "upcoming" | "past";
    onPeriodChange: (period: "upcoming" | "past") => void;
}

export function Timeline({ events, period, onPeriodChange }: TimelineProps) {
    const { locale, t } = useI18n();
    const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("events.title")}</h1>
                    <p className="text-muted-foreground">
                        {t("events.description")}
                    </p>
                </div>
                <Tabs value={period} onValueChange={value => onPeriodChange(value as "upcoming" | "past")}>
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="upcoming">{t("events.upcoming")}</TabsTrigger>
                        <TabsTrigger value="past">{t("events.past")}</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="relative space-y-8">
                <div className="absolute left-8 sm:left-24 top-0 bottom-0 w-px bg-border/50" />

                {events.map((event, idx) => {
                    const attendees = event.attendees ?? [];
                    const parsedDate = event.date ? new Date(event.date) : null;
                    const date = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;
                    const dateId = date?.toISOString() ?? event._id;
                    const showInlineEventAd =
                        (idx + 1) % 2 === 0 ||
                        (events.length === 1 && idx === 0);

                    return (
                        <Fragment key={event._id}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-4 sm:gap-8 relative"
                        >
                            {/* Date */}
                            <div
                                ref={(el) => (dateRefs.current[dateId] = el)}
                                className="text-sm sticky top-0 pt-2"
                            >
                                <div className="font-bold">
                                    {date ? new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", { month: "short", day: "numeric" }).format(date) : t("events.dateTba")}
                                </div>
                                <div className="text-muted-foreground">
                                    {date ? new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", { weekday: "long" }).format(date) : t("events.dateTba")}
                                </div>
                            </div>

                            {/* Timeline Dot */}
                            <div className="absolute left-8 sm:left-24 top-3 w-2 h-2 rounded-full bg-primary ring-4 ring-background -translate-x-1/2" />

                            {/* Event Card */}
                            <Card className="bg-muted/50 border-0 transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:border-2">
                                <Link href={`/events/${event._id}`} className="block p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        {/* Event Image */}
                                        <div className="relative w-full sm:w-40 h-40 sm:h-48">
                                            {event.thumbnailUrl && <Image
                                                src={urlFor(event.thumbnailUrl.asset._ref).url()}
                                                alt={event.title}
                                                fill
                                                className="object-cover rounded-lg"
                                            />}
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            {/* Time and Title */}
                                            <div>
                                                <div className="text-muted-foreground mb-1 text-base">
                                                    {event?.time}
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-semibold">{event.title}</h3>
                                            </div>

                                            {/* Organizers */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {event.organizers?.map((organizer, i) => (
                                                        <Avatar key={i} className="border-2 border-background w-8 h-8">
                                                            {organizer.avatar && <AvatarImage src={urlFor(organizer.avatar.asset._ref).url()} />}
                                                            <AvatarFallback>{organizer.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>
                                                <span className="text-base text-muted-foreground">
                                                    {t("events.by")} {event.organizers?.map(o => o.name).join(', ')}
                                                </span>
                                            </div>

                                            {/* Location */}
                                            <div className="flex items-center gap-2 text-base text-muted-foreground">
                                                <MapPin className="h-5 w-5" />
                                                {event.location?.name}
                                            </div>

                                            {/* Attendees */}
                                            {attendees.length > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        <TooltipProvider>
                                                            {attendees.map((attendee, i) => (
                                                                <Tooltip key={i}>
                                                                    <TooltipTrigger>
                                                                        <Avatar className="border-2 border-background w-8 h-8">
                                                                            <AvatarImage src={urlFor(attendee.avatar.asset._ref).url()} />
                                                                            <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                                                                        </Avatar>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{attendee.name}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            ))}
                                                        </TooltipProvider>
                                                    </div>
                                                    {(event.attendeeCount ?? attendees.length) > 5 && (
                                                        <span className="text-base text-muted-foreground">
                                                            +{(event.attendeeCount ?? attendees.length) - 5}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-base text-muted-foreground">{t("events.noAttendees")}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </Card>
                        </motion.div>

                        {showInlineEventAd && (
                            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-4 sm:gap-8 relative">
                                <div className="pt-3 font-mono text-[10px] font-bold uppercase tracking-wider text-rose-500">
                                    Partner
                                </div>
                                <div className="absolute left-8 sm:left-24 top-4 w-2 h-2 rounded-full bg-rose-500 ring-4 ring-background -translate-x-1/2" />
                                <GoogleAdUnit
                                    context="events"
                                    variant="timeline"
                                    adFormat="fluid"
                                    seedOffset={idx + 1}
                                    adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EVENTS_TIMELINE}
                                />
                            </div>
                        )}
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
}
