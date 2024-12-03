"use client"

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getEvent, updateEventAttendee } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Share2 } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function EventPage() {
  const params = useParams();
  const { toast } = useToast();
  const eventId = params.id as string;

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId)
  });

  const handleRSVP = async (status: 'going' | 'maybe' | 'not_going') => {
    try {
      await updateEventAttendee(eventId, 'user-1', 'User', status);
      toast({
        title: "Success",
        description: "Your RSVP has been updated!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!event) {
    return <div className="container mx-auto px-4 py-8">Event not found</div>;
  }

  const goingCount = event.attendees.filter(a => a.status === 'going').length;
  const maybeCount = event.attendees.filter(a => a.status === 'maybe').length;
  const userRSVP = event.attendees.find(a => a.id === 'user-1')?.status;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
          <Image
            src={event.thumbnailUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold">{event.title}</h1>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge>{event.category}</Badge>
              {event.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>

            <div className="space-y-4 text-lg mb-8">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-5 w-5 mr-2" />
                {format(new Date(event.date), 'PPP')} at {event.time}
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-2" />
                {event.location.name}
                <br />
                {event.location.address}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Users className="h-5 w-5 mr-2" />
                {goingCount} going · {maybeCount} maybe
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mb-4">About this event</h2>
              <p className="whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>

          <div className="md:w-80">
            <div className="sticky top-4 space-y-4">
              <Select
                value={userRSVP || ''}
                onValueChange={(value: 'going' | 'maybe' | 'not_going') => handleRSVP(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your RSVP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="going">Going</SelectItem>
                  <SelectItem value="maybe">Maybe</SelectItem>
                  <SelectItem value="not_going">Not Going</SelectItem>
                </SelectContent>
              </Select>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">Organized by</h3>
                <p>{event.createdBy.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}