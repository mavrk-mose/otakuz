"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Mic, ImageIcon, Video } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useFirebaseChat } from "@/hooks/chat/use-firebase-chat"
import {MessageComponent} from "@/components/chat/message-component";
import useAudioRecorder from "@/hooks/chat/use-audio-recorder";
import useRoomDetails from "@/hooks/chat/use-room-details";
import { createChatNotification } from '@/lib/notifications';
import { useI18n } from '@/components/i18n-provider';

interface ChatRoomProps {
    roomId: string
    title: string
}

export default function ChatRoom({ roomId, title }: ChatRoomProps) {
    const { t } = useI18n()
    const [newMessage, setNewMessage] = useState('')
    const { user } = useAuth()
    const scrollRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const {
        messages,
        loading: messagesLoading,
        error,
        sendMessage,
        sendFile,
        editMessage,
        deleteMessage,
        setTyping,
    } = useFirebaseChat(roomId)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const {
        isRecording,
        audioPreview,
        startRecording,
        stopRecording,
        sendAudioMessage,
    } = useAudioRecorder();
    const { roomDetails } = useRoomDetails(roomId);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
            void setTyping(false)
        }
    }, [setTyping])


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        const content = newMessage.trim()
        if (!user || !content) return

        setNewMessage('')
        void setTyping(false)

        try {
            await sendMessage(content)

            roomDetails?.members.forEach((member: string) => {
                if (member !== user.uid) {
                    void createChatNotification(member, title, roomId, content)
                }
            })
        } catch {
            setNewMessage((current) => current || content)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && user) {
            try {
                await sendFile(file)
            } finally {
                e.target.value = ''
            }
        }
    }

    return (
        <div className="flex flex-col h-full">
            {error && (
                <div role="alert" className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                    {t("chat.liveSyncError")}: {error.message}
                </div>
            )}
            <ScrollArea className="flex-1 p-4 h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
                {messagesLoading && messages.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        {t("common.loading")}
                    </div>
                )}
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <MessageComponent
                            key={message.id}
                            message={message}
                            currentUserId={user?.uid}
                            onEdit={editMessage}
                            onDelete={deleteMessage}
                        />
                    ))}
                    <div ref={scrollRef}></div>
                </AnimatePresence>
            </ScrollArea>
            <div className="border-t p-4 sticky bottom-0 z-50">
                <form onSubmit={handleSendMessage} className="flex flex-wrap gap-2 items-center">
                    <Input
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value)
                            if (user) {
                                void setTyping(true)
                                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                                typingTimeoutRef.current = setTimeout(() => {
                                    void setTyping(false)
                                }, 1500)
                            }
                        }}
                        onBlur={() => void setTyping(false)}
                        placeholder={t("chat.typeMessage")}
                        className="flex-1"
                        disabled={!user || messagesLoading}
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
                                <Button type="button" onClick={() => sendAudioMessage(sendFile, user)}>
                                    Send Audio
                                </Button>
                            </>
                        )}
                        <Button type="submit" size="icon" disabled={!user || !newMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
