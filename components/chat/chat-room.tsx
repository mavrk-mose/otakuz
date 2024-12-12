"use client"

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {useFirebaseChat} from "@/hooks/use-firebase-chat";

interface ChatRoomProps {
  roomId: string
  title: string
}

export default function ChatRoom({ roomId, title }: ChatRoomProps) {
  const [newMessage, setNewMessage] = useState('')
  const { user } = useAuth()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage } = useFirebaseChat(roomId)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim()) return

    await sendMessage(newMessage, user.uid, user.displayName || 'Anonymous')
    setNewMessage('')
  }

  return (
      <div className="flex flex-col h-full">
        <div className="border-b p-4">
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>

        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
                <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex items-start gap-3 mb-4 ${
                        message.userId === user?.uid ? 'flex-row-reverse' : ''
                    }`}
                >
                  <Avatar>
                    <AvatarFallback>
                      {message.username?.[0] || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                      className={`flex flex-col ${
                          message.userId === user?.uid ? 'items-end' : 'items-start'
                      }`}
                  >
                    <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">
                    {message.username || 'Anonymous'}
                  </span>
                      <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                    </div>
                    <div
                        className={`mt-1 px-4 py-2 rounded-lg ${
                            message.userId === user?.uid
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                        }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>

        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
  )
}