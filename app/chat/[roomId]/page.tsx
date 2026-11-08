"use client";
import { I18nText } from "@/components/i18n-text";

import { EmptyState } from "@/components/empty-state";
import React, { use, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useFirebaseChatActions } from "@/hooks/chat/use-firebase-chat-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ChatRoom from "@/components/chat/chat-room"
import { useAuth } from "@/hooks/use-auth"
import useRoomDetails from "@/hooks/chat/use-room-details"
import RoomHeader from "@/components/chat/room-header"
import { useRouter } from 'next/navigation'

interface Props {
    params: Promise<{ roomId: string }>;
}

export default function Room(props: Props) {
    const params = use(props.params);
    const { user, loading: authLoading } = useAuth()
    const { joinRoom } = useFirebaseChatActions()
    const router = useRouter()

    const { roomDetails, loading, error, refetch } = useRoomDetails(params.roomId)

    useEffect(() => {
        if (!authLoading && !user) router.replace('/auth')
    }, [authLoading, router, user])

    const handleJoinRoom = async () => {
        if (user) {
            await joinRoom(params.roomId)
            await refetch()
        }
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div role="status"><EmptyState illustration="chat" title={<I18nText message="chat.loadingRoom" />} /></div>
            </div>
        )
    }

    if (!user) return null

    if (!loading && (error || !roomDetails)) return <div role="alert" className="space-y-4 p-6"><p><I18nText message="chat.unavailable" /></p><Button onClick={() => router.replace('/chat')}><I18nText message="chat.backRooms" /></Button></div>

    if (loading && !roomDetails) return <p role="status" className="p-4"><I18nText message="chat.loadingRoom" /></p>
    const isUserInRoom = Boolean(roomDetails?.members.includes(user.uid))

    return (
        <div className="flex flex-col h-screen bg-background">
            <RoomHeader roomId={params.roomId} roomDetails={roomDetails} />
            {isUserInRoom ? (
                <ChatRoom roomId={params.roomId} title={roomDetails ? roomDetails.title : ''} />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <Avatar className="h-24 w-24 mb-6">
                        <AvatarImage src={roomDetails?.photoURL || `https://avatar.vercel.sh/${params.roomId}`} />
                        <AvatarFallback>{roomDetails ? roomDetails.title[0] : ''}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold mb-2">{roomDetails ? roomDetails.title : ''}</h2>
                    <p className="text-muted-foreground mb-6">
                        Join this room to participate in the conversation
                    </p>
                    <Button onClick={handleJoinRoom}>
                        Join Room
                    </Button>
                </div>
            )}
        </div>
    )
}
