import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Message } from '@/types/message'

interface MessagesState {
    messages: { [roomId: string]: Message[] }
    upsertMessage: (roomId: string, message: Message) => void
    setMessages: (roomId: string, messages: Message[]) => void
    mergeMessages: (roomId: string, messages: Message[]) => void
    updateMessage: (roomId: string, messageId: string, updates: Partial<Message>) => void
    removeMessage: (roomId: string, messageId: string) => void
    clearMessages: () => void
}

const byTimestamp = (a: Message, b: Message) => a.timestamp - b.timestamp
const MAX_MESSAGES_PER_ROOM = 80
const MAX_PERSISTED_ROOMS = 25

function sanitizeForStorage(messagesByRoom: { [roomId: string]: Message[] }) {
    if (typeof window === 'undefined') return {}
    const sanitized: { [roomId: string]: Message[] } = {}
    const roomIds = Object.keys(messagesByRoom).slice(-MAX_PERSISTED_ROOMS)

    for (const roomId of roomIds) {
        const roomMessages = messagesByRoom[roomId] || []
        sanitized[roomId] = roomMessages
            .filter(
                (m) =>
                    m.deliveryStatus !== 'sending' &&
                    m.deliveryStatus !== 'error' &&
                    (!m.fileUrl || !m.fileUrl.startsWith('blob:'))
            )
            .slice(-MAX_MESSAGES_PER_ROOM)
    }
    return sanitized
}

export const useMessagesStore = create<MessagesState>()(
    persist(
        (set) => ({
            messages: {},
            upsertMessage: (roomId, message) =>
                set((state) => {
                    const currentMessages = state.messages[roomId] || []
                    const existingIndex = currentMessages.findIndex((item) => item.id === message.id)
                    const nextMessages = [...currentMessages]

                    if (existingIndex >= 0) {
                        nextMessages[existingIndex] = {
                            ...nextMessages[existingIndex],
                            ...message,
                        }
                    } else {
                        nextMessages.push(message)
                    }

                    return {
                        messages: {
                            ...state.messages,
                            [roomId]: nextMessages.sort(byTimestamp).slice(-MAX_MESSAGES_PER_ROOM),
                        },
                    }
                }),
            setMessages: (roomId, messages) =>
                set((state) => {
                    const snapshotIds = new Set(messages.map((message) => message.id))
                    const localMessages = (state.messages[roomId] || []).filter(
                        (message) =>
                            message.deliveryStatus !== 'sent' && !snapshotIds.has(message.id)
                    )
                    const uniqueMessages = new Map<string, Message>()

                    ;[...messages, ...localMessages].forEach((message) => {
                        uniqueMessages.set(message.id, message)
                    })

                    return {
                        messages: {
                            ...state.messages,
                            [roomId]: Array.from(uniqueMessages.values())
                                .sort(byTimestamp)
                                .slice(-MAX_MESSAGES_PER_ROOM),
                        },
                    }
                }),
            mergeMessages: (roomId, messages) =>
                set((state) => {
                    const mergedMessages = new Map<string, Message>()

                    ;(state.messages[roomId] || []).forEach((message) => {
                        mergedMessages.set(message.id, message)
                    })
                    messages.forEach((message) => {
                        mergedMessages.set(message.id, {
                            ...mergedMessages.get(message.id),
                            ...message,
                        })
                    })

                    return {
                        messages: {
                            ...state.messages,
                            [roomId]: Array.from(mergedMessages.values())
                                .sort(byTimestamp)
                                .slice(-MAX_MESSAGES_PER_ROOM),
                        },
                    }
                }),
            updateMessage: (roomId, messageId, updates) =>
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [roomId]: (state.messages[roomId] || []).map((message) =>
                            message.id === messageId ? { ...message, ...updates } : message
                        ),
                    },
                })),
            removeMessage: (roomId, messageId) =>
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [roomId]: (state.messages[roomId] || []).filter(
                            (message) => message.id !== messageId
                        ),
                    },
                })),
            clearMessages: () => set({ messages: {} }),
        }),
        {
            name: 'otakuz-chat-messages-cache',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                messages: sanitizeForStorage(state.messages),
            }),
        }
    )
)
