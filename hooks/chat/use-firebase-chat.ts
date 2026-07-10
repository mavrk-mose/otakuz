import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    collection,
    deleteDoc,
    doc,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    type DocumentData,
    type QueryDocumentSnapshot,
} from 'firebase/firestore'
import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
    type StorageReference,
} from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { useAuth } from '@/hooks/use-auth'
import { useMessagesStore } from '@/store/use-messages-store'
import type { Message } from '@/types/message'

const MAX_MESSAGES = 50

function timestampToMillis(value: unknown, fallback: number) {
    if (
        value &&
        typeof value === 'object' &&
        'toMillis' in value &&
        typeof value.toMillis === 'function'
    ) {
        return value.toMillis()
    }

    return fallback
}

function snapshotToMessage(snapshot: QueryDocumentSnapshot<DocumentData>): Message {
    const data = snapshot.data()
    const createdAtClient =
        typeof data.createdAtClient === 'number' ? data.createdAtClient : Date.now()

    return {
        id: snapshot.id,
        userId: data.userId || '',
        username: data.username || 'Anonymous',
        message: data.message || '',
        timestamp: timestampToMillis(data.timestamp, createdAtClient),
        editedAt: timestampToMillis(data.editedAt, 0) || undefined,
        type: data.type || 'text',
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        animeData: data.animeData,
        deliveryStatus: snapshot.metadata.hasPendingWrites ? 'sending' : 'sent',
    }
}

function getMessageType(fileType: string): Message['type'] {
    if (fileType.startsWith('image/')) return 'image'
    if (fileType.startsWith('video/')) return 'video'
    if (fileType.startsWith('audio/')) return 'audio'
    return 'file'
}

