import { useState } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Hash } from 'lucide-react'

interface Room {
    id: string
    title: string
}

interface RoomSidebarProps {
    rooms: Room[]
    selectedRoom: string | null
    onSelectRoom: (roomId: string) => void
}

export function RoomSidebar({ rooms, selectedRoom, onSelectRoom }: RoomSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredRooms = rooms.filter(room =>
        room.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="w-64 bg-muted h-screen flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg mb-2">Chat Rooms</h2>
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        className="pl-8"
                        placeholder="Search rooms"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
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

