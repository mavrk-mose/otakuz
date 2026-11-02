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
  updateDoc,
  collectionGroup
} from 'firebase/firestore';

export type ListType = 'favorites' | 'watched' | 'planning' | 'custom';

export interface BookmarkList {
  id: string;
  name: string;
  type: ListType;
  items: BookmarkedItem[];
  createdAt: Date;
  updatedAt: Date;
  collaborative: boolean;
  public: boolean;
  collaborators: string[];
}

export interface BookmarkedItem {
  id: string;
  type: 'anime' | 'manga';
  title: string;
  image: string;
  addedAt: Date;
  addedBy?: string;
}

const ITEMS_PER_PAGE = 12;

export function useBookmarks(targetUserId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const effectiveUserId = targetUserId || user?.uid;
  const isOwner = !!user && user.uid === effectiveUserId;

  const { data: lists = [], isLoading: listsLoading } = useQuery({
    queryKey: ['lists', effectiveUserId, isOwner],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      
      let snapshot;
      try {
        if (isOwner) {
          const q = query(
            collection(db, 'users', effectiveUserId, 'lists'),
            orderBy('createdAt', 'desc')
          );
          snapshot = await getDocs(q);
        } else {
          const q = query(
            collection(db, 'users', effectiveUserId, 'lists'),
            where('public', '==', true)
          );
          snapshot = await getDocs(q);
        }
      } catch (err) {
        console.warn('Failed to query lists with sort/filter, falling back:', err);
        const q = collection(db, 'users', effectiveUserId, 'lists');
        snapshot = await getDocs(q);
      }

      const listsWithPreview = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const rawData = docSnap.data();
          const list = {
            id: docSnap.id,
            ...rawData,
            public: rawData.public !== undefined ? rawData.public : true,
          } as BookmarkList;

          // If viewing another user's profile and list is private, skip it
          if (!isOwner && list.public === false) {
            return null;
          }
    
          try {
            const itemsRef = collection(db, 'users', effectiveUserId, 'lists', list.id, 'items');
            const itemSnapshot = await getDocs(query(
              itemsRef, 
              orderBy('addedAt', 'desc'), 
              limit(4)
            ));
      
            const items = itemSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as BookmarkedItem[];
      
            return {
              ...list,
              items,
            };
          } catch (e) {
            return {
              ...list,
              items: [],
            };
          }
        })
      );
    
      return listsWithPreview.filter(Boolean) as BookmarkList[];
    },
    enabled: !!effectiveUserId
  });

  const useListItems = (listId: string) => {
    return useInfiniteQuery({
      queryKey: ['listItems', effectiveUserId, listId],
      queryFn: async ({ pageParam }: { pageParam?: DocumentSnapshot | null }) => {
        if (!effectiveUserId) return { items: [], lastDoc: null };
  
        const q = query(
          collection(db, 'users', effectiveUserId, 'lists', listId, 'items'),
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
      initialPageParam: null, 
      enabled: !!effectiveUserId && !!listId,
    });
  };

  const addToList = useMutation({
    mutationFn: async ({
      listId,
      item
    }: {
      listId: string;
      item: Omit<BookmarkedItem, 'addedAt' | 'addedBy'>;
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

      const listRef = doc(db, 'users', user.uid, 'lists', listId);

      await setDoc(bookmarkRef, {
        ...item,
        addedAt: serverTimestamp(),
        addedBy: user.uid,
      });

      await updateDoc(listRef, {
        updatedAt: serverTimestamp()
      });

      return { listId, item };
    },
    onSuccess: ({ listId }) => {
      queryClient.invalidateQueries({ queryKey: ['listItems', user?.uid, listId] });
      queryClient.invalidateQueries({ queryKey: ['lists', user?.uid] });
      if (effectiveUserId && effectiveUserId !== user?.uid) {
        queryClient.invalidateQueries({ queryKey: ['lists', effectiveUserId] });
      }
    },
  });

  const removeFromList = useMutation({
    mutationFn: async ({
      listId,
      itemId
    }: {
      listId: string;
      itemId: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      await deleteDoc(
        doc(db, 'users', user.uid, 'lists', listId, 'items', itemId)
      );

      const listRef = doc(db, 'users', user.uid, 'lists', listId);
      await updateDoc(listRef, {
        updatedAt: serverTimestamp()
      });

      return { listId, itemId };
    },
    onSuccess: ({ listId }) => {
      queryClient.invalidateQueries({ queryKey: ['listItems', user?.uid, listId] });
      queryClient.invalidateQueries({ queryKey: ['lists', user?.uid] });
      if (effectiveUserId && effectiveUserId !== user?.uid) {
        queryClient.invalidateQueries({ queryKey: ['lists', effectiveUserId] });
      }
    },
  });

  const createList = useMutation({
    mutationFn: async ({
      name,
      type = 'custom',
      isPublic = true,
    }: {
      name: string;
      type?: ListType;
      isPublic?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const listRef = doc(collection(db, 'users', user.uid, 'lists'));
      const newList: BookmarkList = {
        id: listRef.id,
        name,
        type,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        collaborative: false,
        public: isPublic,
        collaborators: []
      };

      await setDoc(listRef, {
        ...newList,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
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

  const useIsItemBookmarked = (itemId: string) => {
    const { user } = useAuth();
    
    return useQuery({
      queryKey: ['isBookmarked', user?.uid, itemId],
      queryFn: async () => {
        if (!user) return false;
        
        const itemsQuery = query(
          collectionGroup(db, 'items'),
          where('id', '==', itemId),
          where('addedBy', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(itemsQuery);
        return !querySnapshot.empty;
      },
      enabled: !!user && !!itemId,
    });
  };

  const updateListSettings = useMutation({
    mutationFn: async ({ listId, settings }: { listId: string; settings: Partial<BookmarkList> }) => {
      if (!user) throw new Error('User not authenticated');
      
      const listRef = doc(db, 'users', user.uid, 'lists', listId);
      await updateDoc(listRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
      
      return { listId, settings };
    },
    onSuccess: ({ listId }) => {
      queryClient.invalidateQueries({ queryKey: ['lists', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['listItems', user?.uid, listId] });
      if (effectiveUserId && effectiveUserId !== user?.uid) {
        queryClient.invalidateQueries({ queryKey: ['lists', effectiveUserId] });
      }
    },
  });

  return {
    lists,
    listsLoading,
    isOwner,
    useListItems,
    addToList: (listId: string, item: Omit<BookmarkedItem, 'addedAt'>) =>
      addToList.mutateAsync({ listId, item }),
    removeFromList: (listId: string, itemId: string) =>
      removeFromList.mutateAsync({ listId, itemId }),
    createList: (name: string, type?: ListType, isPublic: boolean = true) =>
      createList.mutateAsync({ name, type, isPublic }),
    deleteList: (listId: string) => deleteList.mutateAsync(listId),
    isBookmarked: useIsItemBookmarked,
    updateListSettings: (listId: string, settings: Partial<BookmarkList>) =>
      updateListSettings.mutateAsync({ listId, settings }),
  };
}
