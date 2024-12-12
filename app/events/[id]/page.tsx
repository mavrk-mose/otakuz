"use client"

import {use, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {client} from '@/lib/sanity';
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Calendar, MapPin, Users, Ticket, Trophy} from 'lucide-react';
import {ScrollArea} from '@/components/ui/scroll-area';
import {motion} from 'framer-motion';
import Image from 'next/image';
import {format} from 'date-fns';
import {Event} from "@/types/events";
import DetailsSkeleton from "@/components/skeletons/DetailsSkeleton";

const mockEvent = {
    id: '1',
    title: 'Anime Convention 2024',
    description: 'Join us for the biggest anime convention of the year! Featuring special guests, cosplay contests, gaming tournaments, and more.',
    date: '2024-06-15',
    time: '10:00 AM',
    location: {
        name: 'Convention Center',
        address: '123 Main St, Anime City',
    },
    thumbnailUrl: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2070&auto=format&fit=crop',
    category: 'convention',
    price: 49.99,
    attendees: Array(120).fill(null),
    gallery: [
        'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2070&auto=format&fit=crop',
    ],
    tournaments: [
        {
            name: 'Super Smash Bros Tournament',
            prize: '$1000',
            participants: 64,
            date: '2024-06-15',
            time: '2:00 PM',
        },
        {
            name: 'Street Fighter 6 Championship',
            prize: '$500',
            participants: 32,
            date: '2024-06-16',
            time: '1:00 PM',
        },
    ],
};

interface Props {
    params: Promise<{ id: string }>;
}

export default function EventDetailPage(props: Props) {
    const params = use(props.params);

    const {data: event, isLoading} = useQuery({
        queryKey: ['event', params.id],
        queryFn: async () => {
          const event: Event = await client.fetch(`
            *[_type == "event" && _id == $id][0] {
              _id,
              title,
              description,
              date,
              time,
              location,
              thumbnailUrl,
              category,
              tags,
              activities[],
              tournaments[],
              attendees[]
            }
          `, {id: params.id});
              return event;
        }
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const container = {
        hidden: {opacity: 0},
        show: {
            opacity: 1,
            transition: {staggerChildren: 0.1}
        }
    };

    const item = {
        hidden: {opacity: 0, scale: 0.8},
        show: {opacity: 1, scale: 1}
    };

    console.log("sanity data: ",  event);

    if(isLoading) {
      return <DetailsSkeleton/>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-4">{event?.title}</h1>
                        <div className="flex flex-wrap gap-2">
                            <Badge>{event?.category}</Badge>
                            <Badge variant="secondary">
                                <Users className="w-4 h-4 mr-1"/>
                                {event?.attendees.length} attending
                            </Badge>
                        </div>
                    </div>

                    <Card className="p-6">
                        <p className="leading-relaxed">{event?.description}</p>
                    </Card>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">Event Gallery</h2>
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-2 md:grid-cols-3 gap-4"
                        >
                            {mockEvent.gallery.map((image, index) => (
                                <motion.div
                                    key={index}
                                    variants={item}
                                    whileHover={{scale: 1.05}}
                                    className="relative aspect-square cursor-pointer"
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <Image
                                        src={image}
                                        alt={`Event photo ${index + 1}`}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">Gaming Tournaments</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {event?.tournaments?.map((tournament, index) => (
                                <Card key={index} className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Trophy className="w-6 h-6 text-primary"/>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">{tournament.title}</h3>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <p>Prize Pool: {tournament.prize}</p>
                                                <p>{tournament.participants} participants</p>
                                                <p>{format(new Date(tournament.time), 'PPP')} at {tournament.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-muted-foreground"/>
                                <div>
                                    <p className="font-medium">{event?.date}</p>
                                    <p className="text-sm text-muted-foreground">{event?.time}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-muted-foreground"/>
                                <div>
                                    <p className="font-medium">{event?.location.name}</p>
                                    <p className="text-sm text-muted-foreground">{event?.location.address}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-1">Ticket Price</p>
                                <p className="text-2xl font-bold">${event?.ticket}</p>
                            </div>
                            <Button className="w-full" size="lg">
                                <Ticket className="w-4 h-4 mr-2"/>
                                Purchase Tickets
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">Event Schedule</h3>
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-4">
                                {event?.activities?.map((activity, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="w-20 text-sm text-muted-foreground">
                                            {activity?.time}
                                        </div>
                                        <div>
                                            <p className="font-medium">{activity?.title}</p>
                                            <p className="text-sm text-muted-foreground">{activity?.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </Card>
                </div>
            </div>
        </div>
    );
}