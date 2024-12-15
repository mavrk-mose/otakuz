"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Globe, MessageCircle, Phone, Settings } from 'lucide-react'
import useFilteredRooms from "@/hooks/chat/use-filtered-rooms"
import Link from "next/link"
import { RoomSidebar } from '@/components/chat/room-sidebar'
import ChatRoom from '@/components/chat/chat-room'
import Lottie from "lottie-react";
import WavingGirl from "@/public/lottie/Animation - 1734031068177.json"
import RoomHeader from "@/components/chat/room-header";
import useRoomDetails from "@/hooks/chat/use-room-details";

export default function ChatPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
    const { rooms } = useFilteredRooms(searchQuery)
    const { roomDetails } = useRoomDetails(selectedRoom);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth")
        }
    }, [user, loading, router])

    if (loading || !rooms) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Lottie animationData={WavingGirl}/>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar for larger screens */}
            <div className="hidden md:block w-64 border-r">
                <RoomSidebar
                    rooms={rooms}
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                    className="h-screen"
                />
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Rooms List (visible on mobile) or Selected Room (visible on desktop) */}
                <div className="flex-1 overflow-auto">
                    {selectedRoom && window.innerWidth >= 768 ? (
                            <>
                                <RoomHeader roomId={selectedRoom} roomDetails={roomDetails}/>
                                <ChatRoom roomId={selectedRoom} title={rooms.find(r => r.id === selectedRoom)?.title || ''} />
                            </>
                    ) : (
                        rooms.map((room) => (
                            <Link
                                key={room.id}
                                href={`/chat/${room.id}`}
                                className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors md:hidden"
                            >
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={`https://avatar.vercel.sh/${room.id}`} />
                                    <AvatarFallback>{room.title[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold truncate">{room.title}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        Click to join the conversation
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* Bottom Navigation (visible on mobile) */}
                <div className="border-t bg-background md:hidden sticky bottom-0 z-50">
                    <div className="flex justify-around items-center p-4">
                        <Button variant="ghost" size="icon">
                            <Globe className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <MessageCircle className="h-6 w-6" />
                        </Button>
                        <div className="relative -top-6">
                            <Button
                                size="icon"
                                className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </div>
                        <Button variant="ghost" size="icon">
                            <Phone className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Settings className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

