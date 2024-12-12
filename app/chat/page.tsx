"use client"

import {useEffect, useState} from 'react'
import { RoomSidebar } from '@/components/chat/room-sidebar'
import ChatRoom from '@/components/chat/chat-room'
import {useAuth} from "@/hooks/use-auth";
import {useRouter} from "next/navigation";

// Mock data for rooms
const mockRooms = [
    { id: '1', title: 'General' },
    { id: '2', title: 'Random' },
    { id: '3', title: 'Tech Talk' },
    { id: '4', title: 'Music' },
    { id: '5', title: 'Gaming' },
]

export default function ChatPage() {
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
    const { user, loading } = useAuth(); // Hook to get auth status
    const router = useRouter();
    // TODO refactor this to check auth properly
    useEffect(() => {
        if (!loading && !user) {
            // Redirect to sign-in if not authenticated
            router.push("/auth");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                Loading...
            </div>
        );
    }

    if (!user) {
        return null; // Redirecting, so no need to render anything
    }

    return (
        <div className="flex">
            <RoomSidebar
                rooms={mockRooms}
                selectedRoom={selectedRoom}
                onSelectRoom={setSelectedRoom}
            />
            <div className="flex-1">
                {selectedRoom ? (
                    <ChatRoom
                        roomId={selectedRoom}
                        title={mockRooms.find(room => room.id === selectedRoom)?.title || ''}
                    />
                ) : (
                    <div className="flex items-center justify-center text-muted-foreground">
                        Select a room to start chatting
                    </div>
                )}
            </div>
        </div>
    )
}

