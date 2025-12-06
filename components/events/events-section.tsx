"use client"

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import {useQuery} from "@tanstack/react-query";
import {Event} from "@/types/events";
import {getEvents, urlFor} from "@/lib/sanity";

export function EventsSection() {
    const {data: events, isLoading} = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const events: Event[] = await getEvents();
            //add filters if applicable sort the events, filter by category etc
            return events;
        },
        staleTime: 60000 //Cache data for 60 seconds
    });

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Upcoming Events</h2>
                    <p className="text-muted-foreground">Join local anime events</p>
                </div>
                <Button variant="ghost" asChild>
                    <Link href="/events" className="gap-2">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid md:grid-cols-2 gap-6"
            >
                {events?.slice(0, 4).map((event) => (
                    <motion.div key={event._id} variants={item}>
                        <Card className="overflow-hidden group">
                            <Link href={`/events/${event._id}`}>
                                <div className="relative h-48">
                                    <Image
                                        src={urlFor(event.thumbnailUrl.asset._ref).url()}
                                        alt={event.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-4 right-4">
                                        <Badge>{event.category}</Badge>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {event.date ? format(new Date(event.date), 'MMMM dd, yyyy') : 'Date TBA'}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            {event.location.name}
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-2" />
                                            {event.attendees.length} attending
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}