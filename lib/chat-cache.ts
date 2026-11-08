import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Message } from '@/types/message';
import type { Room, RoomDetails } from '@/types/room';

const DATABASE_NAME = 'otakuz-chat-cache';
const MAX_CACHED_MESSAGES_PER_ROOM = 100;
type CachedMessage = Message & { cacheKey: string; roomKey: string; cachedAt: number };
type CachedRoom = Room & { cacheKey: string; userId: string; cachedAt: number };
interface ChatDatabase extends DBSchema {
  messages: { key: string; value: CachedMessage; indexes: { roomKey: string } };
  rooms: { key: string; value: CachedRoom; indexes: { userId: string } };
}
let databasePromise: Promise<IDBPDatabase<ChatDatabase>> | null = null;
const roomKey = (userId: string, roomId: string) => `${userId}:${roomId}`;

function openChatCache() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB is not available.'));
  if (!databasePromise) {
    // Retain version, stores, indexes, and keys so existing offline data stays readable.
    databasePromise = openDB<ChatDatabase>(DATABASE_NAME, 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('messages')) database.createObjectStore('messages', { keyPath: 'cacheKey' }).createIndex('roomKey', 'roomKey');
        if (!database.objectStoreNames.contains('rooms')) database.createObjectStore('rooms', { keyPath: 'cacheKey' }).createIndex('userId', 'userId');
      },
      blocking() { void databasePromise?.then(database => database.close()); databasePromise = null; },
      terminated() { databasePromise = null; },
    }).catch(error => { databasePromise = null; throw error; });
  }
  return databasePromise;
}

function fromCachedMessage(record: CachedMessage): Message {
  const { cacheKey: _cacheKey, roomKey: _roomKey, cachedAt: _cachedAt, ...message } = record;
  return message;
}
function fromCachedRoom(record: CachedRoom): Room {
  const { cacheKey: _cacheKey, userId: _userId, cachedAt: _cachedAt, ...room } = record;
  return room;
}
export async function getCachedMessages(userId: string, roomId: string) {
  const database = await openChatCache();
  const records = await database.getAllFromIndex('messages', 'roomKey', roomKey(userId, roomId));
  return records.map(fromCachedMessage).sort((a, b) => a.timestamp - b.timestamp).slice(-MAX_CACHED_MESSAGES_PER_ROOM);
}
export async function putCachedMessages(userId: string, roomId: string, messages: Message[]) {
  if (!messages.length) return;
  const database = await openChatCache();
  const transaction = database.transaction('messages', 'readwrite');
  const key = roomKey(userId, roomId);
  await Promise.all(messages.filter(message => message.deliveryStatus !== 'error' && message.deliveryStatus !== 'sending' && !message.fileUrl?.startsWith('blob:')).map(message => transaction.store.put({
    ...message, deliveryStatus: 'sent', cacheKey: `${key}:${message.id}`, roomKey: key, cachedAt: Date.now(),
  })));
  const records = (await transaction.store.index('roomKey').getAll(key)).sort((a, b) => b.timestamp - a.timestamp);
  await Promise.all(records.slice(MAX_CACHED_MESSAGES_PER_ROOM).map(message => transaction.store.delete(message.cacheKey)));
  await transaction.done;
}
export async function deleteCachedMessage(userId: string, roomId: string, messageId: string) {
  const database = await openChatCache();
  await database.delete('messages', `${roomKey(userId, roomId)}:${messageId}`);
}
export async function getCachedRooms(userId: string) {
  const database = await openChatCache();
  return (await database.getAllFromIndex('rooms', 'userId', userId)).sort((a, b) => b.cachedAt - a.cachedAt).map(fromCachedRoom);
}
export async function getCachedRoom(userId: string, roomId: string) {
  const database = await openChatCache();
  const record = await database.get('rooms', roomKey(userId, roomId));
  return record ? fromCachedRoom(record) : null;
}
export async function putCachedRoom(userId: string, roomId: string, room: RoomDetails) {
  const database = await openChatCache();
  await database.put('rooms', { id: roomId, ...room, cacheKey: roomKey(userId, roomId), userId, cachedAt: Date.now() });
}
export async function replaceCachedRooms(userId: string, rooms: Room[]) {
  const database = await openChatCache();
  const transaction = database.transaction('rooms', 'readwrite');
  const keys = await transaction.store.index('userId').getAllKeys(userId);
  await Promise.all(keys.map(key => transaction.store.delete(key)));
  await Promise.all(rooms.map(room => transaction.store.put({ ...room, cacheKey: roomKey(userId, room.id), userId, cachedAt: Date.now() })));
  await transaction.done;
}
