"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfileData } from "@/types/user";

export async function fetchPublicCommunityUsers(maxCount = 500): Promise<UserProfileData[]> {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("isPublic", "==", true), limit(maxCount));
    const snapshot = await getDocs(q);

    const realUsers = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        displayName: data.displayName || data.email?.split("@")[0] || "Otaku Member",
        username: data.username || `@user_${docSnap.id.slice(0, 5)}`,
        photoURL: data.photoURL || data.googlePhotoURL || "",
        googlePhotoURL: data.googlePhotoURL || null,
        bio: data.bio || "",
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        level: Number(data.level || 1),
        rank: data.rank || "Novice Explorer",
        totalExp: Number(data.totalExp || 0),
        watchedCount: Number(data.watchedCount || 0),
        readingCount: Number(data.readingCount || 0),
        boardsCount: Number(data.boardsCount || 0),
        totalSaved: Number(data.totalSaved || 0),
        preferences: data.preferences,
      } as UserProfileData;
    });

    realUsers.sort((a, b) => {
      if ((b.boardsCount || 0) !== (a.boardsCount || 0)) {
        return (b.boardsCount || 0) - (a.boardsCount || 0);
      }
      if ((b.level || 1) !== (a.level || 1)) {
        return (b.level || 1) - (a.level || 1);
      }
      return (b.totalSaved || 0) - (a.totalSaved || 0);
    });

    return realUsers;
  } catch (err) {
    console.warn("Could not query community users from Firebase:", err);
    return [];
  }
}

export const communityUsersQueryOptions = (maxCount = 500) =>
  queryOptions<UserProfileData[]>({
    queryKey: ["communityUsers", maxCount],
    queryFn: () => fetchPublicCommunityUsers(maxCount),
    staleTime: 60_000,
  });

export function useCommunityUsers(maxCount = 500) {
  return useQuery<UserProfileData[]>({
    queryKey: ["communityUsers", maxCount],
    queryFn: () => fetchPublicCommunityUsers(maxCount),
    staleTime: 60_000,
  });
}
