"use client";

import { useState, useEffect, useCallback } from "react";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { updateProfile as firebaseUpdateProfile } from "firebase/auth";
import useAuthStore from "@/store/use-auth-store";
import { UserProfileData, UserPreferences } from "@/types/user";
import {
  calculateUserStats,
  DEFAULT_PREFERENCES,
  getRankForLevel,
} from "@/lib/user-sync";

export function useUserProfile(targetUserId?: string) {
  const { user: currentUser, setUser: setCurrentAuthUser } = useAuthStore();
  const effectiveUserId = targetUserId || currentUser?.uid;
  const isOwnProfile = !!currentUser && currentUser.uid === effectiveUserId;

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [stats, setStats] = useState({
    boardsCount: 0,
    watchedCount: 0,
    readingCount: 0,
    totalSaved: 0,
    totalExp: 0,
    level: 1,
    rank: "Novice Explorer",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Compute real stats from Firebase for effective user
  const refreshStats = useCallback(async () => {
    if (!effectiveUserId) return;
    try {
      const realStats = await calculateUserStats(effectiveUserId, isOwnProfile);
      setStats(realStats);
      return realStats;
    } catch (e) {
      console.warn("Failed to refresh stats from database:", e);
    }
  }, [effectiveUserId, isOwnProfile]);

  useEffect(() => {
    if (!effectiveUserId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, "users", effectiveUserId);

    // Initial sync and calculation
    const syncAndListen = async () => {
      try {
        const currentStats = await calculateUserStats(effectiveUserId, isOwnProfile);
        setStats(currentStats);

        if (isOwnProfile && currentUser) {
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            const displayName =
              currentUser.displayName ||
              currentUser.email?.split("@")[0] ||
              "Otaku Member";
            const username = `@${(
              currentUser.email?.split("@")[0] ||
              "user_" + currentUser.uid.slice(0, 5)
            ).toLowerCase()}`;

            const initialData: UserProfileData = {
              uid: currentUser.uid,
              email: currentUser.email || null,
              displayName,
              username,
              photoURL: currentUser.photoURL || "",
              googlePhotoURL: currentUser.photoURL || null,
              bio: "",
              isPublic: true,
              level: currentStats.level,
              rank: currentStats.rank,
              totalExp: currentStats.totalExp,
              watchedCount: currentStats.watchedCount,
              readingCount: currentStats.readingCount,
              boardsCount: currentStats.boardsCount,
              totalSaved: currentStats.totalSaved,
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
              level: currentStats.level,
              rank: currentStats.rank,
              totalExp: currentStats.totalExp,
              watchedCount: currentStats.watchedCount,
              readingCount: currentStats.readingCount,
              boardsCount: currentStats.boardsCount,
              totalSaved: currentStats.totalSaved,
            };
            if (currentUser.photoURL && !existing.googlePhotoURL) {
              updates.googlePhotoURL = currentUser.photoURL;
            }
            if (!existing.photoURL && currentUser.photoURL) {
              updates.photoURL = currentUser.photoURL;
            }
            await updateDoc(userDocRef, updates);
          }
        }
      } catch (err: any) {
        console.warn("User profile sync error:", err);
      }
    };

    syncAndListen();

    // Listen to real-time changes
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfileData;
          setProfile(data);
          if (data.level && data.rank) {
            setStats((prev) => ({
              ...prev,
              level: data.level,
              rank: data.rank,
              totalExp: Number(data.totalExp || 0),
              watchedCount: data.watchedCount ?? prev.watchedCount,
              readingCount: data.readingCount ?? prev.readingCount,
              boardsCount: data.boardsCount ?? prev.boardsCount,
              totalSaved: data.totalSaved ?? prev.totalSaved,
            }));
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (err) => {
        console.warn("Profile onSnapshot notice:", err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [effectiveUserId, isOwnProfile, currentUser?.uid]);

  const updateProfileData = useCallback(
    async (updates: Partial<UserProfileData>) => {
      if (!isOwnProfile || !effectiveUserId) {
        throw new Error("Cannot update profile of another user");
      }

      const userDocRef = doc(db, "users", effectiveUserId);
      const payload: Record<string, any> = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userDocRef, payload);

      // Sync Firebase Auth profile if displayName or photoURL changed
      if (
        auth.currentUser &&
        (updates.displayName !== undefined || updates.photoURL !== undefined)
      ) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName:
            updates.displayName !== undefined
              ? updates.displayName
              : auth.currentUser.displayName,
          photoURL:
            updates.photoURL !== undefined
              ? updates.photoURL
              : auth.currentUser.photoURL,
        });
        setCurrentAuthUser({ ...auth.currentUser });
      }

      await refreshStats();
    },
    [effectiveUserId, isOwnProfile, setCurrentAuthUser, refreshStats]
  );

  const resetToGoogleAvatar = useCallback(async () => {
    if (!isOwnProfile || !effectiveUserId) return;
    const googleAvatar =
      profile?.googlePhotoURL || currentUser?.photoURL || "";
    await updateProfileData({ photoURL: googleAvatar });
  }, [
    effectiveUserId,
    isOwnProfile,
    profile?.googlePhotoURL,
    currentUser?.photoURL,
    updateProfileData,
  ]);

  const toggleProfileVisibility = useCallback(
    async (isPublic: boolean) => {
      await updateProfileData({ isPublic });
    },
    [updateProfileData]
  );

  const updatePreferences = useCallback(
    async (newPreferences: Partial<UserPreferences>) => {
      if (!profile) return;
      const merged = {
        ...DEFAULT_PREFERENCES,
        ...(profile.preferences || {}),
        ...newPreferences,
      };
      await updateProfileData({ preferences: merged });
    },
    [profile, updateProfileData]
  );

  return {
    profile,
    stats,
    loading,
    error,
    isOwnProfile,
    refreshStats,
    updateProfileData,
    resetToGoogleAvatar,
    toggleProfileVisibility,
    updatePreferences,
  };
}
