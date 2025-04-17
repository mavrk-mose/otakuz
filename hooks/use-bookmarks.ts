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
      const listsWithPreview = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const list = { id: docSnap.id, ...docSnap.data() } as BookmarkList;
    
          const itemsRef = collection(db, 'users', user.uid, 'lists', list.id, 'items');
          const itemSnapshot = await getDocs(query(
            itemsRef, 
            orderBy('addedAt', 'desc'), 
            limit(1)
          ));
    
          const items = itemSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as BookmarkedItem[];
    
          return {
            ...list,
            items,
          };
        })
      );
    
      return listsWithPreview;
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
      initialPageParam: null, 
      enabled: !!user && !!listId,
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
        addedBy: user.uid
      });

      await updateDoc(listRef, {
        updatedAt: serverTimestamp(),
      });
  

      return { listId, item };
    },
    onSuccess: ({ listId }) => {
      queryClient.invalidateQueries({ queryKey: ['listItems', listId] });
      queryClient.invalidateQueries({ queryKey: ['lists', user?.uid] });
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

      const listRef = doc(db, 'users', user.uid, 'lists', listId);

      await deleteDoc(bookmarkRef);

      await updateDoc(listRef, {
        updatedAt: serverTimestamp(),
      });

      return { listId, itemId };
    },
    onSuccess: ({ listId }) => {
      queryClient.invalidateQueries({ queryKey: ['listItems', listId] });
      queryClient.invalidateQueries({ queryKey: ['lists', user?.uid] });
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
        updatedAt: new Date(),
        collaborative: false,
        public: false,
        collaborators: []
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
    isBookmarked: useIsItemBookmarked,
    updateListSettings: (listId: string, settings: Partial<BookmarkList>) =>
      updateListSettings.mutateAsync({ listId, settings }),
  };
}