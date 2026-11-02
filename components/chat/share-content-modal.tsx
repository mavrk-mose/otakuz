"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { useFirebaseChatActions, type ShareContentPayload } from '@/hooks/chat/use-firebase-chat-actions';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import useFilteredRooms from '@/hooks/chat/use-filtered-rooms';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n-provider';
import type { Room } from '@/types/room';
import { Tv, BookOpen, ShoppingBag, Calendar, User as UserIcon, Search, Users, Send } from 'lucide-react';

export interface ShareContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    payload: ShareContentPayload | null;
}

export function ShareContentModal({ isOpen, onClose, payload }: ShareContentModalProps) {
    const { t } = useI18n();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const { shareContentToChat } = useFirebaseChatActions();
    const { user } = useAuth();
    const router = useRouter();
    const { rooms, refetch } = useFilteredRooms('');

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            refetch();
        }
    }, [isOpen, refetch]);

    const filteredRooms = useMemo(() => {
        if (!searchQuery.trim()) return rooms;
        const q = searchQuery.toLowerCase();
        return rooms.filter((room: Room) => room.title.toLowerCase().includes(q));
    }, [rooms, searchQuery]);

    const handleShare = async (roomId: string) => {
        if (!payload) return;

        if (!user) {
            toast(t("anime.authRequired") || "Sign in required", {
                description: t("anime.signInToShare") || "Please sign in to share to chatrooms.",
            });
            router.push('/auth');
            onClose();
            return;
        }

        setIsSharing(true);
        try {
            await shareContentToChat(roomId, payload);
            toast.success(t("common.success") || "Success", {
                description: "Shared to chatroom successfully!",
            });
            onClose();
        } catch (error) {
            console.error('Error sharing content to chat:', error);
            toast.error(t("common.error") || "Error", {
                description: "Failed to share to chatroom.",
            });
        } finally {
            setIsSharing(false);
        }
    };

    if (!payload) return null;

    const renderPreview = () => {
        switch (payload.type) {
            case 'anime':
                return (
                    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/60 p-3">
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-muted">
                            {payload.data.image ? (
                                <Image
                                    src={payload.data.image}
                                    alt={payload.data.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    <Tv className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <Badge variant="secondary" className="mb-1 gap-1 text-[10px] font-mono uppercase">
                                <Tv className="h-3 w-3 text-primary" />
                                Anime
                            </Badge>
                            <h4 className="truncate text-sm font-semibold">{payload.data.title}</h4>
                            {payload.data.score && (
                                <p className="text-xs text-muted-foreground">Score: {payload.data.score}</p>
                            )}
                        </div>
                    </div>
                );

            case 'manga':
                return (
                    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/60 p-3">
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-muted">
                            {payload.data.image ? (
                                <Image
                                    src={payload.data.image}
                                    alt={payload.data.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <Badge variant="secondary" className="mb-1 gap-1 text-[10px] font-mono uppercase">
                                <BookOpen className="h-3 w-3 text-emerald-400" />
                                Manga
                            </Badge>
                            <h4 className="truncate text-sm font-semibold">{payload.data.title}</h4>
                            {payload.data.score && (
                                <p className="text-xs text-muted-foreground">Score: {payload.data.score}</p>
                            )}
                        </div>
                    </div>
                );

            case 'product':
                return (
                    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/60 p-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
                            {payload.data.image ? (
                                <Image
                                    src={payload.data.image}
                                    alt={payload.data.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    <ShoppingBag className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <Badge variant="secondary" className="mb-1 gap-1 text-[10px] font-mono uppercase">
                                <ShoppingBag className="h-3 w-3 text-rose-500" />
                                Merch Shop
                            </Badge>
                            <h4 className="truncate text-sm font-semibold">{payload.data.name}</h4>
                            <p className="text-xs font-bold text-rose-500">
                                Tshs. {payload.data.price?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                );

            case 'event':
                return (
                    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/60 p-3">
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-muted">
                            {payload.data.image ? (
                                <Image
                                    src={payload.data.image}
                                    alt={payload.data.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    <Calendar className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <Badge variant="secondary" className="mb-1 gap-1 text-[10px] font-mono uppercase">
                                <Calendar className="h-3 w-3 text-amber-400" />
                                Event
                            </Badge>
                            <h4 className="truncate text-sm font-semibold">{payload.data.title}</h4>
                            <p className="text-xs text-muted-foreground">{payload.data.date}</p>
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-[#1A1A1E] p-3">
                        <Avatar className="h-12 w-12 border border-rose-500/40">
                            <AvatarImage src={payload.data.photoURL} alt={payload.data.displayName} />
                            <AvatarFallback className="bg-rose-500 text-white font-bold">
                                {payload.data.displayName[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <Badge variant="secondary" className="gap-1 text-[10px] font-mono uppercase">
                                    <UserIcon className="h-3 w-3 text-rose-400" />
                                    Profile
                                </Badge>
                                {payload.data.level && (
                                    <span className="text-[10px] font-bold text-rose-400">
                                        Lv. {payload.data.level}
                                    </span>
                                )}
                            </div>
                            <h4 className="truncate text-sm font-bold text-white">{payload.data.displayName}</h4>
                            <p className="text-xs text-muted-foreground">{payload.data.username}</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-primary" />
                        Share to Chat Room
                    </DialogTitle>
                    <DialogDescription>
                        Select a chat room to share this content with the community.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {/* Item Preview */}
                    {renderPreview()}

                    {/* Room Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter chat rooms..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Rooms List */}
                    {user ? (
                        <ScrollArea className="h-64 pr-2">
                            {filteredRooms.length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    {searchQuery ? "No matching chat rooms found." : "No chat rooms available."}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredRooms.map((room: Room) => (
                                        <button
                                            key={room.id}
                                            type="button"
                                            disabled={isSharing}
                                            onClick={() => handleShare(room.id)}
                                            className="flex w-full items-center gap-3 rounded-lg border border-border/40 p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                                        >
                                            <Avatar className="h-10 w-10 shrink-0">
                                                <AvatarImage src={`https://avatar.vercel.sh/${room.id}`} />
                                                <AvatarFallback>{room.title[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="truncate text-sm font-semibold text-foreground">
                                                    {room.title}
                                                </h4>
                                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Users className="h-3 w-3" />
                                                    <span>{room.memberCount || 1} members</span>
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="shrink-0 font-mono text-xs text-primary"
                                                tabIndex={-1}
                                            >
                                                Share
                                            </Button>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <ScrollBar orientation="vertical" />
                        </ScrollArea>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="mb-4 text-sm text-muted-foreground">
                                Sign in to share content with other Otakuz users.
                            </p>
                            <Button asChild className="w-full">
                                <Link href="/auth">{t("nav.signIn") || "Sign In"}</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ShareContentModal;
