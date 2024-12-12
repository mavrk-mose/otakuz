"use client"

import { useEffect, useState } from 'react'
import { RoomSidebar } from '@/components/chat/room-sidebar'
import ChatRoom from '@/components/chat/chat-room'
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useFirebaseChatActions } from "@/hooks/use-firebase-chat-actions"

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
    const [newRoomTitle, setNewRoomTitle] = useState('')
    const [inviteEmail, setInviteEmail] = useState('')
    const { user, loading } = useAuth()
    const router = useRouter()
    const { createRoom, inviteUser } = useFirebaseChatActions()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth")
        }
    }, [user, loading, router])

    const handleCreateRoom = async () => {
        if (newRoomTitle.trim()) {
            const roomId = await createRoom(newRoomTitle)
            setNewRoomTitle('')
            if (roomId) {
                setSelectedRoom(roomId)
            }
        }
    }

    const handleInviteUser = async () => {
        if (inviteEmail.trim() && selectedRoom) {
            await inviteUser(selectedRoom, inviteEmail)
            setInviteEmail('')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                Loading...
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="flex flex-col md:flex-row h-screen">
            <RoomSidebar
                rooms={mockRooms}
                selectedRoom={selectedRoom}
                onSelectRoom={setSelectedRoom}
                onCreateRoom={handleCreateRoom}
                className="w-full md:w-64 md:h-screen overflow-y-auto"
            />
            <div className="flex-1 flex flex-col h-full md:h-screen">
                <div className="flex justify-between items-center p-4 border-b">
                    <h1 className="text-2xl font-bold">
                        {selectedRoom ? mockRooms.find(room => room.id === selectedRoom)?.title : 'Select a room'}
                    </h1>
                    {selectedRoom && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Invite User</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Invite User to Room</DialogTitle>
                                </DialogHeader>
                                <div className="flex gap-2">
                                    <Input
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="User's email"
                                    />
                                    <Button onClick={handleInviteUser}>Invite</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
                {selectedRoom ? (
                    <ChatRoom roomId={selectedRoom} title={mockRooms.find(room => room.id === selectedRoom)?.title || ''} />
                ) : (
                    <div className="flex items-center justify-center flex-1 text-muted-foreground">
                        Select a room to start chatting
                    </div>
                )}
            </div>
        </div>
    )
}
