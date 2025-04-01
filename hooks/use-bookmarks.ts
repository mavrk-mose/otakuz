"use client"

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  DocumentSnapshot,
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

const ITEMS_PER_PAGE = 12;

export function useBookmarks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: lists = [], isLoading: listsLoading } = useQuery({
    queryKey: ['lists', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      
      const q = query(
        collection(db, 'users', user.uid, 'lists'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BookmarkList[];
    },
    enabled: !!user
  });

  const useListItems = (listId: string) => {
    return useInfiniteQuery({
      queryKey: ['listItems', listId],
      queryFn: async ({ pageParam }: { pageParam?: DocumentSnapshot | null }) => {
        if (!user) return { items: [], lastDoc: null };
  
        const q = query(
          collection(db, 'users', user.uid, 'lists', listId, 'items'),
          orderBy('addedAt', 'desc'),
          limit(ITEMS_PER_PAGE),
          ...(pageParam ? [startAfter(pageParam)] : [])
        );
  
        const snapshot = await getDocs(q);
        const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
  
        return {
          items: snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as BookmarkedItem[],
          lastDoc
        };
      },
      getNextPageParam: (lastPage) => lastPage.lastDoc,
      initialPageParam: null, // Define the initial page parameter
      enabled: !!user && !!listId,
    });
  };

  const addToList = useMutation({
    mutationFn: async ({
      listId,
      item
    }: {
      listId: string;
      item: Omit<BookmarkedItem, 'addedAt'>;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const bookmarkRef = doc(
        db,
        'users',
        user.uid,
        'lists',
        listId,
        'items',
        item.id
      );

      await setDoc(bookmarkRef, {
        ...item,
        addedAt: serverTimestamp(),
      });

      return { listId, item };
    },
    onSuccess: ({ listId }) => {
      queryClient.invalidateQueries({ queryKey: ['listItems', listId] });
    },
  });

  const removeFromList = useMutation({
    mutationFn: async ({ listId, itemId }: { listId: string; itemId: string }) => {
      if (!user) throw new Error('User not authenticated');

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
      return { listId, itemId };
    },
    onSuccess: ({ listId }) => {
      queryClient.invalidateQueries({ queryKey: ['listItems', listId] });
    },
  });

  const createList = useMutation({
    mutationFn: async ({ name, type = 'custom' }: { name: string; type?: ListType }) => {
      if (!user) throw new Error('User not authenticated');

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
      return newList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', user?.uid] });
    },
  });

  const deleteList = useMutation({
    mutationFn: async (listId: string) => {
      if (!user) throw new Error('User not authenticated');
      await deleteDoc(doc(db, 'users', user.uid, 'lists', listId));
      return listId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', user?.uid] });
    },
  });

  return {
    lists,
    listsLoading,
    useListItems,
    addToList: (listId: string, item: Omit<BookmarkedItem, 'addedAt'>) =>
      addToList.mutateAsync({ listId, item }),
    removeFromList: (listId: string, itemId: string) =>
      removeFromList.mutateAsync({ listId, itemId }),
    createList: (name: string, type?: ListType) =>
      createList.mutateAsync({ name, type }),
    deleteList: (listId: string) => deleteList.mutateAsync(listId),
    isBookmarked: (itemId: string) =>
      lists.some(list => list.items.some(item => item.id === itemId))
  };
}