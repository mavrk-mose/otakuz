"use client"

import {use} from 'react';
import {Card, CardFooter, CardHeader} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Calendar, MapPin, Users, Ticket, Trophy, Phone} from 'lucide-react';
import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area';
import {motion} from 'framer-motion';
import Image from 'next/image';
import {format} from 'date-fns';
import DetailsSkeleton from "@/components/skeletons/DetailsSkeleton";
import useEventDetails from '@/hooks/events/use-event-details';
import {urlFor} from "@/lib/sanity";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

interface Props {
    params: Promise<{ id: string }>;
}

export default function EventDetailPage(props: Props) {
    const params = use(props.params);
    const {event, isLoading} = useEventDetails(params.id);

    const item = {
        hidden: {opacity: 0, scale: 0.8},
        show: {opacity: 1, scale: 1}
    };

    if (isLoading) {
        return <DetailsSkeleton/>;
    }

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 min-h-screen p-8">
            {/* Hero Image */}
            <div className="grid grid-cols-1 col-span-2">
                <div className="rounded-xl mb-8">
                    <Card className="overflow-hidden">
                        <Image
                            src={urlFor(event?.thumbnailUrl.asset._ref).url()}
                            alt={event ? event.title : 'thumbnail'}
                            width={300}
                            height={450}
                            className="w-full object-cover"
                        />
                    </Card>

                    <div className="space-y-6">
                        <h1 className="text-4xl font-bold mb-4">{event?.title}</h1>
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

                        <Card className="p-6">
                            <p className="leading-relaxed">{event?.description}</p>
                        </Card>

                        <div className="mt-8 overflow-x-auto px-4">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold mb-4">Event Gallery</h2>
                                <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                                    <div className="flex space-x-4">
                                        {event?.gallery.map((image, index) => (
                                            <motion.div
                                                key={index}
                                                variants={item}
                                                whileHover={{scale: 1.05}}
                                                className="w-[300px] shrink-0"
                                            >
                                                <Card className="overflow-hidden">
                                                    <div className="relative aspect-[2/3]">
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
                                    <ScrollBar orientation="horizontal"/>
                                </ScrollArea>
                            </div>
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
                </div>
            </div>

            <div className="gap-4 sticky top-20">
                <div className="space-y-6">
                    <Card className="p-6">
                        <CardHeader className="grid grid-cols-2">
                            <div className="grid grid-cols-1">
                                <h3 className="text-lg font-semibold mb-4">Hosted By</h3>

                                <div className="space-y-4 mb-4">
                                    {event?.organizers.map((organizer, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={organizer.avatar.asset._ref}/>
                                                    <AvatarFallback>{organizer.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{organizer.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            <div className="space-y-4">
                                <div className="text-gray-300">{event?.attendees.length} Going</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {event?.attendees ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    <TooltipProvider>
                                                        {event.attendees?.slice(0, 5).map((attendee, i) => (
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
                                                {event.attendees.length > 5 && (
                                                    <span className="text-base text-muted-foreground">
                                                    +{event.attendees.length - 5}
                                                </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-base text-muted-foreground">No attendees yet</span>
                                        )}
                                    </div>
                                    {event ? event.attendees.length > 5 && (
                                        <span className="text-sm text-gray-300">
                                          and {event?.attendees.length - 5} others
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-300">
                                        event not found
                                    </span>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardFooter className="space-y-2 pt-4 border-t">
                            <Button className="w-full py-4" size="lg">
                                <Phone className="w-4 h-4 mr-2"/>
                                Contact Host
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="p-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2">
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
                            </div>

                            <div className="grid grid-cols-2 pt-4 border-t">
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