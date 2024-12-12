import { useCallback, useEffect } from 'react'
import { db, storage } from '@/lib/firebase'
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useMessagesStore } from "@/store/use-messages-store"

export function useFirebaseChat(roomId: string) {
    const { messages, addMessage, setMessages, updateMessage, removeMessage } = useMessagesStore();

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
                .reverse()
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
                    type: 'text'
                })
                addMessage(roomId, {
                    id: docRef.id,
                    userId,
                    username,
                    message,
                    timestamp: Date.now(),
                    type: 'text'
                })
            } catch (error) {
                console.error('Error sending message:', error)
            }
        },
        [roomId, addMessage]
    )

    const sendFile = useCallback(
        async (file: File, userId: string, username: string) => {
            if (!roomId || !db || !storage) return
            try {
                const fileRef = ref(storage, `chatrooms/${roomId}/${Date.now()}_${file.name}`)
                await uploadBytes(fileRef, file)
                const downloadURL = await getDownloadURL(fileRef)

                const fileType = file.type.startsWith('image/') ? 'image' :
                    file.type.startsWith('video/') ? 'video' :
                        file.type.startsWith('audio/') ? 'audio' : 'file'

                const docRef = await addDoc(collection(db, 'chatrooms', roomId, 'messages'), {
                    userId,
                    username,
                    message: file.name,
                    timestamp: serverTimestamp(),
                    type: fileType,
                    fileUrl: downloadURL
                })
                addMessage(roomId, {
                    id: docRef.id,
                    userId,
                    username,
                    message: file.name,
                    timestamp: Date.now(),
                    type: fileType,
                    fileUrl: downloadURL
                })
            } catch (error) {
                console.error('Error sending file:', error)
            }
        },
        [roomId, addMessage]
    )

    const editMessage = useCallback(
        async (messageId: string, newContent: string) => {
            if (!roomId || !db) return
            try {
                await updateDoc(doc(db, 'chatrooms', roomId, 'messages', messageId), {
                    message: newContent
                })
                updateMessage(roomId, messageId, { message: newContent })
            } catch (error) {
                console.error('Error editing message:', error)
            }
        },
        [roomId, updateMessage]
    )

    const deleteMessage = useCallback(
        async (messageId: string) => {
            if (!roomId || !db) return
            try {
                await deleteDoc(doc(db, 'chatrooms', roomId, 'messages', messageId))
                removeMessage(roomId, messageId)
            } catch (error) {
                console.error('Error deleting message:', error)
            }
        },
        [roomId, removeMessage]
    )

    return {
        messages: messages[roomId] || [],
        sendMessage,
        sendFile,
        editMessage,
        deleteMessage,
    }
}

