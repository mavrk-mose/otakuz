"use client";

import { create } from "zustand";
import {
  type User,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  onIdTokenChanged,
} from "firebase/auth";
import { app, auth } from "@/lib/firebase";
import { useMessagesStore } from "@/store/use-messages-store";
import { syncUserProfileToFirestore } from "@/hooks/auth/user-sync";

let firebaseUnsubscribe: (() => void) | null = null;
let authEventVersion = 0;
let lastSyncedUid: string | null = null;

export interface IAuth {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  signIn: (provider: string, credentials?: any) => Promise<User>;
  signOut: () => Promise<void>;
  subscribeAuth: () => () => void;
}

function attachFirebaseAuthListener(
  set: (partial: Partial<IAuth>) => void,
  get: () => IAuth,
): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!app) {
    set({ user: null, token: null, loading: false, initialized: true });
    return;
  }

  firebaseUnsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
    const currentVersion = ++authEventVersion;
    const previousUser = get().user;

    if (previousUser && previousUser.uid !== firebaseUser?.uid) {
      useMessagesStore.getState().clearMessages();
    }

    if (!firebaseUser) {
      lastSyncedUid = null;
      set({
        user: null,
        token: null,
        loading: false,
        initialized: true,
      });
      return;
    }

    try {
      const token = await firebaseUser.getIdToken();
      if (currentVersion !== authEventVersion) return;

      set({
        user: firebaseUser,
        token,
        loading: false,
        initialized: true,
      });

      if (lastSyncedUid !== firebaseUser.uid) {
        lastSyncedUid = firebaseUser.uid;
        syncUserProfileToFirestore(firebaseUser).catch(console.warn);
      }
    } catch {
      if (currentVersion !== authEventVersion) return;
      set({
        user: firebaseUser,
        token: null,
        loading: false,
        initialized: true,
      });
    }
  });
}

const useAuthStore = create<IAuth>((set, get) => ({
  user: null,
  token: null,
  loading: true,
  initialized: false,
  setUser: (user) => {
    if (typeof window === "undefined") return;
    set({ user });
  },
  signIn: async (provider: string, credentials?: any) => {
    if (typeof window === "undefined" || !app) {
      throw new Error("Authentication is only available in the browser.");
    }

    set({ loading: true });
    try {
      let result;
      switch (provider) {
        case "google":
          result = await signInWithPopup(auth, new GoogleAuthProvider());
          break;
        case "facebook":
          result = await signInWithPopup(auth, new FacebookAuthProvider());
          break;
        case "phone":
          if (!credentials || !credentials.phoneNumber || !credentials.appVerifier) {
            throw new Error("Phone sign-in requires phoneNumber and appVerifier");
          }
          result = await signInWithPhoneNumber(
            auth,
            credentials.phoneNumber,
            credentials.appVerifier,
          );
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      if ("user" in result) {
        const token = await result.user.getIdToken();
        lastSyncedUid = result.user.uid;
        set({
          user: result.user,
          token,
          loading: false,
          initialized: true,
        });
        syncUserProfileToFirestore(result.user).catch(console.warn);
        return result.user;
      }

      throw new Error("Sign-in failed");
    } catch (error) {
      console.error("Sign-in error:", error);
      set({ loading: false });
      throw error;
    }
  },
  signOut: async () => {
    if (typeof window === "undefined" || !app) return;

    try {
      ++authEventVersion;
      lastSyncedUid = null;
      await firebaseSignOut(auth);
      useMessagesStore.getState().clearMessages();
      set({
        user: null,
        token: null,
        loading: false,
        initialized: true,
      });
    } catch (error) {
      console.error("Sign-out error:", error);
      throw error;
    }
  },
  subscribeAuth: () => {
    if (typeof window === "undefined") {
      return () => {};
    }

    attachFirebaseAuthListener(set, get);

    return () => {
      firebaseUnsubscribe?.();
      firebaseUnsubscribe = null;
      // Ignore token requests still in flight after the provider unmounts.
      ++authEventVersion;
    };
  },
}));

export default useAuthStore;
