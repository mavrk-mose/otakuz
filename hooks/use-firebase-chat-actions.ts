import { useCallback } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

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

    return {
        createRoom,
        inviteUser
    }
}
