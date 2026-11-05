import { roomCollection } from "@/lib/chat-room-path"
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where,
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
import type { Message, MessageReply } from '@/types/message'
import {
    deleteCachedMessage,
    getCachedMessages,
    putCachedMessages,
} from '@/lib/chat-cache'

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
        photoURL: data.photoURL,
        replyTo: data.replyTo || undefined,
        message: data.message || '',
        timestamp: timestampToMillis(data.timestamp, createdAtClient),
        editedAt: timestampToMillis(data.editedAt, 0) || undefined,
        type: data.type || 'text',
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        animeData: data.animeData,
        mangaData: data.mangaData,
        productData: data.productData,
        eventData: data.eventData,
        profileData: data.profileData,
        deliveryStatus: snapshot.metadata.hasPendingWrites ? 'sending' : 'sent',
    }
}

function getMessageType(fileType: string): Message['type'] {
    if (fileType.startsWith('image/')) return 'image'
    if (fileType.startsWith('video/')) return 'video'
    if (fileType.startsWith('audio/')) return 'audio'
    return 'file'
}

function getExtensionForMimeType(mimeType: string, defaultType: string = 'file'): string {
    if (mimeType.startsWith('image/')) {
        const sub = mimeType.replace('image/', '').split(';')[0];
        return sub === 'jpeg' ? '.jpg' : `.${sub || 'png'}`;
    }
    if (mimeType.startsWith('video/')) {
        const sub = mimeType.replace('video/', '').split(';')[0];
        return `.${sub || 'mp4'}`;
    }
    if (mimeType.startsWith('audio/')) {
        if (mimeType.includes('mp4') || mimeType.includes('m4a') || mimeType.includes('aac')) return '.mp4';
        if (mimeType.includes('ogg')) return '.ogg';
        if (mimeType.includes('wav')) return '.wav';
        return '.webm';
    }
    return `.${defaultType}`;
}

