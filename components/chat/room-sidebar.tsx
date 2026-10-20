import { useMemo, useState } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Hash, Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFirebaseChatActions } from "@/hooks/chat/use-firebase-chat-actions"
import type { Room } from "@/types/room"
import { useI18n } from "@/components/i18n-provider"

interface RoomSidebarProps {
    rooms: Room[]
    selectedRoom: string | null
    onSelectRoom: (roomId: string) => void
    className?: string
}

export function RoomSidebar({ rooms, selectedRoom, onSelectRoom, className }: RoomSidebarProps) {
    const { t } = useI18n()
    const [searchQuery, setSearchQuery] = useState('')
    const [newRoomTitle, setNewRoomTitle] = useState('')
    const [isCreatingRoom, setIsCreatingRoom] = useState(false)
    const { createRoom } = useFirebaseChatActions()

    const displayedRooms = useMemo(() => {
        if (!searchQuery.trim()) return rooms || []
        const query = searchQuery.toLowerCase()
        return (rooms || []).filter((room) =>
            room.title.toLowerCase().includes(query)
        )
    }, [rooms, searchQuery])

    const handleCreateRoom = async () => {
        if (newRoomTitle.trim()) {
            const roomId = await createRoom(newRoomTitle)
            setNewRoomTitle('')
            setIsCreatingRoom(false)
            if (roomId) {
                onSelectRoom(roomId)
            }
        }
    }

    return (
        <div className={`w-64 bg-muted h-screen flex flex-col ${className}`}>
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg mb-2">{t("chat.rooms")}</h2>
                <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        className="pl-8"
                        placeholder={t("chat.searchRooms")}
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
                                placeholder={t("chat.newRoom")}
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
                        {t("watch.createRoom")}
                    </Button>
                )}
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {displayedRooms.map((room: Room) => (
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
                    {displayedRooms.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            {t("search.noResults")}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
