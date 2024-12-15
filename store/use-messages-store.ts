import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {Message} from "@/types/message";

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
                            fileType: msg.fileType || undefined,
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
            name: 'messages-storage'
        }
    )
)

