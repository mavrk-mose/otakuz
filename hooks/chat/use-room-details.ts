import { roomCollection } from "@/lib/chat-room-path"
import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/use-auth'
import { getCachedRoom, putCachedRoom } from '@/lib/chat-cache'
import type { RoomDetails } from '@/types/room'

type RoomData = {
    photoURL?: unknown
    participantIds?: unknown
    title?: unknown
    createdBy?: unknown
    memberCount?: unknown
    members?: unknown
}

function toRoomDetails(data: RoomData): RoomDetails {
    return {
        photoURL: typeof data.photoURL === "string" ? data.photoURL : undefined,
        participantIds: Array.isArray(data.participantIds) ? data.participantIds as string[] : undefined,
        title: typeof data.title === 'string' ? data.title : 'Untitled room',
        createdBy: typeof data.createdBy === 'string' ? data.createdBy : undefined,
        memberCount: typeof data.memberCount === 'number' ? data.memberCount : 0,
        members: Array.isArray(data.members) ? data.members as string[] : [],
    }
}

const roomDetailsMemoryCache = new Map<string, RoomDetails>()

const useRoomDetails = (roomId: string | null) => {
    const { user } = useAuth()
    const cacheKey = `${user?.uid || ""}:${roomId || ""}`
    const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(() => {
        if (!roomId) return null
        return roomDetailsMemoryCache.get(cacheKey) || null
    })
    const [loading, setLoading] = useState(() => {
        if (!roomId) return false
        return !roomDetailsMemoryCache.has(cacheKey)
    })
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

        // If we already have the room details in memory, keep them and do not flash loading
        const cachedInMemory = roomDetailsMemoryCache.get(cacheKey)
        if (cachedInMemory) {
            setRoomDetails(cachedInMemory)
            setLoading(false)
        } else {
            setRoomDetails(null)
            setLoading(true)
        }
        setError(null)

        const startRoomListener = async () => {
            try {
                const cachedRoom = await getCachedRoom(userId, roomId)
                if (!isActive) return

                if (cachedRoom) {
                    const parsed = toRoomDetails(cachedRoom)
                    roomDetailsMemoryCache.set(cacheKey, parsed)
                    setRoomDetails(parsed)
                    setLoading(false)
                }
            } catch {
                // Fall through to Firestore when IndexedDB is unavailable.
            }

            if (!isActive) return

            unsubscribe = onSnapshot(
                doc(db, roomCollection(roomId), roomId),
                (snapshot) => {
                    if (!isActive) return

                    if (!snapshot.exists()) {
                        roomDetailsMemoryCache.delete(cacheKey)
                        setRoomDetails(null)
                        setLoading(false)
                        return
                    }

                    const nextRoomDetails = toRoomDetails(snapshot.data())
                    roomDetailsMemoryCache.set(cacheKey, nextRoomDetails)
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
    }, [cacheKey, roomId, user])

    const refetch = useCallback(async () => {
        if (!roomId || !user) return null
        const snapshot = await getDoc(doc(db, roomCollection(roomId), roomId))
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