export function useFirebaseChat(roomId: string) {
    const { user } = useAuth()
    const messagesByRoom = useMessagesStore((state) => state.messages)
    const setMessages = useMessagesStore((state) => state.setMessages)
    const upsertMessage = useMessagesStore((state) => state.upsertMessage)
    const updateMessage = useMessagesStore((state) => state.updateMessage)
    const removeMessage = useMessagesStore((state) => state.removeMessage)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const roomMessages = useMemo(
        () => messagesByRoom[roomId] || [],
        [messagesByRoom, roomId]
    )

    useEffect(() => {
        if (!roomId || !user) {
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        const messagesQuery = query(
            collection(db, 'chatrooms', roomId, 'messages'),
            orderBy('timestamp', 'desc'),
            limit(MAX_MESSAGES)
        )

        const unsubscribe = onSnapshot(
            messagesQuery,
            { includeMetadataChanges: true },
            (snapshot) => {
                const nextMessages = snapshot.docs.map(snapshotToMessage).reverse()
                setMessages(roomId, nextMessages)
                setLoading(false)
            },
            (snapshotError) => {
                setError(snapshotError)
                setLoading(false)
            }
        )

        return unsubscribe
    }, [roomId, setMessages, user])

    const sendMessage = useCallback(
        async (content: string) => {
            const trimmedContent = content.trim()
            if (!roomId || !user || !trimmedContent) {
                throw new Error('You must be signed in to send a message.')
            }

            const messageRef = doc(collection(db, 'chatrooms', roomId, 'messages'))
            const createdAtClient = Date.now()
            const optimisticMessage: Message = {
                id: messageRef.id,
                userId: user.uid,
                username: user.displayName || user.email || 'Anonymous',
                message: trimmedContent,
                timestamp: createdAtClient,
                type: 'text',
                deliveryStatus: 'sending',
            }

            upsertMessage(roomId, optimisticMessage)
            setError(null)

            try {
                await setDoc(messageRef, {
                    userId: optimisticMessage.userId,
                    username: optimisticMessage.username,
                    message: trimmedContent,
                    type: 'text',
                    timestamp: serverTimestamp(),
                    createdAtClient,
                })
                updateMessage(roomId, messageRef.id, { deliveryStatus: 'sent' })
            } catch (sendError) {
                const normalizedError = sendError as Error
                upsertMessage(roomId, {
                    ...optimisticMessage,
                    deliveryStatus: 'error',
                })
                setError(normalizedError)
                throw normalizedError
            }
        },
        [roomId, updateMessage, upsertMessage, user]
    )

    const sendFile = useCallback(
        async (file: File | Blob, suppliedFileType?: string) => {
            if (!roomId || !user) {
                throw new Error('You must be signed in to send a file.')
            }

            const messageRef = doc(collection(db, 'chatrooms', roomId, 'messages'))
            const createdAtClient = Date.now()
            const fileType = suppliedFileType || file.type || 'application/octet-stream'
            const messageType = getMessageType(fileType)
            const originalName = file instanceof File ? file.name : `${messageType}.webm`
            const safeFileName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_')
            const localUrl = URL.createObjectURL(file)
            const optimisticMessage: Message = {
                id: messageRef.id,
                userId: user.uid,
                username: user.displayName || user.email || 'Anonymous',
                message: '',
                timestamp: createdAtClient,
                type: messageType,
                fileUrl: localUrl,
                fileType,
                deliveryStatus: 'sending',
            }

            upsertMessage(roomId, optimisticMessage)
            setError(null)
            let uploadedFileRef: StorageReference | null = null

            try {
                uploadedFileRef = ref(
                    storage,
                    `chatrooms/${roomId}/${user.uid}/${messageRef.id}/${safeFileName}`
                )
                await uploadBytes(uploadedFileRef, file, { contentType: fileType })
                const downloadURL = await getDownloadURL(uploadedFileRef)

                updateMessage(roomId, messageRef.id, { fileUrl: downloadURL })
                await setDoc(messageRef, {
                    userId: optimisticMessage.userId,
                    username: optimisticMessage.username,
                    message: '',
                    type: messageType,
                    fileUrl: downloadURL,
                    fileType,
                    timestamp: serverTimestamp(),
                    createdAtClient,
                })
                updateMessage(roomId, messageRef.id, { deliveryStatus: 'sent' })
                URL.revokeObjectURL(localUrl)
            } catch (sendError) {
                const normalizedError = sendError as Error
                if (uploadedFileRef) {
                    await deleteObject(uploadedFileRef).catch(() => undefined)
                }
                upsertMessage(roomId, {
                    ...optimisticMessage,
                    deliveryStatus: 'error',
                })
                setError(normalizedError)
                throw normalizedError
            }
        },
        [roomId, updateMessage, upsertMessage, user]
    )

    const editMessage = useCallback(
        async (messageId: string, newContent: string) => {
            if (!roomId || !user) {
                throw new Error('You must be signed in to edit a message.')
            }

            const currentMessage = roomMessages.find((message) => message.id === messageId)
            if (!currentMessage || currentMessage.userId !== user.uid) {
                throw new Error('You can only edit your own messages.')
            }

            const trimmedContent = newContent.trim()
            const previousContent = currentMessage.message
            updateMessage(roomId, messageId, { message: trimmedContent })

            try {
                await updateDoc(doc(db, 'chatrooms', roomId, 'messages', messageId), {
                    message: trimmedContent,
                    editedAt: serverTimestamp(),
                })
            } catch (editError) {
                const normalizedError = editError as Error
                updateMessage(roomId, messageId, { message: previousContent })
                setError(normalizedError)
                throw normalizedError
            }
        },
        [roomId, roomMessages, updateMessage, user]
    )

    const deleteMessage = useCallback(
        async (messageId: string) => {
            if (!roomId || !user) {
                throw new Error('You must be signed in to delete a message.')
            }

            const currentMessage = roomMessages.find((message) => message.id === messageId)
            if (!currentMessage || currentMessage.userId !== user.uid) {
                throw new Error('You can only delete your own messages.')
            }

            removeMessage(roomId, messageId)

            try {
                await deleteDoc(doc(db, 'chatrooms', roomId, 'messages', messageId))
            } catch (deleteError) {
                const normalizedError = deleteError as Error
                upsertMessage(roomId, currentMessage)
                setError(normalizedError)
                throw normalizedError
            }
        },
        [removeMessage, roomId, roomMessages, upsertMessage, user]
    )

    const setTyping = useCallback(
        async (isTyping: boolean) => {
            if (!roomId || !user) return

            try {
                await setDoc(
                    doc(db, 'chatrooms', roomId, 'typing', user.uid),
                    {
                        userId: user.uid,
                        username: user.displayName || user.email || 'Anonymous',
                        isTyping,
                        timestamp: serverTimestamp(),
                    },
                    { merge: true }
                )
            } catch (typingError) {
                setError(typingError as Error)
            }
        },
        [roomId, user]
    )

    return {
        messages: roomMessages,
        loading,
        error,
        sendMessage,
        sendFile,
        editMessage,
        deleteMessage,
        setTyping,
    }
}
