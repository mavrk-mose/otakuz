"use client"

import { useQuery, useInfiniteQuery, useMutation, useQueryClient, useIsMutating, type InfiniteData } from '@tanstack/react-query';
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
  collectionGroup,
  writeBatch
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
  const bookmarkMutationKey = ['bookmarkWrite', user?.uid];
  const bookmarkPending = useIsMutating({ mutationKey: bookmarkMutationKey }) > 0;
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

  type ItemPages = InfiniteData<{ items: BookmarkedItem[]; lastDoc: DocumentSnapshot | null }>;
  // Cache list memberships, rather than just a boolean, so removing from one
  // board preserves the saved indicator when another board still contains it.
  const membershipKey = (itemId: string) => ['bookmarkLists', user?.uid, itemId];
  const optimisticItem = async (listId: string, itemId: string, item?: BookmarkedItem) => {
    const statusKey = membershipKey(itemId);
    const itemsKey = ['listItems', user?.uid, listId];
    const listsKey = ['lists', user?.uid];
    await Promise.all([
      queryClient.cancelQueries({ queryKey: statusKey }),
      queryClient.cancelQueries({ queryKey: itemsKey }),
      queryClient.cancelQueries({ queryKey: listsKey }),
    ]);
    const previousMembership = queryClient.getQueryData<string[]>(statusKey);
    const previousPages = queryClient.getQueriesData<ItemPages>({ queryKey: itemsKey });
    const previousLists = queryClient.getQueriesData<BookmarkList[]>({ queryKey: listsKey });
    const updateItems = (items: BookmarkedItem[]) => {
      const remaining = items.filter(existing => existing.id !== itemId);
      return item ? [item, ...remaining] : remaining;
    };
    queryClient.setQueryData<string[]>(statusKey, old => item
      ? Array.from(new Set([...(old ?? []), listId]))
      : (old ?? []).filter(id => id !== listId));
    queryClient.setQueriesData<ItemPages>({ queryKey: itemsKey }, old => old && ({
      ...old, pages: old.pages.map((page, index) => ({
        ...page, items: index === 0 ? updateItems(page.items) : page.items.filter(existing => existing.id !== itemId),
      })),
    }));
    queryClient.setQueriesData<BookmarkList[]>({ queryKey: listsKey }, old => old?.map(list => list.id === listId
      ? { ...list, items: updateItems(list.items).slice(0, 4) } : list));
    return { statusKey, previousMembership, previousPages, previousLists };
  };
  const rollbackItem = (_error: unknown, _variables: unknown, context?: Awaited<ReturnType<typeof optimisticItem>>) => {
    if (!context) return;
    if (context.previousMembership === undefined) queryClient.removeQueries({ queryKey: context.statusKey, exact: true });
    else queryClient.setQueryData(context.statusKey, context.previousMembership);
    for (const [key, data] of [...context.previousPages, ...context.previousLists]) queryClient.setQueryData(key, data);
  };
  const refreshItem = (listId: string, itemId: string) => {
    void queryClient.invalidateQueries({ queryKey: membershipKey(itemId) });
    void queryClient.invalidateQueries({ queryKey: ['listItems', user?.uid, listId] });
    void queryClient.invalidateQueries({ queryKey: ['lists', user?.uid] });
  };

  const addToList = useMutation({
    mutationKey: bookmarkMutationKey,
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

      const batch = writeBatch(db);
      batch.set(bookmarkRef, { ...item, addedAt: serverTimestamp(), addedBy: user.uid });
      batch.update(listRef, { updatedAt: serverTimestamp() });
      await batch.commit();

      return { listId, item };
    },
    onMutate: ({ listId, item }) => optimisticItem(listId, item.id, { ...item, addedAt: new Date(), addedBy: user?.uid }),
    onError: rollbackItem,
    onSettled: (_data, _error, { listId, item }) => refreshItem(listId, item.id),
  });

  const removeFromList = useMutation({
    mutationKey: bookmarkMutationKey,
    mutationFn: async ({
      listId,
      itemId
    }: {
      listId: string;
      itemId: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const batch = writeBatch(db);
      batch.delete(doc(db, 'users', user.uid, 'lists', listId, 'items', itemId));
      batch.update(doc(db, 'users', user.uid, 'lists', listId), { updatedAt: serverTimestamp() });
      await batch.commit();

      return { listId, itemId };
    },
    onMutate: ({ listId, itemId }) => optimisticItem(listId, itemId),
    onError: rollbackItem,
    onSettled: (_data, _error, { listId, itemId }) => refreshItem(listId, itemId),
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
    
    const result = useQuery({
      queryKey: membershipKey(itemId),
      queryFn: async () => {
        if (!user) return [];
        const itemsQuery = query(
          collectionGroup(db, 'items'),
          where('id', '==', itemId),
          where('addedBy', '==', user.uid)
        );
        const snapshot = await getDocs(itemsQuery);
        return Array.from(new Set(snapshot.docs.map(item => item.ref.parent.parent!.id)));
      },
      enabled: !!user && !!itemId,
    });
    return { ...result, data: Boolean(result.data?.length), listIds: result.data ?? [] };
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
    bookmarkPending,
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
