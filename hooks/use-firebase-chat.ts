import { useEffect, useCallback } from 'react'
import { db } from '@/lib/firebase'
import {
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore'
import {Message, useMessagesStore} from "@/store/use-messages-store";

export function useFirebaseChat(roomId: string) {
    const { messages, addMessage, setMessages } = useMessagesStore()

    useEffect(() => {
        if (!roomId || !db) return

        const q = query(
            collection(db, 'chatrooms', roomId, 'messages'),
            orderBy('timestamp', 'desc'),
            limit(50)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toMillis() || Date.now(),
                }))
                .reverse() as Message[]

            setMessages(roomId, newMessages)
        })

        return () => unsubscribe()
    }, [roomId, setMessages])

    const sendMessage = useCallback(
        async (message: string, userId: string, username: string) => {
            if (!roomId || !db) return

            try {
                const docRef = await addDoc(collection(db, 'chatrooms', roomId, 'messages'), {
                    userId,
                    username,
                    message,
                    timestamp: serverTimestamp(),
                })

                addMessage(roomId, {
                    id: docRef.id,
                    userId,
                    username,
                    message,
                    timestamp: Date.now(),
                })
            } catch (error) {
                console.error('Error sending message:', error)
            }
        },
        [roomId, addMessage]
    )

    return {
        messages: messages[roomId] || [],
        sendMessage,
    }
}

