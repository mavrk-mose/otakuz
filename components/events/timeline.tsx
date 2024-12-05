"use client"

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { format, isFuture, isPast, isToday } from 'date-fns';

interface TimelineProps {
  events: any[];
}

export function Timeline({ events }: TimelineProps) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const getEventStatus = (date: Date) => {
    if (isToday(date)) return 'today';
    if (isPast(date)) return 'past';
    if (isFuture(date)) return 'upcoming';
    return 'unknown';
  };

  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
      
      {sortedEvents.map((event, index) => {
        const date = new Date(event.date);
        const status = getEventStatus(date);
        const isLeft = index % 2 === 0;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            className={`relative grid grid-cols-[1fr_auto_1fr] gap-4 mb-8 ${
              isLeft ? 'text-right' : 'text-left'
            }`}
          >
            <div className={isLeft ? 'pr-4' : 'col-start-3 pl-4'}>
              <Card className="overflow-hidden">
                <Link href={`/events/${event.id}`}>
                  <div className="relative h-48">
                    <Image
                      src={event.thumbnailUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 ${
                        status === 'past' ? 'bg-primary' :
                        status === 'today' ? 'bg-green-500' :
                        'bg-primary'
                      }`}
                    >
                      {status}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(date, 'PPP')} at {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {event.location.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {event.attendees.length} attending
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-background" />
            </div>

            <div className={`flex items-center ${isLeft ? 'justify-start pl-4' : 'justify-end pr-4'}`}>
              <div className="bg-muted px-4 py-2 rounded-full">
                {format(date, 'MMM d, yyyy')}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}