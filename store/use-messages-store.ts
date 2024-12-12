import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
    id: string
    userId: string
    message: string
    timestamp: number
    username?: string
}

interface MessagesState {
    messages: Record<string, Message[]>
    addMessage: (roomId: string, message: Message) => void
    setMessages: (roomId: string, messages: Message[]) => void
    clearMessages: (roomId: string) => void
    editMessage: (roomId: string, messageId: string, updatedMessage: string) => void
    deleteMessage: (roomId: string, messageId: string) => void
}

export const useMessagesStore = create<MessagesState>()(
    persist(
        (set) => ({
            messages: {},
            addMessage: (roomId, message) =>
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [roomId]: [...(state.messages[roomId] || []), message],
                    },
                })),
            setMessages: (roomId, messages) =>
                set((state) => ({
                    messages: { ...state.messages, [roomId]: messages },
                })),
            clearMessages: (roomId) =>
                set((state) => ({
                    messages: { ...state.messages, [roomId]: [] },
                })),
            editMessage: (roomId, messageId, updatedMessage) =>
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [roomId]: state.messages[roomId]?.map((msg) =>
                            msg.id === messageId ? { ...msg, message: updatedMessage } : msg
                        ) || [],
                    },
                })),
            deleteMessage: (roomId, messageId) =>
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [roomId]: state.messages[roomId]?.filter((msg) => msg.id !== messageId) || [],
                    },
                })),
        }),
        {
            name: 'chat-messages-storage',
        }
    )
)
