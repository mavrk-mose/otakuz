"use client"

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Mic, ImageIcon, Video, Loader2, X } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useFirebaseChat } from "@/hooks/chat/use-firebase-chat"
import {MessageComponent} from "@/components/chat/message-component";
import useAudioRecorder from "@/hooks/chat/use-audio-recorder";
import useRoomDetails from "@/hooks/chat/use-room-details";
import { createChatNotification } from '@/lib/notifications';
import { useI18n } from '@/components/i18n-provider';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface ChatRoomProps {
    roomId: string
    title: string
}

export default function ChatRoom({ roomId, title }: ChatRoomProps) {
    const { t } = useI18n()
    const [newMessage, setNewMessage] = useState('')
    const { user } = useAuth()
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const hasInitialScrolledRef = useRef<string | null>(null)
    const prevMessagesCountRef = useRef(0)
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
        recordingTime,
        audioPreview,
        isSending: isSendingAudio,
        error: recorderError,
        startRecording,
        stopRecording,
        sendAudioMessage,
        resetRecording,
    } = useAudioRecorder();
    const { roomDetails } = useRoomDetails(roomId);

    const scrollToBottom = useCallback((instant = false) => {
        const viewport = scrollAreaRef.current?.querySelector(
            '[data-radix-scroll-area-viewport]'
        ) as HTMLElement | null

        if (instant) {
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight
            }
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: 'instant' })
            }
        } else {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }, [])

    // Jump to the last message before browser paint (no visible scroll animation)
    useIsomorphicLayoutEffect(() => {
        if (!roomId) return

        if (hasInitialScrolledRef.current !== roomId && messages.length > 0) {
            hasInitialScrolledRef.current = roomId
            prevMessagesCountRef.current = messages.length
            scrollToBottom(true)
        }
    }, [messages.length, roomId, scrollToBottom])

    // Handle initial async arrival and subsequent live messages
    useEffect(() => {
        if (!roomId) return

        // If messages were empty during layout effect and arrived asynchronously
        if (hasInitialScrolledRef.current !== roomId && messages.length > 0) {
            hasInitialScrolledRef.current = roomId
            prevMessagesCountRef.current = messages.length
            scrollToBottom(true)
            return
        }

        // When new messages arrive in the current room
        if (hasInitialScrolledRef.current === roomId && messages.length > prevMessagesCountRef.current) {
            const viewport = scrollAreaRef.current?.querySelector(
                '[data-radix-scroll-area-viewport]'
            ) as HTMLElement | null

            const isNearBottom = viewport
                ? viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 200
                : true

            const lastMessage = messages[messages.length - 1]
            const isMyMessage = lastMessage?.userId === user?.uid

            if (isMyMessage || isNearBottom) {
                scrollToBottom(false)
            }

            prevMessagesCountRef.current = messages.length
        }
    }, [messages, roomId, scrollToBottom, user?.uid])

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
            {(error || recorderError) && (
                <div role="alert" className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive flex items-center justify-between">
                    <span>{error ? `${t("chat.liveSyncError")}: ${error.message}` : recorderError}</span>
                    {recorderError && !error && (
                        <button
                            type="button"
                            onClick={resetRecording}
                            className="text-xs underline hover:no-underline ml-2"
                        >
                            {t("common.close")}
                        </button>
                    )}
                </div>
            )}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
                {messagesLoading && messages.length === 0 && (
                    <div className="space-y-4 p-2 animate-pulse">
                        <div className="flex items-start gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                            <div className="space-y-1.5 max-w-[70%]">
                                <div className="h-3 w-20 rounded bg-muted" />
                                <div className="h-9 w-44 rounded-2xl bg-muted" />
                            </div>
                        </div>
                        <div className="flex items-start justify-end gap-2.5">
                            <div className="space-y-1.5 items-end flex flex-col max-w-[70%]">
                                <div className="h-3 w-16 rounded bg-muted" />
                                <div className="h-9 w-36 rounded-2xl bg-primary/20" />
                            </div>
                            <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                        </div>
                        <div className="flex items-start gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                            <div className="space-y-1.5 max-w-[70%]">
                                <div className="h-3 w-24 rounded bg-muted" />
                                <div className="h-12 w-60 rounded-2xl bg-muted" />
                            </div>
                        </div>
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
                            variant={isRecording ? "destructive" : "outline"}
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={!user || isSendingAudio}
                            title={isRecording ? "Stop recording" : "Record audio"}
                        >
                            <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
                        </Button>
                        {isRecording && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-mono">
                                <span className="h-2 w-2 rounded-full bg-destructive animate-ping" />
                                <span>{Math.floor(recordingTime / 60)}:{recordingTime % 60 < 10 ? '0' : ''}{recordingTime % 60}</span>
                            </div>
                        )}
                        {audioPreview && !isRecording && (
                            <div className="flex items-center gap-2 p-1 rounded-lg border bg-muted/40">
                                <audio src={audioPreview} controls className="h-8 max-w-[180px] sm:max-w-[220px]" />
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => sendAudioMessage(sendFile, user)}
                                    disabled={isSendingAudio}
                                >
                                    {isSendingAudio ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                            {t("chat.sending")}
                                        </>
                                    ) : (
                                        "Send Audio"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={resetRecording}
                                    disabled={isSendingAudio}
                                    title="Discard audio"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
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
