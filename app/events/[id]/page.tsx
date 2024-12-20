"use client"

import { use, useState } from 'react';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Ticket, Trophy, Phone } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { format } from 'date-fns';
import useEventDetails from '@/hooks/events/use-event-details';
import { urlFor } from "@/lib/sanity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EventDetailsSkeleton from '@/components/skeletons/EventDetailsSkeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface Props {
    params: Promise<{ id: string }>;
}

export default function EventDetailPage(props: Props) {
    const params = use(props.params);
    const { event, isLoading } = useEventDetails(params.id);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const item = {
        hidden: { opacity: 0, scale: 0.8 },
        show: { opacity: 1, scale: 1 }
    };

    if (isLoading) {
        return <EventDetailsSkeleton />;
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Hero Image */}
                        <Card className="overflow-hidden w-full">
                            <div className="relative aspect-video w-full">
                                <Image
                                    src={urlFor(event?.thumbnailUrl.asset._ref).url()}
                                    alt={event ? event.title : 'thumbnail'}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </Card>

                        {/* Event details */}
                        <div className="space-y-4">
                            <h1 className="text-2xl md:text-4xl font-bold">{event?.title}</h1>
                            <div className="flex flex-wrap gap-2">
                                <Badge>{event?.category}</Badge>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Badge variant="secondary" className="cursor-pointer">
                                            <Users className="w-4 h-4 mr-1"/>
                                            {event?.attendees.length} attending
                                        </Badge>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Event Attendees</DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="h-[300px] pr-4">
                                            <div className="space-y-4">
                                                {event?.attendees.map((attendee, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage
                                                                src={urlFor(attendee.avatar.asset._ref).url()}/>
                                                            <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{attendee.name}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <Card className="p-4 md:p-6">
                                <p className="leading-relaxed text-sm md:text-base">{event?.description}</p>
                            </Card>
                        </div>

                        {/* Event Gallery */}
                        <div className="space-y-4 w-full">
                            <h2 className="text-xl md:text-2xl font-bold">Event Gallery</h2>
                            <Card className="p-4">
                                <ScrollArea className="w-full whitespace-nowrap">
                                    <div className="flex gap-4 pb-4">
                                        {event?.gallery.map((image, index) => (
                                            <motion.div
                                                key={index}
                                                className="w-[150px] sm:w-[200px] shrink-0"
                                                whileHover={{ scale: 1.05 }}
                                                onClick={() => {
                                                    setCurrentImageIndex(index);
                                                    setIsGalleryOpen(true);
                                                }}
                                            >
                                                <Card className="overflow-hidden cursor-pointer">
                                                    <div className="relative aspect-[3/4]">
                                                        <Image
                                                            src={urlFor(image.asset._ref).url()}
                                                            alt={`Event photo ${index + 1}`}
                                                            fill
                                                            className="object-cover rounded-lg"
                                                        />
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            </Card>
                        </div>

                        {/* Gallery Pop-up */}
                        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                            <DialogContent className="max-w-3xl w-full p-0">
                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {event?.gallery.map((image, index) => (
                                            <CarouselItem key={index}>
                                                <div className="relative aspect-[3/4] w-full">
                                                    <Image
                                                        src={urlFor(image.asset._ref).url()}
                                                        alt={`Event photo ${index + 1}`}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </DialogContent>
                        </Dialog>

                        {/* Gaming Tournaments */}
                        <div className="space-y-4">
                            <h2 className="text-xl md:text-2xl font-bold">Gaming Tournaments</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {event?.tournaments?.map((tournament, index) => (
                                    <Card key={index} className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
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

                    {/* Sidebar */}
                    <div className="space-y-6 lg:sticky lg:top-6">
                        {/* Event Details and Ticket Purchase */}
                        <Card className="p-4 md:p-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-muted-foreground shrink-0"/>
                                        <div>
                                            <p className="font-medium">{event?.date}</p>
                                            <p className="text-sm text-muted-foreground">{event?.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-muted-foreground shrink-0"/>
                                        <div>
                                            <p className="font-medium">{event?.location.name}</p>
                                            <p className="text-sm text-muted-foreground">{event?.location.address}</p>
                                        </div>
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

                        {/* Host Information */}
                        <Card className="p-4 md:p-6">
                            <CardHeader className="px-0 pt-0">
                                <h3 className="text-lg font-semibold mb-4">Hosted By</h3>
                                <div className="space-y-4">
                                    {event?.organizers.map((organizer, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={organizer.avatar.asset._ref}/>
                                                <AvatarFallback>{organizer.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{organizer.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardFooter className="flex flex-col space-y-4 pt-4 border-t px-0 pb-0">
                                <div className="w-full">
                                    <div className="text-sm text-muted-foreground mb-2">
                                        {event?.attendees.length} Going
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            <TooltipProvider>
                                                {event?.attendees?.slice(0, 5).map((attendee, i) => (
                                                    <Tooltip key={i}>
                                                        <TooltipTrigger>
                                                            <Avatar className="border-2 border-background w-8 h-8">
                                                                <AvatarImage
                                                                    src={urlFor(attendee.avatar.asset._ref).url()}/>
                                                                <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                                                            </Avatar>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{attendee.name}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ))}
                                            </TooltipProvider>
                                        </div>
                                        {event?.attendees && event.attendees.length > 5 && (
                                            <span className="text-sm text-muted-foreground">
                                                +{event.attendees.length - 5} others
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button className="w-full" size="lg">
                                    <Phone className="w-4 h-4 mr-2"/>
                                    Contact Host
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Event Schedule */}
                        <Card className="p-4 md:p-6">
                            <h3 className="font-semibold mb-4">Event Schedule</h3>
                            <ScrollArea className="h-[300px]">
                                <div className="space-y-4 pr-4">
                                    {event?.activities?.map((activity, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="w-20 text-sm text-muted-foreground shrink-0">
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
        </div>
    );
}