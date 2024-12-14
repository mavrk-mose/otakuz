"use client"

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Mic, ImageIcon, Video } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useFirebaseChat } from "@/hooks/use-firebase-chat"
import { MessageComponent } from './message-component'

interface ChatRoomProps {
  roomId: string
  title: string
}

export default function ChatRoom({ roomId, title }: ChatRoomProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const { user } = useAuth()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, sendFile, setTyping } = useFirebaseChat(roomId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const handleTyping = () => {
      if (user) {
        setTyping(user.uid, true)
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(user.uid, false)
        }, 3000)
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [user, setTyping])

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data])
        }
      }

      mediaRecorder.start()
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioPreview(audioUrl);
        setAudioChunks([]);
      };
    }
  };

  const sendAudioMessage = async () => {
    if (audioPreview && user) {
      const response = await fetch(audioPreview);
      const audioBlob = await response.blob();
      await sendFile(audioBlob, user.uid, user.displayName || 'Anonymous', 'audio/webm');
      setAudioPreview(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2>{title}</h2>
      <ScrollArea ref={scrollRef} className="flex-1 p-4 h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageComponent
              key={message.id}
              message={message}
              currentUserId={user?.uid}
              roomId={roomId}
            />
          ))}
        </AnimatePresence>
      </ScrollArea>
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-muted-foreground">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex flex-wrap gap-2 items-center">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              if (user) {
                setTyping(user.uid, true)
              }
            }}
            placeholder="Type a message..."
            className="flex-1"
          />
          <div className="flex gap-2">
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
              onClick={isRecording ? stopRecording : startRecording}
            >
              <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
            </Button>
            {audioPreview && (
              <>
                <audio src={audioPreview} controls className="max-w-[150px]" />
                <Button type="button" onClick={sendAudioMessage}>
                  Send Audio
                </Button>
              </>
            )}
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}