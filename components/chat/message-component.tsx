import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Reply, MoreVertical } from 'lucide-react'
import { motion } from 'framer-motion'
import { useFirebaseChat } from "@/hooks/chat/use-firebase-chat"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Image from 'next/image'
import Link from 'next/link'
import {MessageProps} from "@/types/message";

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
      case 'anime_share':
        return (
            <div className="w-full max-w-[250px] overflow-hidden rounded-lg bg-background shadow">
              <div className="relative aspect-[2/3]">
                <Image
                    src={message.animeData?.image || '/placeholder.svg'}
                    alt={message.animeData?.title || 'Anime cover'}
                    fill
                    className="object-cover"
                />
              </div>
              <div className="p-2">
                <h3 className={`font-semibold text-yellow-400 text-sm line-clamp-2 mb-1 ${
                    isCurrentUser ? 'text-primary-foreground' : 'text-foreground'
                }`}>
                  {message.animeData?.title}
                </h3>
                <Button variant="link" asChild className="p-0 h-auto text-xs">
                  <Link href={`/anime/${message.animeData?.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
        );
      default:
        return <p className="text-sm">{message.message}</p>
    }
  }

  const isCurrentUser = message.userId === currentUserId

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`flex items-start gap-3 mb-4 group ${
              isCurrentUser ? 'flex-row-reverse' : ''
          }`}
      >
        <Avatar>
          <AvatarFallback>{message.username[0] || 'A'}</AvatarFallback>
        </Avatar>
        <div className={`flex flex-col ${
            isCurrentUser ? 'items-end' : 'items-start'
        }`}>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-medium">{message.username}</span>
            <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          </div>
          <div
              className={`rounded-lg ${
                  isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
              } ${message.type !== 'anime_share' ? 'mt-1 px-4 py-2' : ''}`}
          >
            {isEditing ? (
                <Input
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    onBlur={handleEdit}
                    autoFocus
                    className="min-w-[200px]"
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
                {isCurrentUser && (
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

