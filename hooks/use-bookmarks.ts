"use client"

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import { useAnimeStore } from '@/store/use-anime-store';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

export type ListType = 'favorites' | 'watched' | 'planning' | 'custom';

export interface BookmarkList {
  id: string;
  name: string;
  type: ListType;
  items: BookmarkedItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BookmarkedItem {
  id: string;
  type: 'anime' | 'manga';
  title: string;
  image: string;
  addedAt: Date;
}

export function useBookmarks() {
  const { user } = useAuth();
  const [lists, setLists] = useState<BookmarkList[]>([]);
  const [loading, setLoading] = useState(true);
  const setBookmarkLoading = useAnimeStore((state) => state.setBookmarkLoading);

  useEffect(() => {
    if (!user) {
      setLists([]);
      setLoading(false);
      return;
    }

    const fetchLists = async () => {
      try {
        const q = query(
          collection(db, 'users', user.uid, 'lists')
        );
        const snapshot = await getDocs(q);
        const fetchedLists = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BookmarkList[];
        setLists(fetchedLists);
      } catch (error) {
        console.error('Error fetching lists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, [user]);

  const addToList = async (
    listId: string,
    item: Omit<BookmarkedItem, 'addedAt'>
  ) => {
    if (!user) return;

    setBookmarkLoading(item.id, true);
    try {
      const listRef = doc(db, 'users', user.uid, 'lists', listId);
      const bookmarkRef = doc(listRef, 'items', item.id);

      await setDoc(bookmarkRef, {
        ...item,
        addedAt: serverTimestamp(),
      });

      setLists(prev => prev.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: [...list.items, { ...item, addedAt: new Date() }]
          };
        }
        return list;
      }));
    } catch (error) {
      console.error('Error adding to list:', error);
    } finally {
      setBookmarkLoading(item.id, false);
    }
  };

  const removeFromList = async (listId: string, itemId: string) => {
    if (!user) return;

    setBookmarkLoading(itemId, true);
    try {
      const bookmarkRef = doc(
        db, 
        'users', 
        user.uid, 
        'lists', 
        listId, 
        'items', 
        itemId
      );
      await deleteDoc(bookmarkRef);

      setLists(prev => prev.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: list.items.filter(item => item.id !== itemId)
          };
        }
        return list;
      }));
    } catch (error) {
      console.error('Error removing from list:', error);
    } finally {
      setBookmarkLoading(itemId, false);
    }
  };

  const createList = async (name: string, type: ListType = 'custom') => {
    if (!user) return;

    try {
      const listRef = doc(collection(db, 'users', user.uid, 'lists'));
      const newList: BookmarkList = {
        id: listRef.id,
        name,
        type,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(listRef, newList);
      setLists(prev => [...prev, newList]);
      return newList;
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const deleteList = async (listId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'lists', listId));
      setLists(prev => prev.filter(list => list.id !== listId));
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const isBookmarked = (itemId: string) => {
    return lists.some(list => 
      list.items.some(item => item.id === itemId)
    );
  };

  return {
    lists,
    loading,
    addToList,
    removeFromList,
    createList,
    deleteList,
    isBookmarked
  };
}