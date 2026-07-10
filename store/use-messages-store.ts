import { create } from 'zustand'
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
            const uniqueMessages = new Map<string, Message>()

            ;[...messages, ...localMessages].forEach((message) => {
                uniqueMessages.set(message.id, message)
            })

            return {
                messages: {
                    ...state.messages,
                    [roomId]: Array.from(uniqueMessages.values()).sort(byTimestamp),
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
                        .slice(-120),
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
