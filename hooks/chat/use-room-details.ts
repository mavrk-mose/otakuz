import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/use-auth'
import { getCachedRoom, putCachedRoom } from '@/lib/chat-cache'
import type { RoomDetails } from '@/types/room'

type RoomData = {
    title?: unknown
    createdBy?: unknown
    memberCount?: unknown
    members?: unknown
}

function toRoomDetails(data: RoomData): RoomDetails {
    return {
        title: typeof data.title === 'string' ? data.title : 'Untitled room',
        createdBy: typeof data.createdBy === 'string' ? data.createdBy : undefined,
        memberCount: typeof data.memberCount === 'number' ? data.memberCount : 0,
        members: Array.isArray(data.members) ? data.members as string[] : [],
    }
}

const useRoomDetails = (roomId: string | null) => {
    const { user } = useAuth()
    const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!roomId || !user) {
            setRoomDetails(null)
            setLoading(false)
            return
        }

        let isActive = true
        let unsubscribe = () => {}
        const userId = user.uid

        setRoomDetails(null)
        setLoading(true)
        setError(null)

        const startRoomListener = async () => {
            try {
                const cachedRoom = await getCachedRoom(userId, roomId)
                if (!isActive) return

                if (cachedRoom) {
                    setRoomDetails(toRoomDetails(cachedRoom))
                    setLoading(false)
                }
            } catch {
                // Fall through to Firestore when IndexedDB is unavailable.
            }

            if (!isActive) return

            unsubscribe = onSnapshot(
                doc(db, 'chatrooms', roomId),
                (snapshot) => {
                    if (!isActive) return

                    if (!snapshot.exists()) {
                        setRoomDetails(null)
                        setLoading(false)
                        return
                    }

                    const nextRoomDetails = toRoomDetails(snapshot.data())
                    setRoomDetails(nextRoomDetails)
                    setLoading(false)
                    setError(null)
                    void putCachedRoom(userId, roomId, nextRoomDetails).catch(() => undefined)
                },
                (snapshotError) => {
                    if (!isActive) return
                    setError(snapshotError)
                    setLoading(false)
                }
            )
        }

        void startRoomListener().catch((listenerError) => {
            if (!isActive) return
            setError(listenerError as Error)
            setLoading(false)
        })

        return () => {
            isActive = false
            unsubscribe()
        }
    }, [roomId, user])

    const refetch = useCallback(async () => {
        if (!roomId || !user) return null
        const snapshot = await getDoc(doc(db, 'chatrooms', roomId))
        if (!snapshot.exists()) {
            setRoomDetails(null)
            return null
        }

        const nextRoomDetails = toRoomDetails(snapshot.data())
        setRoomDetails(nextRoomDetails)
        await putCachedRoom(user.uid, roomId, nextRoomDetails).catch(() => undefined)
        return nextRoomDetails
    }, [roomId, user])

    return {
        roomDetails,
        loading,
        error,
        refetch,
    }
}

export default useRoomDetails
