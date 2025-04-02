import { useCallback, useEffect, useState } from 'react'
import { db, storage } from '@/lib/firebase'
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, doc, setDoc, getDocs } from 'firebase/firestore'
import { ref as dbRef, push, set, onChildAdded, onChildChanged, onChildRemoved } from 'firebase/database'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useMessagesStore } from "@/store/use-messages-store"
import { useList } from 'react-firebase-hooks/database'

export function useFirebaseChat(roomId: string) {
    const { messages, addMessage, setMessages, updateMessage, removeMessage } = useMessagesStore();
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    
    useEffect(() => {
        if (!roomId || !db) return

        const messagesQuery = query(
            collection(db, 'chatrooms', roomId, 'messages'),
            orderBy('timestamp', 'desc'),
            limit(50)
        )

        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toMillis() || Date.now(),
                }))
                .reverse()
            setMessages(roomId, newMessages)
        })

        return () => unsubscribeMessages()
        
    }, [roomId, setMessages])

    const sendMessage = useCallback(
        async (message: string, userId: string, username: string) => {
            if (!roomId) return

            try {
                const messagesRef = collection(db, `chatrooms/${roomId}/messages`)
                await addDoc(messagesRef, {
                    userId,
                    username,
                    message,
                    timestamp: serverTimestamp(),
                    type: 'text'
                })
            } catch (error) {
                console.error('Error sending message:', error)
                setError(error as Error)
            }
        },
        [roomId]
    )

    const sendFile = useCallback(
        async (file: File | Blob, userId: string, username: string, fileType?: string) => {
          if (!roomId || !db || !storage) return
    
          try {
            const isAudio = fileType?.startsWith('audio/') || file.type.startsWith('audio/')
            const fileName = isAudio ? `audio_${Date.now()}.webm` : `${Date.now()}_${file.name || 'file'}`
            const storageRef = ref(storage, `chatrooms/${roomId}/${fileName}`)
            await uploadBytes(storageRef, file)
            const downloadURL = await getDownloadURL(storageRef)
    
            const docRef = await addDoc(collection(db, 'chatrooms', roomId, 'messages'), {
              userId,
              username,
              fileUrl: downloadURL,
              fileType: fileType || file.type,
              timestamp: serverTimestamp(),
            })
    
            addMessage(roomId, {
                message: "",
                id: docRef.id,
              userId,
              username,
              fileUrl: downloadURL,
              fileType: fileType || file.type,
              timestamp: Date.now()
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

    const setTyping = useCallback(
        async (userId: string, isTyping: boolean) => {
            if (!roomId || !db) return
            try {
                await setDoc(doc(db, 'chatrooms', roomId, 'typing', userId), {
                    isTyping,
                    timestamp: serverTimestamp()
                }, { merge: true })
            } catch (error) {
                console.error('Error updating typing status:', error)
            }
        },
        [roomId]
    )

    return {
        messages: messages[roomId] || [],
        sendMessage,
        sendFile,
        editMessage,
        deleteMessage,
        setTyping
    }
}

