"use client"

import React, { use, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useFirebaseChatActions } from "@/hooks/chat/use-firebase-chat-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ChatRoom from "@/components/chat/chat-room"
import { useAuth } from "@/hooks/use-auth"
import useRoomDetails from "@/hooks/chat/use-room-details"
import RoomHeader from "@/components/chat/room-header"
import { useRouter } from 'next/navigation'
import { useMessagesStore } from '@/store/use-messages-store'
import Lottie from "lottie-react"
import WavingGirl from "@/public/lottie/Animation - 1734031068177.json"

interface Props {
    params: Promise<{ roomId: string }>;
}

export default function Room(props: Props) {
    const params = use(props.params);
    const { user, loading: authLoading } = useAuth()
    const { joinRoom } = useFirebaseChatActions()
    const router = useRouter()

    const { roomDetails, loading, refetch } = useRoomDetails(params.roomId)

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
                <Lottie animationData={WavingGirl} />
            </div>
        )
    }

    if (!user) return null

    const hasCachedMessages = (useMessagesStore.getState().messages[params.roomId] || []).length > 0
    const isUserInRoom = roomDetails
        ? roomDetails.members.includes(user.uid)
        : hasCachedMessages || loading

    return (
        <div className="flex flex-col h-screen bg-background">
            <RoomHeader roomId={params.roomId} roomDetails={roomDetails} />
            {isUserInRoom ? (
                <ChatRoom roomId={params.roomId} title={roomDetails ? roomDetails.title : ''} />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <Avatar className="h-24 w-24 mb-6">
                        <AvatarImage src={`https://avatar.vercel.sh/${params.roomId}`} />
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
