import { roomCollection } from "@/lib/chat-room-path"
import { useCallback } from 'react'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    runTransaction,
    serverTimestamp,
    setDoc,
    updateDoc,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { auth, db, storage } from '@/lib/firebase'
import type { Room, RoomDetails } from '@/types/room'
import type {
    AnimeShareData,
    MangaShareData,
    ProductShareData,
    EventShareData,
    ProfileShareData,
} from '@/types/message'

function requireUser() {
    const user = auth.currentUser
    if (!user) throw new Error('You must be signed in to use chat.')
    return user
}

export type ShareContentPayload =
    | { type: 'anime'; data: AnimeShareData }
    | { type: 'manga'; data: MangaShareData }
    | { type: 'product'; data: ProductShareData }
    | { type: 'event'; data: EventShareData }
    | { type: 'profile'; data: ProfileShareData }

function sanitizeForFirestore<T>(data: T): T {
    return JSON.parse(JSON.stringify(data, (_, v) => (v === undefined ? null : v)));
}

export function useFirebaseChatActions() {
    const createRoom = useCallback(async (title: string) => {
        const user = requireUser()
        const trimmedTitle = title.trim()
        if (!trimmedTitle || trimmedTitle.length > 200) throw new Error('Room title must contain 1–200 characters.')

        const roomRef = doc(collection(db, 'chatrooms'))
        await setDoc(roomRef, {
            title: trimmedTitle,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            memberCount: 1,
            members: [user.uid],
        })
        return roomRef.id
    }, [])

    const inviteUser = useCallback(async (roomId: string, userEmail: string) => {
        const user = requireUser()
        const inviteRef = doc(collection(db, roomCollection(roomId), roomId, 'invites'))
        await setDoc(inviteRef, {
            userEmail: userEmail.trim().toLowerCase(),
            invitedBy: user.uid,
            invitedAt: serverTimestamp(),
        })
    }, [])

    const shareAnimeToChat = useCallback(
        async (roomId: string, animeData: AnimeShareData) => {
            const user = requireUser()
            const messageRef = doc(collection(db, roomCollection(roomId), roomId, 'messages'))
            await setDoc(messageRef, {
                type: 'anime_share',
                animeData,
                message: '',
                userId: user.uid,
                username: user.displayName || 'Anonymous',
                photoURL: user.photoURL || '',
                timestamp: serverTimestamp(),
                createdAtClient: Date.now(),
            })
            return messageRef.id
        },
        []
    )

    const shareMangaToChat = useCallback(
        async (roomId: string, mangaData: MangaShareData) => {
            const user = requireUser()
            const messageRef = doc(collection(db, roomCollection(roomId), roomId, 'messages'))
            await setDoc(messageRef, {
                type: 'manga_share',
                mangaData,
                message: '',
                userId: user.uid,
                username: user.displayName || 'Anonymous',
                photoURL: user.photoURL || '',
                timestamp: serverTimestamp(),
                createdAtClient: Date.now(),
            })
            return messageRef.id
        },
        []
    )

    const shareProductToChat = useCallback(
        async (roomId: string, productData: ProductShareData) => {
            const user = requireUser()
            const messageRef = doc(collection(db, roomCollection(roomId), roomId, 'messages'))
            await setDoc(messageRef, {
                type: 'product_share',
                productData,
                message: '',
                userId: user.uid,
                username: user.displayName || 'Anonymous',
                photoURL: user.photoURL || '',
                timestamp: serverTimestamp(),
                createdAtClient: Date.now(),
            })
            return messageRef.id
        },
        []
    )

    const shareEventToChat = useCallback(
        async (roomId: string, eventData: EventShareData) => {
            const user = requireUser()
            const messageRef = doc(collection(db, roomCollection(roomId), roomId, 'messages'))
            await setDoc(messageRef, {
                type: 'event_share',
                eventData,
                message: '',
                userId: user.uid,
                username: user.displayName || 'Anonymous',
                photoURL: user.photoURL || '',
                timestamp: serverTimestamp(),
                createdAtClient: Date.now(),
            })
            return messageRef.id
        },
        []
    )

    const shareProfileToChat = useCallback(
        async (roomId: string, profileData: ProfileShareData) => {
            const user = requireUser()
            const messageRef = doc(collection(db, roomCollection(roomId), roomId, 'messages'))
            await setDoc(messageRef, {
                type: 'profile_share',
                profileData,
                message: '',
                userId: user.uid,
                username: user.displayName || 'Anonymous',
                photoURL: user.photoURL || '',
                timestamp: serverTimestamp(),
                createdAtClient: Date.now(),
            })
            return messageRef.id
        },
        []
    )

    const joinRoom = useCallback(async (roomId: string) => {
        const user = requireUser()
        const roomRef = doc(db, roomCollection(roomId), roomId)

        await runTransaction(db, async (transaction) => {
            const roomSnapshot = await transaction.get(roomRef)
            if (!roomSnapshot.exists()) throw new Error('Chat room not found.')

            if (roomCollection(roomId) === 'directChats' && !roomSnapshot.data().participantIds?.includes(user.uid)) throw new Error('This conversation is private.')
            const members = (roomSnapshot.data().members || []) as string[]
            if (members.includes(user.uid)) return

            const nextMembers = [...members, user.uid]
            transaction.update(roomRef, {
                members: nextMembers,
                memberCount: nextMembers.length,
            })
        })
    }, [])

    const shareContentToChat = useCallback(
        async (roomId: string, payload: ShareContentPayload) => {
            try {
                await joinRoom(roomId)
            } catch (err) {
                throw err
            }

            const cleanData = sanitizeForFirestore(payload.data)
            switch (payload.type) {
                case 'anime':
                    return shareAnimeToChat(roomId, cleanData as AnimeShareData)
                case 'manga':
                    return shareMangaToChat(roomId, cleanData as MangaShareData)
                case 'product':
                    return shareProductToChat(roomId, cleanData as ProductShareData)
                case 'event':
                    return shareEventToChat(roomId, cleanData as EventShareData)
                case 'profile':
                    return shareProfileToChat(roomId, cleanData as ProfileShareData)
            }
        },
        [joinRoom, shareAnimeToChat, shareMangaToChat, shareProductToChat, shareEventToChat, shareProfileToChat]
    )

    const getRooms = useCallback(async (): Promise<Room[]> => {
        requireUser()
        const querySnapshot = await getDocs(collection(db, 'chatrooms'))
        return querySnapshot.docs.map((roomSnapshot) => ({
            id: roomSnapshot.id,
            title: roomSnapshot.data().title,
            createdBy: roomSnapshot.data().createdBy,
            photoURL: roomSnapshot.data().photoURL,
            memberCount: roomSnapshot.data().memberCount || 0,
            members: roomSnapshot.data().members || [],
        }))
    }, [])

    const getRoomDetails = useCallback(
        async (roomId: string | null): Promise<RoomDetails | null> => {
            if (!roomId) return null
            requireUser()

            const roomSnapshot = await getDoc(doc(db, roomCollection(roomId), roomId))
            if (!roomSnapshot.exists()) return null

            return {
                title: roomSnapshot.data().title,
                createdBy: roomSnapshot.data().createdBy,
                photoURL: roomSnapshot.data().photoURL,
                participantIds: roomSnapshot.data().participantIds,
                memberCount: roomSnapshot.data().memberCount || 0,
                members: roomSnapshot.data().members || [],
            }
        },
        []
    )

    const leaveRoom = useCallback(async (roomId: string) => {
        const user = requireUser()
        const roomRef = doc(db, roomCollection(roomId), roomId)
        await runTransaction(db, async transaction => {
            const snapshot = await transaction.get(roomRef)
            if (!snapshot.exists()) throw new Error('Room not found.')
            const members = (snapshot.data().members as string[]).filter(id => id !== user.uid)
            transaction.update(roomRef, { members, memberCount: members.length })
        })
    }, [])

    const updateRoomImage = useCallback(async (roomId: string, file: File) => {
        const user = requireUser()
        const roomRef = doc(db, roomCollection(roomId), roomId)
        const room = await getDoc(roomRef)
        if (roomCollection(roomId) !== 'chatrooms' || room.data()?.createdBy !== user.uid) throw new Error('Only the room creator can change its image.')
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Choose a JPG, PNG, WebP, or GIF under 5 MB.')
        const imageRef = ref(storage, `room-images/${roomId}/${user.uid}/${crypto.randomUUID()}`)
        await uploadBytes(imageRef, file, { contentType: file.type })
        try {
            await updateDoc(roomRef, { photoURL: await getDownloadURL(imageRef) })
        } catch (error) {
            await deleteObject(imageRef).catch(() => undefined)
            throw error
        }
    }, [])

    const startDirectChat = useCallback(async (otherId: string, otherName: string) => {
        const user = requireUser()
        if (!otherId || otherId === user.uid) throw new Error('Choose another member to message.')
        const participants = [user.uid, otherId].sort()
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(participants)))
        const id = `dm_${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')}`
        const roomRef = doc(db, 'directChats', id)
        await runTransaction(db, async transaction => {
            const snapshot = await transaction.get(roomRef)
            if (snapshot.exists()) {
                const members = snapshot.data().members as string[]
                if (!members.includes(user.uid)) transaction.update(roomRef, { members: [...members, user.uid], memberCount: members.length + 1 })
            } else {
                transaction.set(roomRef, {
                    title: `${user.displayName || 'Member'} & ${otherName || 'Member'}`.slice(0, 200),
                    createdBy: user.uid, createdAt: serverTimestamp(),
                    participantIds: participants, members: participants, memberCount: 2,
                })
            }
        })
        return id
    }, [])

    return {
        createRoom,
        leaveRoom,
        updateRoomImage,
        startDirectChat,
        inviteUser,
        shareAnimeToChat,
        shareMangaToChat,
        shareProductToChat,
        shareEventToChat,
        shareProfileToChat,
        shareContentToChat,
        getRooms,
        joinRoom,
        getRoomDetails,
    }
}
