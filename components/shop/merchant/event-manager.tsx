"use client"

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Users, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/lib/sanity';
import { format } from 'date-fns';

interface EventManagerProps {
  merchantId: string;
}

export function EventManager({ merchantId }: EventManagerProps) {
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', merchantId],
    queryFn: async () => {
      const query = `*[_type == "event" && merchantId == $merchantId]`;
      return client.fetch(query, { merchantId });
    },
  });

  // Add event mutation
  const addEvent = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!selectedDate) throw new Error('Event date is required');

      return client.create({
        _type: 'event',
        merchantId,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        date: selectedDate.toISOString(),
        time: formData.get('time') as string,
        location: {
          name: formData.get('locationName') as string,
          address: formData.get('locationAddress') as string,
        },
        capacity: Number(formData.get('capacity')),
        price: Number(formData.get('price')),
        createdAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', merchantId] });
      setIsAddEventOpen(false);
      setSelectedDate(undefined);
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addEvent.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Manager</h2>
        <Button onClick={() => setIsAddEventOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event: any) => (
          <Card key={event._id} className="p-4">
            <h3 className="font-semibold mb-2">{event.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {event.description}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {format(new Date(event.date), 'PPP')} at {event.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{event.attendees?.length || 0} / {event.capacity}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Title</label>
              <Input name="title" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Input type="time" name="time" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Venue Name</label>
              <Input name="locationName" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input name="locationAddress" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity</label>
                <Input type="number" name="capacity" min="1" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input type="number" name="price" min="0" step="0.01" required />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Create Event
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}