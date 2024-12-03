import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';

export async function sendMessage(roomId: string, userId: string, message: string) {
  try {
    if (!db) {
        throw new Error('Firestore instance is not initialized.');
    }

    await addDoc(collection(db, 'chatrooms', roomId, 'messages'), {
      userId,
      message,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function getChatHistory(roomId: string, fetchLimit = 50) {
  try {
    if (!db) {
        throw new Error('Firestore instance is not initialized.');
    }

    const q = query(
      collection(db, 'chatrooms', roomId, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(fetchLimit)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
}

export async function createChatRoom(animeId: string, title: string) {
  try {
    if (!db) {
        throw new Error('Firestore instance is not initialized.');
    }

    const roomRef = await addDoc(collection(db, 'chatrooms'), {
      animeId,
      title,
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageAt: null,
    });
    return roomRef.id;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
}

export async function getChatRooms(animeId?: string) {
  try {
    if (!db) {
        throw new Error('Firestore instance is not initialized.');
    }

    const q = animeId
      ? query(collection(db, 'chatrooms'), where('animeId', '==', animeId))
      : query(collection(db, 'chatrooms'), orderBy('lastMessageAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting chat rooms:', error);
    throw error;
  }
}