"use client"

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: {
      name: string;
      address: string;
    };
    thumbnailUrl: string;
    category: string;
    attendees: any[];
    price?: number;
  };
}

export function EventCard({ event }: EventCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
        <Link href={`/events/${event.id}`}>
          <div className="relative h-48">
            <Image
              src={event.thumbnailUrl}
              alt={event.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-4 right-4">
              <Badge>{event.category}</Badge>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(event.date), 'PPP')}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {event.attendees.length}
                </div>
              </div>
            </div>
          </div>
        </Link>
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            {event.location.name}
          </div>
          {event.price && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Starting from</p>
                <p className="text-lg font-bold">${event.price}</p>
              </div>
              <Button>
                <Ticket className="w-4 h-4 mr-2" />
                Get Tickets
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}