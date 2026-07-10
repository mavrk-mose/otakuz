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
import { useI18n } from '@/components/i18n-provider';

interface ShareAnimeModalProps {
    isOpen: boolean;
    onClose: () => void;
    anime: AnimeDetails;
}

export default function ShareAnimeModal({isOpen, onClose, anime}: ShareAnimeModalProps) {
    const { t } = useI18n();
    const [selectedRoom, setSelectedRoom] = useState('');
    const {shareAnimeToChat} = useFirebaseChatActions();
    const {user} = useAuth();
    const router = useRouter();
    const {rooms, refetch} = useFilteredRooms('');

    useEffect(() => {
        if (isOpen) {
            refetch();  // Refetch rooms when the modal opens
        }
    }, [isOpen, refetch]);

    const handleShare = async (roomId = selectedRoom) => {
        if (!user) {
            toast(t("anime.authRequired"), {
                description: t("anime.signInToShare")
            });
            router.push('/auth');
            onClose();
            return;
        }

        if (!roomId) {
            toast(t("common.error"), {
                description: t("anime.selectRoom")
            });
            return;
        }

        try {
            await shareAnimeToChat(roomId, {
                title: anime.title,
                image: anime.images.jpg.large_image_url,
                id: anime.mal_id,
            }, user.uid);
            toast(t("common.success"), {
                description: t("anime.shareSuccess")
            });
            onClose();
        } catch (error) {
            console.error('Error sharing anime:', error);
            toast(t("common.error"),{
                description: t("anime.shareFailed")
            });
        }
    };

    const handleSelectedRoom = (selectedRoom: string) => {
        setSelectedRoom(selectedRoom);
        void handleShare(selectedRoom);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 items-center gap-4">
                        <Label htmlFor="room" className="text-right">
                            {t("anime.chatRoom")}
                        </Label>
                        {user ? (
                            <ScrollArea className="w-full whitespace-nowrap">
                                {rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        onClick={() => handleSelectedRoom(room.id)}
                                        className="mb-4 flex cursor-pointer flex-row gap-4 rounded-lg border p-4 shadow-sm transition-colors hover:bg-accent"
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
                                <Link href="/auth">{t("nav.signIn")}</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
