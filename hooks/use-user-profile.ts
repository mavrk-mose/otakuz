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

const DEFAULT_PREFERENCES: UserPreferences = {
  language: "en",
  soundEffects: true,
  autoplayTrailers: true,
  adultFilter: false,
  defaultBoardPublic: true,
  emailNotifications: true,
};

export function useUserProfile(targetUserId?: string) {
  const { user: currentUser, setUser: setCurrentAuthUser } = useAuthStore();
  const effectiveUserId = targetUserId || currentUser?.uid;
  const isOwnProfile = !!currentUser && currentUser.uid === effectiveUserId;

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!effectiveUserId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, "users", effectiveUserId);

    // If viewing own profile, ensure doc exists and is synced with Google Auth
    const syncAndListen = async () => {
      try {
        if (isOwnProfile && currentUser) {
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            // Initial document creation: Take user's Google photo as default
            const initialData: UserProfileData = {
              uid: currentUser.uid,
              email: currentUser.email || null,
              displayName:
                currentUser.displayName ||
                currentUser.email?.split("@")[0] ||
                "Ren",
              username: `@${(
                currentUser.email?.split("@")[0] ||
                "otaku_" + currentUser.uid.slice(0, 5)
              ).toLowerCase()}`,
              photoURL: currentUser.photoURL || "",
              googlePhotoURL: currentUser.photoURL || null,
              bio: "Passionate anime explorer & manga enthusiast.",
              isPublic: true,
              level: 24,
              rank: "S-Rank Pioneer",
              totalExp: "1,450",
              watchedCount: 42,
              readingCount: 18,
              preferences: DEFAULT_PREFERENCES,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            };
            await setDoc(userDocRef, initialData);
          } else {
            // Already exists - update last login and ensure googlePhotoURL is recorded
            const existing = docSnap.data() as UserProfileData;
            const updates: Record<string, any> = {
              lastLoginAt: serverTimestamp(),
            };
            if (currentUser.photoURL && !existing.googlePhotoURL) {
              updates.googlePhotoURL = currentUser.photoURL;
            }
            if (!existing.photoURL && currentUser.photoURL) {
              updates.photoURL = currentUser.photoURL;
            }
            if (Object.keys(updates).length > 0) {
              await updateDoc(userDocRef, updates);
            }
          }
        }
      } catch (err: any) {
        console.warn("User profile sync warning:", err);
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
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Profile onSnapshot error:", err);
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
    },
    [effectiveUserId, isOwnProfile, setCurrentAuthUser]
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
    loading,
    error,
    isOwnProfile,
    updateProfileData,
    resetToGoogleAvatar,
    toggleProfileVisibility,
    updatePreferences,
  };
}
