import { create } from 'zustand';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPhoneNumber,
    signOut as firebaseSignOut
} from 'firebase/auth';

interface IAuth {
    user: User | null;
    loading: boolean;
    token: string | null;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setToken: (token: string | null) => void;
    signIn: (provider: string, credentials?: any) => Promise<User>;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
}

const useAuthStore = create<IAuth>((set, get) => ({
    user: null,
    token: null,
    loading: true,
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    setLoading: (loading) => set({ loading }),
    signIn: async (provider: string, credentials?: any) => {
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
                    result = await signInWithPhoneNumber(auth, credentials.phoneNumber, credentials.appVerifier);
                    break;
                default:
                    throw new Error(`Unsupported provider: ${provider}`);
            }

            if ('user' in result) {
                const token = await result.user.getIdToken();
                set({ user: result.user, token, loading: false });
                return result.user;
            } else {
                throw new Error('Sign-in failed');
            }
        } catch (error) {
            console.error('Sign-in error:', error);
            set({ loading: false });
            throw error;
        }
    },
    signOut: async () => {
        try {
            await firebaseSignOut(auth);
            set({ user: null, token: null });
        } catch (error) {
            console.error('Sign-out error:', error);
            throw error;
        }
    },
    initialize: async () => {
        return new Promise<void>((resolve) => {
            const unsubscribe = auth.onAuthStateChanged(async (user) => {
                if (user) {
                    const token = await user.getIdToken();
                    set({ user, token, loading: false });
                } else {
                    set({ user: null, token: null, loading: false });
                }
                unsubscribe();
                resolve();
            });
        });
    },
}));

export default useAuthStore;