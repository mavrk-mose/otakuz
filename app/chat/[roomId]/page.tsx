"use client"

import React, { useState, use } from 'react'
import { Button } from '@/components/ui/button'
import {useFirebaseChatActions} from "@/hooks/chat/use-firebase-chat-actions";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {AvatarFallback} from "@radix-ui/react-avatar";
import ChatRoom from "@/components/chat/chat-room";
import {useAuth} from "@/hooks/use-auth";
import useRoomDetails from "@/hooks/chat/use-room-details";
import Lottie from "lottie-react";
import WavingGirl from "@/public/lottie/Animation - 1734031068177.json";
import RoomHeader from "@/components/chat/room-header";

interface Props {
    params: Promise<{ roomId: string }>;
}

export default function Room(props: Props) {
    const params = use(props.params);
    const { user } = useAuth()
    const { joinRoom } = useFirebaseChatActions()

    const { roomDetails, loading } = useRoomDetails(params.roomId);

    const handleJoinRoom = async () => {
        if (user) {
            await joinRoom(params.roomId, user.uid)
        }
    }

    if(loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Lottie animationData={WavingGirl}/>
            </div>
        )
    }

    const isUserInRoom = roomDetails?.members.includes(user?.uid || '');

    return (
        <div className="flex flex-col h-screen bg-background">
            <RoomHeader roomId={params.roomId} roomDetails={roomDetails}/>
            {isUserInRoom? (
                <ChatRoom roomId={params.roomId} title={roomDetails ? roomDetails.title : ''}/>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <Avatar className="h-24 w-24 mb-6">
                        <AvatarImage src={`https://avatar.vercel.sh/${params.roomId}`}/>
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