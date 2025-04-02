"use client"

import { db } from './firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export type NotificationType = 'chat' | 'anime' | 'article' | 'event' | 'product' | 'list';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

export async function createNotification(data: NotificationData) {
  try {
    const notificationRef = await addDoc(collection(db, 'notifications'), {
      ...data,
      read: false,
      timestamp: serverTimestamp(),
    });
    return notificationRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export async function markAllAsRead(userId: string) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        read: true,
        readAt: serverTimestamp(),
      })
    );
    
    await Promise.all(updates);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

export function createChatNotification(userId: string, roomName: string, message: string) {
  return createNotification({
    userId,
    type: 'chat',
    title: `New message in ${roomName}`,
    message,
    link: `/chat/${roomName}`,
  });
}

export function createEventNotification(userId: string, eventTitle: string, eventId: string) {
  return createNotification({
    userId,
    type: 'event',
    title: 'New Event',
    message: `A new event "${eventTitle}" has been announced!`,
    link: `/events/${eventId}`,
  });
}

export function createProductNotification(userId: string, productName: string, productId: string) {
  return createNotification({
    userId,
    type: 'product',
    title: 'New Product',
    message: `New product available: ${productName}`,
    link: `/shop/products/${productId}`,
  });
}

export function createListUpdateNotification(userId: string, listName: string, listId: string) {
  return createNotification({
    userId,
    type: 'list',
    title: 'List Updated',
    message: `New items have been added to "${listName}"`,
    link: `/lists/${listId}`,
  });
}