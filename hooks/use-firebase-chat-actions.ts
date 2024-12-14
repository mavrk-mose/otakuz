import { useCallback } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'

export function useFirebaseChatActions() {
    const createRoom = useCallback(
        async (title: string) => {
            if (!db) return
            try {
                const docRef = await addDoc(collection(db, 'chatrooms'), {
                    title,
                    createdAt: serverTimestamp()
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

    return {
        createRoom,
        inviteUser,
        shareAnimeToChat,
        getRooms
    }
}

