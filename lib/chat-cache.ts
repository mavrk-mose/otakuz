import type { Message } from '@/types/message'
import type { Room, RoomDetails } from '@/types/room'

const DATABASE_NAME = 'otakuz-chat-cache'
const DATABASE_VERSION = 1
const MESSAGE_STORE = 'messages'
const ROOM_STORE = 'rooms'
const MAX_CACHED_MESSAGES_PER_ROOM = 100

type CachedMessage = Message & {
    cacheKey: string
    roomKey: string
    cachedAt: number
}

type CachedRoom = Room & {
    cacheKey: string
    userId: string
    cachedAt: number
}

let databasePromise: Promise<IDBDatabase> | null = null

function messageRoomKey(userId: string, roomId: string) {
    return `${userId}:${roomId}`
}

function roomCacheKey(userId: string, roomId: string) {
    return `${userId}:${roomId}`
}

function requestToPromise<T>(request: IDBRequest<T>) {
    return new Promise<T>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

function transactionToPromise(transaction: IDBTransaction) {
    return new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
    })
}

function openChatCache() {
    if (typeof indexedDB === 'undefined') {
        return Promise.reject(new Error('IndexedDB is not available.'))
    }

    if (databasePromise) return databasePromise

    databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

        request.onupgradeneeded = () => {
            const database = request.result

            if (!database.objectStoreNames.contains(MESSAGE_STORE)) {
                const messageStore = database.createObjectStore(MESSAGE_STORE, {
                    keyPath: 'cacheKey',
                })
                messageStore.createIndex('roomKey', 'roomKey', { unique: false })
            }

            if (!database.objectStoreNames.contains(ROOM_STORE)) {
                const roomStore = database.createObjectStore(ROOM_STORE, {
                    keyPath: 'cacheKey',
                })
                roomStore.createIndex('userId', 'userId', { unique: false })
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => {
            databasePromise = null
            reject(request.error)
        }
        request.onblocked = () => {
            databasePromise = null
            reject(new Error('The chat cache database upgrade was blocked.'))
        }
    })

    return databasePromise
}

function toCachedMessage(userId: string, roomId: string, message: Message): CachedMessage {
    return {
        ...message,
        deliveryStatus: 'sent',
        cacheKey: `${messageRoomKey(userId, roomId)}:${message.id}`,
        roomKey: messageRoomKey(userId, roomId),
        cachedAt: Date.now(),
    }
}

function fromCachedMessage(record: CachedMessage): Message {
    const { cacheKey: _cacheKey, roomKey: _roomKey, cachedAt: _cachedAt, ...message } = record
    return message
}

export async function getCachedMessages(userId: string, roomId: string) {
    const database = await openChatCache()
    const transaction = database.transaction(MESSAGE_STORE, 'readonly')
    const records = await requestToPromise(
        transaction
            .objectStore(MESSAGE_STORE)
            .index('roomKey')
            .getAll(IDBKeyRange.only(messageRoomKey(userId, roomId)))
    ) as CachedMessage[]

    return records
        .map(fromCachedMessage)
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-MAX_CACHED_MESSAGES_PER_ROOM)
}

export async function putCachedMessages(
    userId: string,
    roomId: string,
    messages: Message[]
) {
    if (messages.length === 0) return

    const database = await openChatCache()
    const transaction = database.transaction(MESSAGE_STORE, 'readwrite')
    const store = transaction.objectStore(MESSAGE_STORE)
    const roomKey = messageRoomKey(userId, roomId)

    messages
        .filter(
            (message) =>
                message.deliveryStatus !== 'error' &&
                message.deliveryStatus !== 'sending' &&
                !message.fileUrl?.startsWith('blob:')
        )
        .forEach((message) => store.put(toCachedMessage(userId, roomId, message)))

    const roomRecordsRequest = store.index('roomKey').getAll(IDBKeyRange.only(roomKey))
    roomRecordsRequest.onsuccess = () => {
        const roomRecords = (roomRecordsRequest.result as CachedMessage[]).sort(
            (a, b) => b.timestamp - a.timestamp
        )

        roomRecords
            .slice(MAX_CACHED_MESSAGES_PER_ROOM)
            .forEach((message) => store.delete(message.cacheKey))
    }

    await transactionToPromise(transaction)
}

export async function deleteCachedMessage(
    userId: string,
    roomId: string,
    messageId: string
) {
    const database = await openChatCache()
    const transaction = database.transaction(MESSAGE_STORE, 'readwrite')
    transaction
        .objectStore(MESSAGE_STORE)
        .delete(`${messageRoomKey(userId, roomId)}:${messageId}`)
    await transactionToPromise(transaction)
}

export async function getCachedRooms(userId: string) {
    const database = await openChatCache()
    const transaction = database.transaction(ROOM_STORE, 'readonly')
    const records = await requestToPromise(
        transaction.objectStore(ROOM_STORE).index('userId').getAll(IDBKeyRange.only(userId))
    ) as CachedRoom[]

    return records
        .sort((a, b) => b.cachedAt - a.cachedAt)
        .map(({ cacheKey: _cacheKey, userId: _userId, cachedAt: _cachedAt, ...room }) => room)
}

export async function getCachedRoom(userId: string, roomId: string) {
    const database = await openChatCache()
    const transaction = database.transaction(ROOM_STORE, 'readonly')
    const record = await requestToPromise(
        transaction.objectStore(ROOM_STORE).get(roomCacheKey(userId, roomId))
    ) as CachedRoom | undefined

    if (!record) return null
    const { cacheKey: _cacheKey, userId: _userId, cachedAt: _cachedAt, ...room } = record
    return room
}

export async function putCachedRoom(userId: string, roomId: string, room: RoomDetails) {
    const database = await openChatCache()
    const transaction = database.transaction(ROOM_STORE, 'readwrite')
    transaction.objectStore(ROOM_STORE).put({
        id: roomId,
        ...room,
        cacheKey: roomCacheKey(userId, roomId),
        userId,
        cachedAt: Date.now(),
    } satisfies CachedRoom)
    await transactionToPromise(transaction)
}

export async function replaceCachedRooms(userId: string, rooms: Room[]) {
    const database = await openChatCache()
    const transaction = database.transaction(ROOM_STORE, 'readwrite')
    const store = transaction.objectStore(ROOM_STORE)
    const existingKeysRequest = store.index('userId').getAllKeys(IDBKeyRange.only(userId))

    existingKeysRequest.onsuccess = () => {
        existingKeysRequest.result.forEach((key) => store.delete(key))
        rooms.forEach((room) => {
            store.put({
                ...room,
                cacheKey: roomCacheKey(userId, room.id),
                userId,
                cachedAt: Date.now(),
            } satisfies CachedRoom)
        })
    }

    await transactionToPromise(transaction)
}
