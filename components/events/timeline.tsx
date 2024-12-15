"use client"

import {Card} from '@/components/ui/card';
import {MapPin} from 'lucide-react';
import {motion} from 'framer-motion';
import Image from 'next/image';
import {Event} from "@/types/events";
import Link from 'next/link';
import {format} from 'date-fns';
import {urlFor} from "@/lib/sanity";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";

interface TimelineProps {
    events: Event[];
}

export function Timeline({events}: TimelineProps) {
    const sortedEvents = [...events].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Anime Events</h1>
                        <p className="text-muted-foreground">
                            Join local anime events and meet fellow fans
                        </p>
                    </div>
                </div>
                <Tabs defaultValue="upcoming">
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="relative space-y-8">
                <div className="absolute left-24 top-0 bottom-0 w-px bg-border/50"/>

                {sortedEvents.map((event) => {
                    const date = new Date(event.date);

                    return (
                        <motion.div
                            key={event._id}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            className="grid grid-cols-[100px_1fr] gap-8 relative"
                        >
                            {/* Date */}
                            <div className="text-sm">
                                <div className="font-bold">{format(date, 'MMM dd')}</div>
                                <div className="text-muted-foreground">{format(date, 'EEEE')}</div>
                            </div>

                            {/* Timeline Dot */}
                            <div
                                className="absolute left-24 top-3 w-2 h-2 rounded-full bg-primary ring-4 ring-background -translate-x-1/2"/>

                            {/* Event Card */}
                            <Card className="bg-muted/50 border-0">
                                <Link href={`/events/${event._id}`} className="block p-6">
                                    <div className="flex gap-6">
                                        <div className="flex-1 space-y-4">
                                            {/* Time and Title */}
                                            <div>
                                                <div className="text-muted-foreground mb-1">
                                                    {event?.time}
                                                </div>
                                                <h3 className="text-xl font-semibold">{event.title}</h3>
                                            </div>

                                            {/* Organizers */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {event.organizers?.map((organizer, i) => (
                                                        <Avatar key={i} className="border-2 border-background w-6 h-6">
                                                            <AvatarImage src={urlFor(organizer.avatar.asset._ref).url()}/>
                                                            <AvatarFallback>{organizer.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                  By {event.organizers?.map(o => o.name).join(', ')}
                                                </span>
                                            </div>

                                            {/* Location */}
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4"/>
                                                {event.location.name}
                                            </div>

                                            {/* Attendees */}
                                            {event.attendees.length > 0 ? (
                                                <>
                                                    <div className="flex -space-x-2">
                                                        {event.attendees?.slice(0, 5).map((attendee, i) => (
                                                            <Avatar key={i}
                                                                    className="border-2 border-background w-6 h-6">
                                                                <AvatarImage
                                                                    src={urlFor(attendee.avatar.asset._ref).url()}/>
                                                                <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                                                            </Avatar>
                                                        ))}
                                                    </div>
                                                    {event.attendees.length > 5 && (
                                                        <span className="text-sm text-muted-foreground">
                                                          +{event.attendees.length - 5}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No attendees yet</span>
                                            )}
                                        </div>

                                        {/* Event Image */}
                                        <div className="relative w-24 h-24">
                                            <Image
                                                src={urlFor(event.thumbnailUrl.asset._ref).url()}
                                                alt={event.title}
                                                fill
                                                className="object-cover rounded-lg"
                                            />
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