export function useFirebaseChat(roomId: string) {
    const { user } = useAuth()
    const messagesByRoom = useMessagesStore((state) => state.messages)
    const setMessages = useMessagesStore((state) => state.setMessages)
    const mergeMessages = useMessagesStore((state) => state.mergeMessages)
    const upsertMessage = useMessagesStore((state) => state.upsertMessage)
    const updateMessage = useMessagesStore((state) => state.updateMessage)
    const removeMessage = useMessagesStore((state) => state.removeMessage)
    const [loading, setLoading] = useState(() => {
        const cached = useMessagesStore.getState().messages[roomId]
        return !cached || cached.length === 0
    })
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

        let isActive = true
        let unsubscribe = () => {}
        const userId = user.uid
        const messagesCollection = collection(db, roomCollection(roomId), roomId, 'messages')

        // Only indicate loading if there are no cached messages in memory
        const memoryMessages = useMessagesStore.getState().messages[roomId] || []
        if (memoryMessages.length === 0) {
            setLoading(true)
        } else {
            setLoading(false)
        }
        setError(null)

        const startListener = async () => {
            let messagesInState = useMessagesStore.getState().messages[roomId] || []

            // If in-memory store is empty, immediately attempt to read from IndexedDB
            if (messagesInState.length === 0) {
                try {
                    const cachedMessages = await getCachedMessages(userId, roomId)
                    if (cachedMessages.length > 0 && isActive) {
                        messagesInState = cachedMessages
                        setMessages(roomId, cachedMessages)
                        setLoading(false)
                    }
                } catch {
                    // IndexedDB is an enhancement. Firestore remains the fallback.
                }
            }

            if (!isActive) return

            if (messagesInState.length > 0) {
                setLoading(false)
                const lastSeenTimestamp = messagesInState.at(-1)?.timestamp || 0
                const deltaQuery = query(
                    messagesCollection,
                    where('timestamp', '>=', Timestamp.fromMillis(lastSeenTimestamp)),
                    orderBy('timestamp', 'asc')
                )

                unsubscribe = onSnapshot(
                    deltaQuery,
                    { includeMetadataChanges: true },
                    (snapshot) => {
                        if (!isActive) return

                        const changedMessages: Message[] = []
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'removed') {
                                removeMessage(roomId, change.doc.id)
                                void deleteCachedMessage(userId, roomId, change.doc.id).catch(
                                    () => undefined
                                )
                                return
                            }

                            changedMessages.push(snapshotToMessage(change.doc))
                        })

                        if (changedMessages.length > 0) {
                            mergeMessages(roomId, changedMessages)
                            void putCachedMessages(userId, roomId, changedMessages).catch(
                                () => undefined
                            )
                        }

                        setLoading(false)
                    },
                    (snapshotError) => {
                        if (!isActive) return
                        setError(snapshotError)
                        setLoading(false)
                    }
                )
            } else {
                // First-time visit to a room with 0 cached messages: listen directly via onSnapshot
                // without waiting for a separate blocking getDocs call.
                const initialQuery = query(
                    messagesCollection,
                    orderBy('timestamp', 'desc'),
                    limit(MAX_MESSAGES)
                )

                unsubscribe = onSnapshot(
                    initialQuery,
                    { includeMetadataChanges: true },
                    (snapshot) => {
                        if (!isActive) return

                        const liveMessages = snapshot.docs.map(snapshotToMessage).reverse()
                        setMessages(roomId, liveMessages)
                        setLoading(false)
                        void putCachedMessages(userId, roomId, liveMessages).catch(() => undefined)
                    },
                    (snapshotError) => {
                        if (!isActive) return
                        setError(snapshotError)
                        setLoading(false)
                    }
                )
            }
        }

        void startListener().catch((listenerError) => {
            if (!isActive) return
            setError(listenerError as Error)
            setLoading(false)
        })

        return () => {
            isActive = false
            unsubscribe()
        }
    }, [mergeMessages, removeMessage, roomId, setMessages, user])

    const sendMessage = useCallback(
        async (content: string, replyTo?: MessageReply) => {
            const trimmedContent = content.trim()
            if (!roomId || !user || !trimmedContent) {
                throw new Error('You must be signed in to send a message.')
            }

            const messageRef = doc(collection(db, roomCollection(roomId), roomId, 'messages'))
            const createdAtClient = Date.now()
            const optimisticMessage: Message = {
                id: messageRef.id,
                userId: user.uid,
                username: user.displayName || 'Anonymous',
                photoURL: user.photoURL || '',
                ...(replyTo ? { replyTo } : {}),
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
                    photoURL: optimisticMessage.photoURL || "",
                    ...(replyTo ? { replyTo } : {}),
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
        async (file: File | Blob, suppliedFileType?: string, replyTo?: MessageReply) => {
            if (!roomId || !user) {
                throw new Error('You must be signed in to send a file.')
            }

            const messageRef = doc(collection(db, roomCollection(roomId), roomId, 'messages'))
            const createdAtClient = Date.now()
            const fileType = suppliedFileType || file.type || 'application/octet-stream'
            const messageType = getMessageType(fileType)
            const safeType = messageType || 'file'
            const originalName = file instanceof File
                ? file.name
                : `${safeType}${getExtensionForMimeType(fileType, safeType)}`
            const safeFileName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_')
            const localUrl = URL.createObjectURL(file)
            const optimisticMessage: Message = {
                id: messageRef.id,
                userId: user.uid,
                username: user.displayName || 'Anonymous',
                photoURL: user.photoURL || '',
                ...(replyTo ? { replyTo } : {}),
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
                    `${roomCollection(roomId)}/${roomId}/${user.uid}/${messageRef.id}/${safeFileName}`
                )
                await uploadBytes(uploadedFileRef, file, { contentType: fileType })
                const downloadURL = await getDownloadURL(uploadedFileRef)

                updateMessage(roomId, messageRef.id, { fileUrl: downloadURL })
                await setDoc(messageRef, {
                    userId: optimisticMessage.userId,
                    username: optimisticMessage.username,
                    photoURL: optimisticMessage.photoURL || "",
                    ...(replyTo ? { replyTo } : {}),
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
                await updateDoc(doc(db, roomCollection(roomId), roomId, 'messages', messageId), {
                    message: trimmedContent,
                    editedAt: serverTimestamp(),
                })
                await putCachedMessages(user.uid, roomId, [
                    {
                        ...currentMessage,
                        message: trimmedContent,
                        editedAt: Date.now(),
                        deliveryStatus: 'sent',
                    },
                ]).catch(() => undefined)
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
                await deleteDoc(doc(db, roomCollection(roomId), roomId, 'messages', messageId))
                await deleteCachedMessage(user.uid, roomId, messageId).catch(() => undefined)
            } catch (deleteError) {
                const normalizedError = deleteError as Error
                upsertMessage(roomId, currentMessage)
                await putCachedMessages(user.uid, roomId, [currentMessage]).catch(
                    () => undefined
                )
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
                    doc(db, roomCollection(roomId), roomId, 'typing', user.uid),
                    {
                        userId: user.uid,
                        username: user.displayName || 'Anonymous',
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
