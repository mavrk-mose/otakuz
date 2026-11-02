"use client"

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Ticket, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/components/i18n-provider';
import { ShareContentModal } from '@/components/chat/share-content-modal';

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
  const { locale, t } = useI18n();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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
                  {new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", { dateStyle: "long" }).format(new Date(event.date))}
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
          <div className="flex items-center justify-between gap-2">
            {event.price ? (
              <div>
                <p className="text-xs text-muted-foreground">{t("events.startingFrom")}</p>
                <p className="text-base font-bold">${event.price}</p>
              </div>
            ) : <div />}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsShareModalOpen(true)}
                className="h-9 w-9 p-0"
                title="Share to chat"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="sm" asChild>
                <Link href={`/events/${event.id}`}>
                  <Ticket className="w-4 h-4 mr-1.5" />
                  {t("events.purchaseTickets")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <ShareContentModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        payload={{
          type: 'event',
          data: {
            id: event.id,
            title: event.title,
            image: event.thumbnailUrl,
            date: event.date,
            time: event.time,
            locationName: event.location.name,
            ticketPrice: event.price,
            category: event.category,
            attendeesCount: event.attendees.length,
          },
        }}
      />
    </motion.div>
  );
}
