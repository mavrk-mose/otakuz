import {useEffect, useState} from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Hash, Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useFilteredRooms from '@/hooks/chat/use-filtered-rooms'
import { useFirebaseChatActions } from "@/hooks/chat/use-firebase-chat-actions"
import {Room} from "@/types/room";

interface RoomSidebarProps {
    rooms: Room[]
    selectedRoom: string | null
    onSelectRoom: (roomId: string) => void
    className?: string
}

export function RoomSidebar({ selectedRoom, onSelectRoom, className }: RoomSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [newRoomTitle, setNewRoomTitle] = useState('')
    const [isCreatingRoom, setIsCreatingRoom] = useState(false)
    const { rooms, loading, error, refetch } = useFilteredRooms(searchQuery)
    const { createRoom } = useFirebaseChatActions()

    useEffect(() => {
        refetch()
    }, []);

    const handleCreateRoom = async () => {
        if (newRoomTitle.trim()) {
            const roomId = await createRoom(newRoomTitle)
            setNewRoomTitle('')
            setIsCreatingRoom(false)
            if (roomId) {
                onSelectRoom(roomId)
                refetch() // Refetch rooms after creating a new one
            }
        }
    }

    return (
        <div className={`w-64 bg-muted h-screen flex flex-col ${className}`}>
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg mb-2">Chat Rooms</h2>
                <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        className="pl-8"
                        placeholder="Search rooms"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <AnimatePresence>
                    {isCreatingRoom && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex gap-2 mt-2"
                        >
                            <Input
                                placeholder="New room name"
                                value={newRoomTitle}
                                onChange={(e) => setNewRoomTitle(e.target.value)}
                            />
                            <Button size="icon" onClick={handleCreateRoom}>
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setIsCreatingRoom(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isCreatingRoom && (
                    <Button className="w-full mt-2" onClick={() => setIsCreatingRoom(true)}>
                        Create Room
                    </Button>
                )}
            </div>
            <ScrollArea className="flex-1">
                {loading && <div className="p-4">Loading rooms...</div>}
                {error && <div className="p-4 text-red-500">Error: {error.message}</div>}
                {!loading && !error && (
                    <div className="p-2">
                        {rooms.map((room) => (
                            <Button
                                key={room.id}
                                variant={selectedRoom === room.id ? "secondary" : "ghost"}
                                className="w-full justify-start mb-1"
                                onClick={() => onSelectRoom(room.id)}
                            >
                                <Hash className="mr-2 h-4 w-4" />
                                {room.title}
                            </Button>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}

