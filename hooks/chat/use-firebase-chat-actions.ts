import { useCallback } from 'react'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    runTransaction,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { Room, RoomDetails } from '@/types/room'

function requireUser() {
    const user = auth.currentUser
    if (!user) throw new Error('You must be signed in to use chat.')
    return user
}

export function useFirebaseChatActions() {
    const createRoom = useCallback(async (title: string) => {
        const user = requireUser()
        const trimmedTitle = title.trim()
        if (!trimmedTitle) throw new Error('Room title is required.')

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
        const inviteRef = doc(collection(db, 'chatrooms', roomId, 'invites'))
        await setDoc(inviteRef, {
            userEmail: userEmail.trim().toLowerCase(),
            invitedBy: user.uid,
            invitedAt: serverTimestamp(),
        })
    }, [])

    const shareAnimeToChat = useCallback(
        async (
            roomId: string,
            animeData: { title: string; image: string; id: number }
        ) => {
            const user = requireUser()
            const messageRef = doc(collection(db, 'chatrooms', roomId, 'messages'))
            await setDoc(messageRef, {
                type: 'anime_share',
                animeData,
                message: '',
                userId: user.uid,
                username: user.displayName || user.email || 'Anonymous',
                timestamp: serverTimestamp(),
                createdAtClient: Date.now(),
            })
            return messageRef.id
        },
        []
    )

    const joinRoom = useCallback(async (roomId: string) => {
        const user = requireUser()
        const roomRef = doc(db, 'chatrooms', roomId)

        await runTransaction(db, async (transaction) => {
            const roomSnapshot = await transaction.get(roomRef)
            if (!roomSnapshot.exists()) throw new Error('Chat room not found.')

            const members = (roomSnapshot.data().members || []) as string[]
            if (members.includes(user.uid)) return

            const nextMembers = [...members, user.uid]
            transaction.update(roomRef, {
                members: nextMembers,
                memberCount: nextMembers.length,
            })
        })
    }, [])

    const getRooms = useCallback(async (): Promise<Room[]> => {
        requireUser()
        const querySnapshot = await getDocs(collection(db, 'chatrooms'))
        return querySnapshot.docs.map((roomSnapshot) => ({
            id: roomSnapshot.id,
            title: roomSnapshot.data().title,
            createdBy: roomSnapshot.data().createdBy,
            memberCount: roomSnapshot.data().memberCount || 0,
            members: roomSnapshot.data().members || [],
        }))
    }, [])

    const getRoomDetails = useCallback(
        async (roomId: string | null): Promise<RoomDetails | null> => {
            if (!roomId) return null
            requireUser()

            const roomSnapshot = await getDoc(doc(db, 'chatrooms', roomId))
            if (!roomSnapshot.exists()) return null

            return {
                title: roomSnapshot.data().title,
                createdBy: roomSnapshot.data().createdBy,
                memberCount: roomSnapshot.data().memberCount || 0,
                members: roomSnapshot.data().members || [],
            }
        },
        []
    )

    return {
        createRoom,
        inviteUser,
        shareAnimeToChat,
        getRooms,
        joinRoom,
        getRoomDetails,
    }
}
