"use client"

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

export function EventsSection() {
    // Mock events data - in production, this would come from your API
    const events = [
        {
            id: 1,
            title: "Anime Convention 2024",
            date: new Date(2024, 3, 15),
            location: "Century Cinemax",
            attendees: 1200,
            image: "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2070&auto=format&fit=crop",
            category: "convention"
        },
        {
            id: 2,
            title: "Cosplay Meetup",
            date: new Date(2024, 3, 20),
            location: "Piccola Cafe",
            attendees: 500,
            image: "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2070&auto=format&fit=crop",
            category: "meetup"
        }
    ];

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
                {events.map((event) => (
                    <motion.div key={event.id} variants={item}>
                        <Card className="overflow-hidden group">
                            <Link href={`/events/${event.id}`}>
                                <div className="relative h-48">
                                    <Image
                                        src={event.image}
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
                                            {format(event.date, 'PPP')}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            {event.location}
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-2" />
                                            {event.attendees} attending
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