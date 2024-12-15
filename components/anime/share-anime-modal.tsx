import React, {useState, useEffect} from 'react';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {useFirebaseChatActions} from '@/hooks/use-firebase-chat-actions';
import {useToast} from '@/hooks/use-toast';
import {AnimeData} from '@/types/anime';
import {useAuth} from '@/hooks/use-auth';
import {useRouter} from 'next/navigation';
import useFilteredRooms from "@/hooks/use-filtered-rooms";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import { Toast } from '../ui/toast';

interface ShareAnimeModalProps {
    isOpen: boolean;
    onClose: () => void;
    anime: AnimeData;
}

export default function ShareAnimeModal({isOpen, onClose, anime}: ShareAnimeModalProps) {
    const [selectedRoom, setSelectedRoom] = useState('');
    const {toast} = useToast();
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
            toast({
                title: "Authentication Required",
                description: "Please sign in to share anime.",
                variant: "destructive",
            });
            router.push('/auth');
            onClose();
            return;
        }

        if (!selectedRoom) {
            toast({
                title: "Error",
                description: "Please select a room to share to.",
                variant: "destructive",
            });
            return;
        }

        try {
            await shareAnimeToChat(selectedRoom, {
                title: anime.title,
                image: anime.images.jpg.large_image_url,
                id: anime.mal_id,
            }, user.uid);
            toast({
                title: "Success",
                description: "Anime shared to chat successfully!",
            });
            onClose();
        } catch (error) {
            console.error('Error sharing anime:', error);
            toast({
                title: "Error",
                description: "Failed to share anime. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleSelectedRoom = (selectedRoom: string) => {
        setSelectedRoom(selectedRoom);
        handleShare();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <Toast/>
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
                        ) : 'Sign In to Share'}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}