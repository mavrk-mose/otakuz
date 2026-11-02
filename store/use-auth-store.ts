'use client';

import { create } from 'zustand';
import {
    type User,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPhoneNumber,
    signOut as firebaseSignOut,
    onIdTokenChanged,
} from 'firebase/auth';
import { app, auth } from '@/lib/firebase';
import { useMessagesStore } from '@/store/use-messages-store';
import { syncUserProfileToFirestore } from '@/lib/user-sync';

let activeSubscribers = 0;
let firebaseUnsubscribe: (() => void) | null = null;
let authInitialization: Promise<void> | null = null;
let resolveInitialSession: (() => void) | null = null;
let authEventVersion = 0;
let lastSyncedUid: string | null = null;

export interface IAuth {
    user: User | null;
    loading: boolean;
    initialized: boolean;
    token: string | null;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setToken: (token: string | null) => void;
    signIn: (provider: string, credentials?: any) => Promise<User>;
    signOut: () => Promise<void>;
    subscribeAuth: () => () => void;
    initialize: () => Promise<void>;
}

function attachFirebaseAuthListener(
    set: (partial: Partial<IAuth>) => void,
    get: () => IAuth
): Promise<void> {
    if (typeof window === 'undefined') {
        return Promise.resolve();
    }

    if (!app) {
        set({ user: null, token: null, loading: false, initialized: true });
        return Promise.resolve();
    }

    if (firebaseUnsubscribe && authInitialization) {
        return authInitialization;
    }

    authInitialization = new Promise<void>((resolve) => {
        resolveInitialSession = resolve;
    });

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
            if (resolveInitialSession) {
                resolveInitialSession();
                resolveInitialSession = null;
            }
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
        } finally {
            if (resolveInitialSession) {
                resolveInitialSession();
                resolveInitialSession = null;
            }
        }
    });

    return authInitialization;
}

const useAuthStore = create<IAuth>((set, get) => ({
    user: null,
    token: null,
    loading: true,
    initialized: false,
    setUser: (user) => {
        if (typeof window === 'undefined') return;
        set({ user });
    },
    setToken: (token) => {
        if (typeof window === 'undefined') return;
        set({ token });
    },
    setLoading: (loading) => {
        if (typeof window === 'undefined') return;
        set({ loading });
    },
    signIn: async (provider: string, credentials?: any) => {
        if (typeof window === 'undefined' || !app) {
            throw new Error('Authentication is only available in the browser.');
        }

        set({ loading: true });
        try {
            let result;
            switch (provider) {
                case 'google':
                    result = await signInWithPopup(auth, new GoogleAuthProvider());
                    break;
                case 'facebook':
                    result = await signInWithPopup(auth, new FacebookAuthProvider());
                    break;
                case 'phone':
                    if (!credentials || !credentials.phoneNumber || !credentials.appVerifier) {
                        throw new Error('Phone sign-in requires phoneNumber and appVerifier');
                    }
                    result = await signInWithPhoneNumber(
                        auth,
                        credentials.phoneNumber,
                        credentials.appVerifier
                    );
                    break;
                default:
                    throw new Error(`Unsupported provider: ${provider}`);
            }

            if ('user' in result) {
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

            throw new Error('Sign-in failed');
        } catch (error) {
            console.error('Sign-in error:', error);
            set({ loading: false });
            throw error;
        }
    },
    signOut: async () => {
        if (typeof window === 'undefined' || !app) return;

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
            console.error('Sign-out error:', error);
            throw error;
        }
    },
    subscribeAuth: () => {
        if (typeof window === 'undefined') {
            return () => {};
        }

        activeSubscribers += 1;
        void attachFirebaseAuthListener(set, get);

        let unsubscribed = false;
        return () => {
            if (unsubscribed) return;
            unsubscribed = true;
            activeSubscribers = Math.max(0, activeSubscribers - 1);

            if (activeSubscribers === 0 && firebaseUnsubscribe) {
                firebaseUnsubscribe();
                firebaseUnsubscribe = null;
                authInitialization = null;
                if (resolveInitialSession) {
                    resolveInitialSession();
                    resolveInitialSession = null;
                }
            }
        };
    },
    initialize: async () => {
        return attachFirebaseAuthListener(set, get);
    },
}));

export default useAuthStore;
