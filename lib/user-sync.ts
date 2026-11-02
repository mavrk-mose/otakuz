import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { UserProfileData, UserPreferences } from "@/types/user";

export const DEFAULT_PREFERENCES: UserPreferences = {
  language: "en",
  soundEffects: true,
  autoplayTrailers: true,
  adultFilter: false,
  defaultBoardPublic: true,
  emailNotifications: true,
};

export function getRankForLevel(level: number): string {
  if (level >= 30) return "Grandmaster Otaku";
  if (level >= 20) return "S-Rank Pioneer";
  if (level >= 10) return "A-Rank Strategist";
  if (level >= 5) return "B-Rank Scout";
  return "Novice Explorer";
}

import { query, where } from "firebase/firestore";

export async function calculateUserStats(userId: string, isOwner: boolean = true) {
  try {
    const listsRef = collection(db, "users", userId, "lists");
    const q = isOwner ? listsRef : query(listsRef, where("public", "==", true));
    const listsSnap = await getDocs(q);
    let watchedCount = 0;
    let readingCount = 0;
    let totalItems = 0;

    for (const listDoc of listsSnap.docs) {
      const itemsRef = collection(db, "users", userId, "lists", listDoc.id, "items");
      const itemsSnap = await getDocs(itemsRef);
      totalItems += itemsSnap.size;
      for (const itemDoc of itemsSnap.docs) {
        const item = itemDoc.data();
        if (item.type === "anime") {
          watchedCount++;
        } else if (item.type === "manga") {
          readingCount++;
        }
      }
    }

    const totalExp = totalItems * 50;
    const level = Math.max(1, Math.floor(totalExp / 100) + 1);
    const rank = getRankForLevel(level);

    return {
      boardsCount: listsSnap.size,
      watchedCount,
      readingCount,
      totalSaved: totalItems,
      totalExp,
      level,
      rank,
    };
  } catch (err) {
    console.warn("Failed to calculate user stats from database:", err);
    return {
      boardsCount: 0,
      watchedCount: 0,
      readingCount: 0,
      totalSaved: 0,
      totalExp: 0,
      level: 1,
      rank: "Novice Explorer",
    };
  }
}

export async function syncUserProfileToFirestore(user: User): Promise<void> {
  if (!user) return;
  try {
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);

    const stats = await calculateUserStats(user.uid);

    if (!docSnap.exists()) {
      const username = `@${(
        user.email?.split("@")[0] ||
        "user_" + user.uid.slice(0, 5)
      ).toLowerCase()}`;
      const displayName =
        user.displayName || user.email?.split("@")[0] || "Otaku Member";

      const initialData: UserProfileData = {
        uid: user.uid,
        email: user.email || null,
        displayName,
        username,
        photoURL: user.photoURL || "",
        googlePhotoURL: user.photoURL || null,
        bio: "",
        isPublic: true,
        level: stats.level,
        rank: stats.rank,
        totalExp: stats.totalExp,
        watchedCount: stats.watchedCount,
        readingCount: stats.readingCount,
        boardsCount: stats.boardsCount,
        totalSaved: stats.totalSaved,
        preferences: DEFAULT_PREFERENCES,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };
      await setDoc(userDocRef, initialData);
    } else {
      const existing = docSnap.data() as UserProfileData;
      const updates: Record<string, any> = {
        lastLoginAt: serverTimestamp(),
        level: stats.level,
        rank: stats.rank,
        totalExp: stats.totalExp,
        watchedCount: stats.watchedCount,
        readingCount: stats.readingCount,
        boardsCount: stats.boardsCount,
        totalSaved: stats.totalSaved,
      };
      if (existing.isPublic === undefined) {
        updates.isPublic = true;
      }
      if (user.photoURL && !existing.googlePhotoURL) {
        updates.googlePhotoURL = user.photoURL;
      }
      if (!existing.photoURL && user.photoURL) {
        updates.photoURL = user.photoURL;
      }
      await updateDoc(userDocRef, updates);
    }
  } catch (err) {
    console.warn("Failed to sync user profile to Firestore:", err);
  }
}
