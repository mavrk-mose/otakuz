"use client"

import { useEffect, useState } from 'react'
import { RoomSidebar } from '@/components/chat/room-sidebar'
import ChatRoom from '@/components/chat/chat-room'
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useFirebaseChatActions } from "@/hooks/use-firebase-chat-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import Lottie from "lottie-react";
import WavingGirl from "@/public/lottie/Animation - 1734031068177.json";
import useFilteredRooms from "@/hooks/use-filtered-rooms";

export default function ChatPage() {
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
    const [newRoomTitle, setNewRoomTitle] = useState('')
    const [inviteEmail, setInviteEmail] = useState('')
    const { user, loading } = useAuth()
    const router = useRouter()
    const { createRoom, inviteUser, getRooms } = useFirebaseChatActions()
    const {rooms, setRooms, refetch} = useFilteredRooms(selectedRoom);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth")
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchRooms = async () => {
            const fetchedRooms = await getRooms()
            setRooms(fetchedRooms)
        }
        fetchRooms()
    }, [getRooms])

    const handleCreateRoom = async () => {
        if (newRoomTitle.trim()) {
            const roomId = await createRoom(newRoomTitle)
            setNewRoomTitle('')
            if (roomId) {
                setSelectedRoom(roomId)
                setRooms([...rooms, { id: roomId, title: newRoomTitle }])
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
            <div className="md:hidden p-4 bg-background border-b">
                <Select onValueChange={(value) => setSelectedRoom(value)}>
                    <SelectTrigger className="w-full" onClick={refetch}>
                        <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                        {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                                {room.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <RoomSidebar
                selectedRoom={selectedRoom}
                onSelectRoom={setSelectedRoom}
                className="hidden md:flex w-64 md:h-screen overflow-y-auto"
            />
            <div className="flex-1 flex flex-col h-full md:h-screen">
                <div className="flex justify-between items-center p-4 border-b">
                    <h1 className="text-2xl font-bold">
                        {selectedRoom ? rooms.find(room => room.id === selectedRoom)?.title : 'Select a room'}
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
                    <ChatRoom roomId={selectedRoom} title={rooms.find(room => room.id === selectedRoom)?.title || ''} />
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
                        <p>Select a room to start chatting</p>
                        <Lottie animationData={WavingGirl}/>
                    </div>
                )}
            </div>
        </div>
    )
}

