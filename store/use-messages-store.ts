import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
    id: string
    userId: string
    username: string
    message: string
    timestamp: number
    type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'anime_share' 
    fileUrl?: string
}

interface MessagesState {
    messages: { [roomId: string]: Message[] }
    addMessage: (roomId: string, message: Message) => void
    setMessages: (roomId: string, messages: { [p: string]: any; id: string; timestamp: number }[]) => void
    updateMessage: (roomId: string, messageId: string, updates: Partial<Message>) => void
    removeMessage: (roomId: string, messageId: string) => void
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
                    messages: {
                        ...state.messages,
                        [roomId]: messages.map((msg) => ({
                            ...msg,
                            userId: msg.userId || '',
                            username: msg.username || '',
                            message: msg.message || '',
                            type: msg.type || 'text',
                            fileUrl: msg.fileUrl || undefined,
                        })),
                    },
                })),
            updateMessage: (roomId, messageId, updates) =>
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [roomId]: state.messages[roomId].map((msg) =>
                            msg.id === messageId ? { ...msg, ...updates } : msg
                        ),
                    },
                })),
            removeMessage: (roomId, messageId) =>
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [roomId]: state.messages[roomId].filter((msg) => msg.id !== messageId),
                    },
                })),
        }),
        {
            name: 'messages-storage',
            getStorage: () => localStorage,
        }
    )
)

