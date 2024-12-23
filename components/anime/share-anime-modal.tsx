import React, {useState, useEffect} from 'react';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {useFirebaseChatActions} from '@/hooks/chat/use-firebase-chat-actions';
import {AnimeDetails} from '@/types/anime';
import {useAuth} from '@/hooks/use-auth';
import {useRouter} from 'next/navigation';
import useFilteredRooms from "@/hooks/chat/use-filtered-rooms";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import { toast } from 'sonner';

interface ShareAnimeModalProps {
    isOpen: boolean;
    onClose: () => void;
    anime: AnimeDetails;
}

export default function ShareAnimeModal({isOpen, onClose, anime}: ShareAnimeModalProps) {
    const [selectedRoom, setSelectedRoom] = useState('');
    const {shareAnimeToChat} = useFirebaseChatActions();
    const {user} = useAuth();
    const router = useRouter();
    const {rooms, refetch} = useFilteredRooms('');

    useEffect(() => {
        if (isOpen) {
            refetch();  // Refetch rooms when the modal opens
        }
    }, [isOpen]);

    const handleShare = async () => {
        if (!user) {
            toast("Authentication Required", {
                description: "Please sign in to share anime."
            });
            router.push('/auth');
            onClose();
            return;
        }

        if (!selectedRoom) {
            toast("Error", {
                description: "Please select a room to share to."
            });
            return;
        }

        try {
            await shareAnimeToChat(selectedRoom, {
                title: anime.title,
                image: anime.images.jpg.large_image_url,
                id: anime.mal_id,
            }, user.uid);
            toast("Success", {
                description: "Anime shared to chat successfully!"
            });
            onClose();
        } catch (error) {
            console.error('Error sharing anime:', error);
            toast("Error",{
                description: "Failed to share anime. Please try again."
            });
        }
    };

    const handleSelectedRoom = (selectedRoom: string) => {
        setSelectedRoom(selectedRoom);
        handleShare();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 items-center gap-4">
                        <Label htmlFor="room" className="text-right">
                            Chat Room
                        </Label>
                        {user ? (
                            <ScrollArea className="w-full whitespace-nowrap">
                                {rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        onClick={() => handleSelectedRoom(room.id)}
                                        className="flex flex-row gap-4 mb-4 p-4 border border-gray-700 rounded-lg shadow-lg hover:bg-gray-800"
                                    >
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={`https://avatar.vercel.sh/${room.id}`}/>
                                            <AvatarFallback>{room.title[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <h3 className="font-semibold truncate">{room.title}</h3>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <ScrollBar orientation="vertical"/>
                            </ScrollArea>
                        ) : (
                            <Button asChild>
                                <Link href="/auth">Sign In</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}