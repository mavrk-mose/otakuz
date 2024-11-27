"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import {Event} from '@/types/events'

export default function CreateEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date>();
  const [thumbnail, setThumbnail] = useState<File>();
  const [thumbnailPreview, setThumbnailPreview] = useState<string>();

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!thumbnail || !date) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const eventData: Event = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        date: date.toISOString(),
        time: formData.get('time') as string,
        location: {
          name: formData.get('locationName') as string,
          address: formData.get('locationAddress') as string,
        },
        thumbnailUrl: formData.get('thumbnailUrl') as string,
        createdBy: {
          id: 'user-1', // Replace with actual user ID
          name: 'User', // Replace with actual username
        },
        attendees: [],
        tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
        category: formData.get('category') as Event['category']
      };

      const eventId = await createEvent(eventData, thumbnail);
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      router.push(`/events/${eventId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Create Event</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title</Label>
          <Input id="title" name="title" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input type="time" id="time" name="time" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meetup">Meetup</SelectItem>
              <SelectItem value="convention">Convention</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="cosplay">Cosplay Event</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locationName">Venue Name</Label>
          <Input id="locationName" name="locationName" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="locationAddress">Address</Label>
          <Input id="locationAddress" name="locationAddress" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" name="tags" placeholder="anime, cosplay, meetup" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnail">Event Thumbnail</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('thumbnail')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailChange}
              required
            />
          </div>
          {thumbnailPreview && (
            <div className="relative h-48 mt-4 rounded-lg overflow-hidden">
              <Image
                src={thumbnailPreview}
                alt="Thumbnail preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Event"}
        </Button>
      </form>
    </div>
  );
}