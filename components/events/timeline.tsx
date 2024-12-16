"use client"

import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Event } from "@/types/events";
import Link from 'next/link';
import { format } from 'date-fns';
import { urlFor } from "@/lib/sanity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRef } from 'react';

interface TimelineProps {
    events: Event[];
}

export function Timeline({ events }: TimelineProps) {
    const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const sortedEvents = [...events].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">Anime Events</h1>
                    <p className="text-muted-foreground">
                        Join local anime events and meet fellow fans
                    </p>
                </div>
                <Tabs defaultValue="upcoming">
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="relative space-y-8">
                <div className="absolute left-8 sm:left-24 top-0 bottom-0 w-px bg-border/50" />

                {sortedEvents.map((event) => {
                    const date = new Date(event.date);
                    const dateId = date.toISOString();

                    return (
                        <motion.div
                            key={event._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-4 sm:gap-8 relative"
                        >
                            {/* Date */}
                            <div
                                ref={(el) => (dateRefs.current[dateId] = el)}
                                className={`text-sm sticky top-0}`}
                            >
                                <div className="font-bold">{format(date, 'MMM dd')}</div>
                                <div className="text-muted-foreground">{format(date, 'EEEE')}</div>
                            </div>

                            {/* Timeline Dot */}
                            <div className="absolute left-8 sm:left-24 top-3 w-2 h-2 rounded-full bg-primary ring-4 ring-background -translate-x-1/2" />

                            {/* Event Card */}
                            <Card className="bg-muted/50 border-0 transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:border-2">
                                <Link href={`/events/${event._id}`} className="block p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        {/* Event Image */}
                                        <div className="relative w-full sm:w-40 h-40 sm:h-48">
                                            <Image
                                                src={urlFor(event.thumbnailUrl.asset._ref).url()}
                                                alt={event.title}
                                                fill
                                                className="object-cover rounded-lg"
                                            />
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
                                                            <AvatarImage src={urlFor(organizer.avatar.asset._ref).url()} />
                                                            <AvatarFallback>{organizer.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>
                                                <span className="text-base text-muted-foreground">
                                                    By {event.organizers?.map(o => o.name).join(', ')}
                                                </span>
                                            </div>

                                            {/* Location */}
                                            <div className="flex items-center gap-2 text-base text-muted-foreground">
                                                <MapPin className="h-5 w-5" />
                                                {event.location.name}
                                            </div>

                                            {/* Attendees */}
                                            {event.attendees.length > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        <TooltipProvider>
                                                            {event.attendees?.slice(0, 5).map((attendee, i) => (
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
                                                    {event.attendees.length > 5 && (
                                                        <span className="text-base text-muted-foreground">
                                                            +{event.attendees.length - 5}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-base text-muted-foreground">No attendees yet</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}