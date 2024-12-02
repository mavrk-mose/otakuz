"use client"

import { useQuery } from '@tanstack/react-query';
import { Timeline } from '@/components/events/timeline';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function EventsPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      // TODO: This would be replaced with your actual API call
      return [
        {
          id: '1',
          title: 'Anime Convention 2024',
          date: '2024-04-15',
          time: '10:00 AM',
          location: {
            name: 'Piccola Cafe',
            coordinates: { lat: 35.6762, lng: 139.6503 }
          },
          thumbnailUrl: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2070&auto=format&fit=crop',
          attendees: [],
          photos: [
            {
              id: '1',
              url: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2070&auto=format&fit=crop',
              caption: 'Main stage'
            }
          ]
        },
        {
          id: '2',
          title: 'Anime Convention 2024',
          date: '2024-10-11',
          time: '09:00 PM',
          location: {
            name: 'Flames',
            coordinates: { lat: 35.6762, lng: 135.6503 }
          },
          thumbnailUrl: 'https://images.unsplash.com/photo-1625189659340-887baac3ea32?q=80&w=3473&auto=format&fit=crop',
          attendees: [],
          photos: [
            {
              id: '1',
              url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=3474&auto=format&fit=crop',
              caption: 'Main stage'
            },
            {
              id: '2',
              url: 'https://images.unsplash.com/photo-1611457194403-d3aca4cf9d11?q=80&w=3386&auto=format&fit=crop',
              caption: 'Ghibli Food stand'
            }
          ]
        },
        // Add more mock events...
      ];
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

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

      <Timeline events={events || []} />
    </div>
  );
}