import { useState } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Hash, Plus } from 'lucide-react'

interface Room {
    id: string
    title: string
}

interface RoomSidebarProps {
    rooms: Room[]
    selectedRoom: string | null
    onSelectRoom: (roomId: string) => void
    onCreateRoom: (title: string) => void
}

export function RoomSidebar({ rooms, selectedRoom, onSelectRoom, onCreateRoom }: RoomSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [newRoomTitle, setNewRoomTitle] = useState('')

    const filteredRooms = rooms.filter(room =>
        room.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreateRoom = () => {
        if (newRoomTitle.trim()) {
            onCreateRoom(newRoomTitle)
            setNewRoomTitle('')
        }
    }

    return (
        <div className="w-64 bg-muted flex flex-col">
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
                <div className="flex gap-2">
                    <Input
                        placeholder="New room name"
                        value={newRoomTitle}
                        onChange={(e) => setNewRoomTitle(e.target.value)}
                    />
                    <Button size="icon" onClick={handleCreateRoom}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {filteredRooms.map((room) => (
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
            </ScrollArea>
        </div>
    )
}

