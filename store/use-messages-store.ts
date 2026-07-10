import { create } from 'zustand'
import type { Message } from '@/types/message'

interface MessagesState {
    messages: { [roomId: string]: Message[] }
    upsertMessage: (roomId: string, message: Message) => void
    setMessages: (roomId: string, messages: Message[]) => void
    updateMessage: (roomId: string, messageId: string, updates: Partial<Message>) => void
    removeMessage: (roomId: string, messageId: string) => void
    clearMessages: () => void
}

const byTimestamp = (a: Message, b: Message) => a.timestamp - b.timestamp

export const useMessagesStore = create<MessagesState>((set) => ({
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
                    [roomId]: nextMessages.sort(byTimestamp),
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

            return {
                messages: {
                    ...state.messages,
                    [roomId]: [...messages, ...localMessages].sort(byTimestamp),
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
}))
