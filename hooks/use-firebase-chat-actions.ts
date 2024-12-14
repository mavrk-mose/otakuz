import { useCallback } from 'react'
import { db } from '@/lib/firebase'
import {collection, addDoc, serverTimestamp, getDocs, updateDoc, arrayUnion, getDoc, doc} from 'firebase/firestore'

export function useFirebaseChatActions() {
    const createRoom = useCallback(
        async (title: string) => {
            if (!db) return
            try {
                const docRef = await addDoc(collection(db, 'chatrooms'), {
                    title,
                    createdAt: serverTimestamp(),
                    memberCount: 0,
                    members: []
                })
                return docRef.id
            } catch (error) {
                console.error('Error creating room:', error)
            }
        },
        []
    )

    const inviteUser = useCallback(
        async (roomId: string, userEmail: string) => {
            if (!db) return
            try {
                await addDoc(collection(db, 'chatrooms', roomId, 'invites'), {
                    userEmail,
                    invitedAt: serverTimestamp()
                })
            } catch (error) {
                console.error('Error inviting user:', error)
            }
        },
        []
    )

    const shareAnimeToChat = useCallback(
        async (roomId: string, animeData: { title: string; image: string; id: number }, userId: string) => {
            if (!db) return
            try {
                await addDoc(collection(db, 'chatrooms', roomId, 'messages'), {
                    type: 'anime_share',
                    animeData,
                    userId,
                    timestamp: serverTimestamp()
                })
            } catch (error) {
                console.error('Error sharing anime to chat:', error)
            }
        },
        []
    )

    const joinRoom = useCallback(
        async (roomId: string, userId: string) => {
            if (!db) return
            try {
                const roomRef = doc(db, 'chatrooms', roomId)
                await updateDoc(roomRef, {
                    members: arrayUnion(userId),
                    memberCount: (await getDoc(roomRef)).data()?.memberCount + 1 || 1
                })
            } catch (error) {
                console.error('Error joining room:', error)
            }
        },
        []
    )

    const getRooms = useCallback(
        async () => {
            if (!db) return []
            try {
                const querySnapshot = await getDocs(collection(db, 'chatrooms'))
                return querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    title: doc.data().title
                }))
            } catch (error) {
                console.error('Error getting rooms:', error)
                return []
            }
        },
        []
    )

    const getRoomDetails = useCallback(
        async (roomId: string | null) => {
            if (!db || !roomId) {
                return null
            }

            try {
                const docRef = doc(db, 'chatrooms', roomId)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    return {
                        title: docSnap.data().title,
                        memberCount: docSnap.data().memberCount || 0,
                        members: docSnap.data().members || []
                    }
                }
                return null
            } catch (error) {
                console.error('Error getting room details:', error)
                return null
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
        getRoomDetails
    }
}

