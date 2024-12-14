import { useCallback, useEffect } from 'react'
import { db, storage } from '@/lib/firebase'
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useMessagesStore } from "@/store/use-messages-store"

export function useFirebaseChat(roomId: string) {
    const { messages, addMessage, setMessages, updateMessage, removeMessage } = useMessagesStore()

    useEffect(() => {
        if (!roomId || !db) return

        const messagesQuery = query(
            collection(db, 'chatrooms', roomId, 'messages'),
            orderBy('timestamp', 'desc'),
            limit(50)
        )

        const typingQuery = query(collection(db, 'chatrooms', roomId, 'typing'))

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

        const unsubscribeTyping = onSnapshot(typingQuery, (snapshot) => {
            const typingUsers = snapshot.docs
                .filter((doc) => doc.data().isTyping)
                .map((doc) => doc.data().username)
            // Update UI with typing users
        })

        return () => {
            unsubscribeMessages()
            unsubscribeTyping()
        }
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

