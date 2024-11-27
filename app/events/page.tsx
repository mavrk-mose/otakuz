"use client"

import { useQuery } from '@tanstack/react-query';
import { getEvents } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function EventsPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Anime Events</h1>
          <p className="text-muted-foreground">
            Join local anime events and meet fellow fans
          </p>
        </div>
        <Button asChild>
          <Link href="/events/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Link href={`/events/${event.id}`}>
                <Card className="overflow-hidden h-full">
                  <div className="relative h-48">
                    <Image
                      src={event.thumbnailUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge>{event.category}</Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(event.date), 'PPP')} at {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location.name}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {event.attendees.filter(a => a.status === 'going').length} attending
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}