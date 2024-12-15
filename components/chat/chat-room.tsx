"use client"

import React, { useState, useRef, useEffect, use } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Mic, ImageIcon, Video } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useFirebaseChat } from "@/hooks/chat/use-firebase-chat"
import {MessageComponent} from "@/components/chat/message-component";
import useAudioRecorder from "@/hooks/chat/use-audio-recorder";

interface ChatRoomProps {
    roomId: string
    title: string
}

export default function ChatRoom({ roomId, title }: ChatRoomProps) {
    const [newMessage, setNewMessage] = useState('')
    const [typingUsers, setTypingUsers] = useState<string[]>([])
    const { user } = useAuth()
    const scrollRef = useRef<HTMLDivElement>(null)
    const { messages, sendMessage, sendFile, setTyping } = useFirebaseChat(roomId)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const {
        isRecording,
        audioPreview,
        startRecording,
        stopRecording,
        sendAudioMessage,
        resetRecording,
    } = useAudioRecorder();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Scroll to the bottom when messages update
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

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

    const handleSendAudio = () => {
        sendAudioMessage(sendFile, user);
    };

    return (
        <div className="flex flex-col h-full">
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
                                <Button type="button" onClick={handleSendAudio}>
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