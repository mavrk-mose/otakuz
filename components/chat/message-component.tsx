import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Reply, MoreVertical } from 'lucide-react'
import { motion } from 'framer-motion'
import { useFirebaseChat } from "@/hooks/use-firebase-chat"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface MessageProps {
    message: {
        id: string
        userId: string
        username: string
        message: string
        timestamp: number
        type?: 'text' | 'image' | 'video' | 'audio' | 'file'
        fileUrl?: string
    }
    currentUserId: string | undefined
    roomId: string
}

export function MessageComponent({ message, currentUserId, roomId }: MessageProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedMessage, setEditedMessage] = useState(message.message)
    const { editMessage, deleteMessage } = useFirebaseChat(roomId)

    const handleEdit = async () => {
        if (editedMessage.trim() !== message.message) {
            await editMessage(message.id, editedMessage)
        }
        setIsEditing(false)
    }

    const handleDelete = async () => {
        await deleteMessage(message.id)
    }

    const handleReply = async () => {
        // Implement reply logic
        console.log('Reply to message:', message.id)
    }

    const renderContent = () => {
        switch (message.type) {
            case 'image':
                return <img src={message.fileUrl} alt="Uploaded image" className="max-w-xs rounded-lg" />
            case 'video':
                return <video src={message.fileUrl} controls className="max-w-xs rounded-lg" />
            case 'audio':
                return <audio src={message.fileUrl} controls className="max-w-xs" />
            default:
                return <p className="text-sm">{message.message}</p>
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex items-start gap-3 mb-4 group ${
                message.userId === currentUserId ? 'flex-row-reverse' : ''
            }`}
        >
            <Avatar>
                <AvatarFallback>{message.username[0] || 'A'}</AvatarFallback>
            </Avatar>
            <div className={`flex flex-col ${
                message.userId === currentUserId ? 'items-end' : 'items-start'
            }`}>
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{message.username}</span>
                    <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
                </div>
                <div className={`mt-1 px-4 py-2 rounded-lg ${
                    message.userId === currentUserId ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                    {isEditing ? (
                        <Input
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                            onBlur={handleEdit}
                            autoFocus
                        />
                    ) : (
                        renderContent()
                    )}
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40">
                        <div className="flex flex-col space-y-1">
                            {message.userId === currentUserId && (
                                <>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(!isEditing)}>
                                        <Pencil className="h-4 w-4 mr-2" /> Edit
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={handleDelete}>
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </Button>
                                </>
                            )}
                            <Button size="sm" variant="ghost" onClick={handleReply}>
                                <Reply className="h-4 w-4 mr-2" /> Reply
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </motion.div>
    )
}

