"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import {
  clearWatchHistory,
  readLocalWatchHistory,
  recordWatchHistory,
  type RecordWatchHistoryInput,
  removeWatchHistoryItem,
  syncLocalHistoryToFirestore,
  toHistoryDocId,
  type WatchHistoryItem,
} from "@/lib/watch-history";

/**
 * Automatically logs an opened Anime, Manga, News article, or Channel
 * in the background without blocking rendering.
 */
export function useRecordWatchHistory(item: RecordWatchHistoryInput | null | undefined) {
  const { user } = useAuth();
  const recordedKeyRef = useRef<string | null>(null);
  const syncedUidKeyRef = useRef<string | null>(null);

  const itemKey = item?.itemId && item?.type ? toHistoryDocId(item.type, item.itemId) : null;

  useEffect(() => {
    if (!item || !itemKey) return;

    const uid = user?.uid ?? null;
    const compositeKey = `${itemKey}::${uid || "anon"}`;

    // Record once per distinct item visit; if auth finishes hydrating right after,
    // also ensure Firestore receives the record for the authenticated user.
    if (recordedKeyRef.current !== itemKey) {
      recordedKeyRef.current = itemKey;
      if (uid) syncedUidKeyRef.current = compositeKey;
      void recordWatchHistory(item, uid);
      return;
    }

    if (uid && syncedUidKeyRef.current !== compositeKey) {
      syncedUidKeyRef.current = compositeKey;
      void recordWatchHistory(item, uid);
    }
  }, [
    itemKey,
    user?.uid,
    item?.href,
    item?.image,
    item?.isExternal,
    item?.itemId,
    item?.subtitle,
    item?.title,
    item?.type,
  ]);
}

export function useWatchHistory(targetUserId?: string) {
  const { user } = useAuth();
  const isOwner = Boolean(user && (!targetUserId || targetUserId === user.uid));

  const [remoteItems, setRemoteItems] = useState<WatchHistoryItem[]>([]);
  const [localItems, setLocalItems] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const didBackfillRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOwner && targetUserId && user?.uid !== targetUserId) {
      setLocalItems([]);
      setRemoteItems([]);
      setLoading(false);
      return;
    }

    const syncLocal = () => {
      setLocalItems(readLocalWatchHistory());
    };

    syncLocal();
    window.addEventListener("otakuz-watch-history-updated", syncLocal);
    window.addEventListener("storage", syncLocal);

    return () => {
      window.removeEventListener("otakuz-watch-history-updated", syncLocal);
      window.removeEventListener("storage", syncLocal);
    };
  }, [isOwner, targetUserId, user?.uid]);

  useEffect(() => {
    if (!isOwner || !user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const historyCol = collection(db, "users", user.uid, "watchHistory");
    const q = query(historyCol, orderBy("viewedAtMs", "desc"), limit(150));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: WatchHistoryItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const tsMs =
            typeof data.viewedAtMs === "number"
              ? data.viewedAtMs
              : data.viewedAt?.toMillis?.() || Date.now();
          return {
            id: docSnap.id,
            itemId: String(data.itemId || docSnap.id),
            type: data.type || "anime",
            title: data.title || "Untitled",
            subtitle: data.subtitle || "",
            image: data.image || "",
            href: data.href || "/",
            isExternal: Boolean(data.isExternal),
            viewedAtMs: tsMs,
            viewCount: Number(data.viewCount || 1),
          };
        });

        setRemoteItems(docs);
        setLoading(false);

        if (didBackfillRef.current !== user.uid) {
          didBackfillRef.current = user.uid;
          const remoteIdSet = new Set(docs.map((d) => d.id));
          void syncLocalHistoryToFirestore(user.uid, remoteIdSet);
        }
      },
      (err) => {
        console.warn("Watch history listener notice:", err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOwner, user?.uid]);

  const items = useMemo(() => {
    if (!isOwner && targetUserId) return [];
    const byId = new Map<string, WatchHistoryItem>();
    for (const item of remoteItems) {
      byId.set(item.id, item);
    }
    for (const item of localItems) {
      const existing = byId.get(item.id);
      if (!existing || item.viewedAtMs > existing.viewedAtMs) {
        byId.set(item.id, item);
      }
    }
    return Array.from(byId.values()).sort((a, b) => b.viewedAtMs - a.viewedAtMs);
  }, [isOwner, localItems, remoteItems, targetUserId]);

  const removeItem = useCallback(
    async (docId: string) => {
      setRemoteItems((prev) => prev.filter((item) => item.id !== docId));
      setLocalItems((prev) => prev.filter((item) => item.id !== docId));
      await removeWatchHistoryItem(docId, user?.uid);
    },
    [user?.uid]
  );

  const clearAll = useCallback(async () => {
    setRemoteItems([]);
    setLocalItems([]);
    await clearWatchHistory(user?.uid);
  }, [user?.uid]);

  return {
    items,
    loading,
    isOwner,
    removeItem,
    clearAll,
  };
}
