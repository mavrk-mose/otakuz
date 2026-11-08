
import { serializeChannel } from "@/lib/query-state";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";

export type WatchHistoryType = "anime" | "manga" | "news" | "channel";

export interface WatchHistoryItem {
  id: string;
  itemId: string;
  type: WatchHistoryType;
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
  isExternal?: boolean;
  viewedAtMs: number;
  viewCount?: number;
}

export interface RecordWatchHistoryInput {
  itemId: string;
  type: WatchHistoryType;
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
  isExternal?: boolean;
}

const LOCAL_STORAGE_KEY = "otakuz-watch-history";
const LEGACY_CHANNEL_STORAGE_KEY = "otakuz-channel-history";
const MAX_LOCAL_ITEMS = 200;

export function toHistoryDocId(type: WatchHistoryType, itemId: string): string {
  const safeId = encodeURIComponent(String(itemId).trim())
    .replace(/\./g, "%2E")
    .replace(/%/g, "_")
    .slice(0, 180);
  return `${type}__${safeId || "item"}`;
}

export function readLocalWatchHistory(): WatchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed: WatchHistoryItem[] = raw ? JSON.parse(raw) : [];
    const valid = Array.isArray(parsed)
      ? parsed.filter((item) => item && item.id && item.title && item.href)
      : [];

    // Seed any pre-existing channel history if not already present
    const legacyRaw = window.localStorage.getItem(LEGACY_CHANNEL_STORAGE_KEY);
    if (legacyRaw) {
      try {
        const legacyParsed = JSON.parse(legacyRaw);
        const recentChannels = legacyParsed?.state?.recentlyViewed;
        if (Array.isArray(recentChannels) && recentChannels.length > 0) {
          const existingIds = new Set(valid.map((item) => item.id));
          let addedLegacy = false;
          for (const ch of recentChannels) {
            if (!ch?.channelId && !ch?.id) continue;
            const chKey = ch.channelId || ch.id;
            const docId = toHistoryDocId("channel", chKey);
            if (!existingIds.has(docId)) {
              existingIds.add(docId);
              addedLegacy = true;
              valid.push({
                id: docId,
                itemId: String(chKey),
                type: "channel",
                title: ch.name || String(chKey),
                subtitle: [ch.countryCode || "Global", ch.quality, "Live TV"]
                  .filter(Boolean)
                  .join(" • "),
                image: ch.logoUrl || "",
                href: serializeChannel("/channels", { channel: chKey }),
                viewedAtMs: typeof ch.viewedAt === "number" ? ch.viewedAt : Date.now(),
                viewCount: 1,
              });
            }
          }
          if (addedLegacy) {
            valid.sort((a, b) => b.viewedAtMs - a.viewedAtMs);
            window.localStorage.setItem(
              LOCAL_STORAGE_KEY,
              JSON.stringify(valid.slice(0, MAX_LOCAL_ITEMS))
            );
          }
        }
      } catch {
        // Ignore malformed legacy channel storage
      }
    }

    return valid.sort((a, b) => b.viewedAtMs - a.viewedAtMs);
  } catch {
    return [];
  }
}

function writeLocalWatchHistory(items: WatchHistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(items.slice(0, MAX_LOCAL_ITEMS))
    );
    window.dispatchEvent(new CustomEvent("otakuz-watch-history-updated"));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Saves an opened Anime, Manga, News story, or Channel to Watch History
 * silently in the background (both local cache and Firestore when signed in).
 */
export async function recordWatchHistory(
  input: RecordWatchHistoryInput,
  uidOverride?: string | null
): Promise<void> {
  if (typeof window === "undefined") return;
  if (!input.itemId || !input.title || !input.href) return;

  const docId = toHistoryDocId(input.type, input.itemId);
  const now = Date.now();

  // 1. Update local storage immediately so history is instant & resilient
  const currentLocal = readLocalWatchHistory();
  const prevMatch = currentLocal.find((item) => item.id === docId);
  const nextEntry: WatchHistoryItem = {
    id: docId,
    itemId: String(input.itemId),
    type: input.type,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || "",
    image: input.image || "",
    href: input.href,
    isExternal: Boolean(input.isExternal),
    viewedAtMs: now,
    viewCount: (prevMatch?.viewCount || 0) + 1,
  };

  const updatedLocal = [
    nextEntry,
    ...currentLocal.filter((item) => item.id !== docId),
  ].slice(0, MAX_LOCAL_ITEMS);
  writeLocalWatchHistory(updatedLocal);

  // 2. Persist in the background to Firestore for authenticated user
  const uid = uidOverride || auth.currentUser?.uid;
  if (!uid) return;

  try {
    const historyRef = doc(db, "users", uid, "watchHistory", docId);
    await setDoc(
      historyRef,
      {
        id: docId,
        itemId: nextEntry.itemId,
        type: nextEntry.type,
        title: nextEntry.title,
        subtitle: nextEntry.subtitle || "",
        image: nextEntry.image || "",
        href: nextEntry.href,
        isExternal: Boolean(nextEntry.isExternal),
        viewedAtMs: now,
        viewedAt: serverTimestamp(),
        viewCount: increment(1),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Background watch history sync skipped:", err);
  }
}

/**
 * Backfills any local watch history items that are not yet present in Firestore.
 */
export async function syncLocalHistoryToFirestore(
  uid: string,
  existingRemoteIds: Set<string>
): Promise<void> {
  if (!uid || typeof window === "undefined") return;
  const localItems = readLocalWatchHistory();
  const missing = localItems.filter((item) => !existingRemoteIds.has(item.id)).slice(0, 50);
  if (missing.length === 0) return;

  try {
    const batch = writeBatch(db);
    for (const item of missing) {
      const ref = doc(db, "users", uid, "watchHistory", item.id);
      batch.set(
        ref,
        {
          id: item.id,
          itemId: item.itemId,
          type: item.type,
          title: item.title,
          subtitle: item.subtitle || "",
          image: item.image || "",
          href: item.href,
          isExternal: Boolean(item.isExternal),
          viewedAtMs: item.viewedAtMs || Date.now(),
          viewedAt: serverTimestamp(),
          viewCount: item.viewCount || 1,
        },
        { merge: true }
      );
    }
    await batch.commit();
  } catch (err) {
    console.warn("Failed to backfill local watch history:", err);
  }
}

export async function removeWatchHistoryItem(
  docId: string,
  uid?: string | null
): Promise<void> {
  const filtered = readLocalWatchHistory().filter((item) => item.id !== docId);
  writeLocalWatchHistory(filtered);

  const activeUid = uid || auth.currentUser?.uid;
  if (!activeUid) return;

  await deleteDoc(doc(db, "users", activeUid, "watchHistory", docId));
}

export async function clearWatchHistory(uid?: string | null): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_CHANNEL_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent("otakuz-watch-history-updated"));
    } catch {
      // Ignore
    }
  }

  const activeUid = uid || auth.currentUser?.uid;
  if (!activeUid) return;

  const snap = await getDocs(collection(db, "users", activeUid, "watchHistory"));
  if (snap.empty) return;

  // Firestore batches support up to 500 operations
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db);
    docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}
