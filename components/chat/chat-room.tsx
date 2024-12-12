"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Mic, ImageIcon, Video } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFirebaseChat } from "@/hooks/use-firebase-chat"
import { MessageComponent } from './message-component'

interface ChatRoomProps {
  roomId: string
  title: string
}

export default function ChatRoom({ roomId, title }: ChatRoomProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const { user } = useAuth()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, sendFile } = useFirebaseChat(roomId)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && user) {
      await sendFile(file, user.uid, user.displayName || 'Anonymous')
    }
  }

  const handleRecordAudio = () => {
    setIsRecording(!isRecording)
    // Implement audio recording logic here
  }

  return (
      <div className="flex flex-col h-full">
        <h2>{title}</h2>
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
                <MessageComponent
                    key={message.id}
                    message={message}
                    roomId={roomId}
                    currentUserId={user?.uid}
                />
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
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/*"
                className="hidden"
            />
            <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                size="icon"
                variant={isRecording ? "destructive" : "outline"}
                onClick={handleRecordAudio}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
  )
}

